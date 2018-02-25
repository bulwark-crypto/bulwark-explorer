
import 'babel-polyfill';
import { exit, rpc } from '../lib/cron';
import { forEach } from 'p-iteration';
// Models.
import Block from '../model/block';
import TX from '../model/tx';

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
      let hex, rpctx, tx;
      await forEach(block.txs, async (txhash) => {
        hex = await rpc.call('getrawtransaction', [txhash]);
        rpctx = await rpc.call('decoderawtransaction', [hex]);

        // Setup the vout addresses.
        const addrs = new Set();

        // Build the total for the output of this tx.
        let vout = 0.0;
        if (rpctx.vout) {
          rpctx.vout.forEach((vo) => {
            vout += vo.value;
            if (vo.scriptPubKey.addresses && vo.scriptPubKey.addresses.length) {
              vo.scriptPubKey.addresses.forEach(voa => addrs.add(voa));
            }
          });
        }

        tx = new TX({
          vout,
          addrs: Array.from(addrs),
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
