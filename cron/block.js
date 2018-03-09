
require('babel-polyfill');
const { exit, rpc } = require('../lib/cron');
const { forEach } = require('p-iteration');
const mongoose = require('mongoose');
// Models.
const Block = require('../model/block');
const TX = require('../model/tx');
const UTXO = require('../model/utxo');

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
        const utxo = [];

        // Setup the input list for the transaction.
        const txin = [];
        if (rpctx.vin) {
          await forEach(rpctx.vin, async (vin) => {
            txin.push({
              coinbase: vin.coinbase,
              sequence: vin.sequence,
              txId: vin.txid,
              vout: vin.vout
            });

            // Remove unspent transaction if txid is
            // supplied.
            if (vin.txid && vin.vout) {
              //await UTXO.remove({ txId: vin.txid, n: vin.vout });
            }
          });
        }

        // Setup the outputs for the transaction.
        const txout = [];
        if (rpctx.vout) {
          rpctx.vout.forEach((vout) => {
            const to = {
              address: vout.scriptPubKey.addresses[0], // TODO - revisit
              n: vout.n,
              value: vout.value
            };

            txout.push(to);
            utxo.push(new UTXO({ ...to, txId: rpctx.txid }));
          });
        }

        // Save the unspent transactions to the database.
        if (utxo.length) {
          //await UTXO.insertMany(utxo);
        }

        txs.push(new TX({
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

  exit();
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
