
require('babel-polyfill');
const { exit, rpc } = require('../lib/cron');
const { forEach } = require('p-iteration');
// Models.
const Block = require('../model/block');
const TX = require('../model/tx');
const TXOut = require('../model/txout');

/**
 * Process the blocks and transactions.
 * @param {Number} current The current starting block height.
 * @param {Number} stop The current block height at the tip of the chain.
 */
async function syncBlocks(current, stop) {
  let block, hash, rpcblock;
  for(let height = current; height < stop; height++) {
    hash = await rpc.call('getblockhash', [height]);
    rpcblock = await rpc.call('getblock', [hash]);

    block = new Block({
      hash,
      height,
      bits: rpcblock.bits,
      confirmations: rpcblock.confirmations,
      createdAt: new Date(rpcblock.time * 1000),
      diff: rpcblock.difficulty,
      merkle: rpcblock.merkleroot,
      nonce: rpcblock.nonce,
      prev: rpcblock.prevblockhash,
      size: rpcblock.size,
      txs: rpcblock.tx ? rpcblock.tx : [],
      ver: rpcblock.version
    });

    await block.save();

    // Ignore the genesis block.
    if (block.height) {
      let hex, outs, rpctx, tx, vout;
      await forEach(block.txs, async (txhash) => {
        hex = await rpc.call('getrawtransaction', [txhash]);
        rpctx = await rpc.call('decoderawtransaction', [hex]);

        // Setup the vin transactions by updating the
        // txsout table marking as spent.
        if (rpctx.vin) {
          await forEach(rpctx.vin, async (vi) => {
            await TXOut.update(
              { txid: vi.txid, vout: vi.vout },
              { $set: { spendTx: txhash } }
            );
          });
        }

        // Setup the vout transactions and build total.
        outs = [];
        vout = 0.0;
        if (rpctx.vout) {
          rpctx.vout.forEach((vo) => {
            vout += vo.value;

            if (vo.addresses && vo.addresses.length) {
              outs.push(new TXOut({
                addresses: vo.addresses,
                txid: rpctx.txid,
                value: vo.value,
                vout: vo.n
              }));
            }
          });

          if (outs.length) {
            await TXOut.insertMany(outs);
          }
        }

        tx = new TX({
          vout,
          block: hash,
          createdAt: block.createdAt,
          hash: rpctx.txid,
          height: block.height,
          recipients: rpctx.vout.length,
          ver: rpctx.version
        });

        await tx.save();
      });
    }

    console.log(`Height: ${ block.height } Hash: ${ block.hash }`);
  }
}

/**
 * Get blockchain information from node and
 * update the database with the node.
 */
async function update() {
  try {
    const info = await rpc.call('getinfo');
    const block = await Block.findOne().sort({ height: - 1});
    const height = block && block.height ? block.height : 0;

    await syncBlocks(height, info.blocks);
  } catch(err) {
    console.log(err);
    exit(1);
  }

  exit();
}

update();
