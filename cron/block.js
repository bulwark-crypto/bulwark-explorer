
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
  if (current > 0) {
    current++;
  }

  for(let height = current; height <= stop; height++) {
    const hash = await rpc.call('getblockhash', [height]);
    const rpcblock = await rpc.call('getblock', [hash]);

    const block = new Block({
      hash,
      height,
      _id: hash ? hash : '0',
      bits: rpcblock.bits,
      confirmations: rpcblock.confirmations,
      createdAt: new Date(rpcblock.time * 1000),
      diff: rpcblock.difficulty,
      merkle: rpcblock.merkleroot,
      nonce: rpcblock.nonce,
      prev: rpcblock.prevblockhash ? rpcblock.prevblockhash : 'GENESIS',
      size: rpcblock.size,
      txs: rpcblock.tx ? rpcblock.tx : [],
      ver: rpcblock.version
    });

    await block.save();

    // Ignore the genesis block.
    if (block.height) {
      const txs = [];
      await forEach(block.txs, async (txhash) => {
        const hex = await rpc.call('getrawtransaction', [txhash]);
        const rpctx = await rpc.call('decoderawtransaction', [hex]);

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
        const outs = [];
        let vout = 0.0;
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

        txs.push(new TX({
          vout,
          _id: rpctx.txid,
          block: hash,
          createdAt: block.createdAt,
          hash: rpctx.txid,
          height: block.height,
          recipients: rpctx.vout.length,
          ver: rpctx.version
        }));
      });

      if (txs.length) {
        await TX.insertMany(txs);
      }
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
