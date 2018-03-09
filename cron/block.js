
require('babel-polyfill');
const { exit, rpc } = require('../lib/cron');
const { forEach } = require('p-iteration');
const mongoose = require('mongoose');
// Models.
const Block = require('../model/block');
const TX = require('../model/tx');

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

        // Setup the input list for the transaction.
        const txin = [];
        if (rpctx.vin) {
          rpctx.vin.forEach((vin) => {
            txin.push({
              _id: mongoose.Types.ObjectId(),
              coinbase: vin.coinbase,
              sequence: vin.sequence,
              txId: vin.txid,
              vout: vin.vout
            });
          });
        }

        // Setup the outputs for the transaction.
        const txout = [];
        if (rpctx.vout) {
          rpctx.vout.forEach((vout) => {
            txout.push({
              _id: mongoose.Types.ObjectId(),
              addresses: vout.scriptPubKey.addresses,
              n: vout.n,
              value: vout.value
            });
          });
        }

        txs.push(new TX({
          _id: mongoose.Types.ObjectId(),
          blockHash: hash,
          blockHeight: block.height,
          createdAt: block.createdAt,
          txId: rpctx.txid,
          version: rpctx.version,
          vin: txin,
          vout: txout
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
