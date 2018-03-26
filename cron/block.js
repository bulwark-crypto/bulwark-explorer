
require('babel-polyfill');
const { exit, rpc } = require('../lib/cron');
const { forEachSeries } = require('p-iteration');
const locker = require('../lib/locker');
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
  // If current height is greater than 0 then
  // increment 1 to prevent duplication.  If we add
  // 1 early it will skip the genesis block.
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
      await forEachSeries(block.txs, async (txhash) => {
        const hex = await rpc.call('getrawtransaction', [txhash]);
        const rpctx = await rpc.call('decoderawtransaction', [hex]);

        // Setup the input list for the transaction.
        const txin = [];
        if (rpctx.vin) {
          const txIds = new Set();
          rpctx.vin.forEach((vin) => {
            txin.push({
              coinbase: vin.coinbase,
              sequence: vin.sequence,
              txId: vin.txid,
              vout: vin.vout
            });

            txIds.add(`${ vin.txid }:${ vin.vout }`);
          });

          // Remove unspent transactions.
          if (txIds.size) {
            await UTXO.remove({ _id: { $in: Array.from(txIds) } });
          }
        }

        // Setup the outputs for the transaction.
        const txout = [];
        if (rpctx.vout) {
          const utxo = [];
          rpctx.vout.forEach((vout) => {
            const to = {
              address: vout.scriptPubKey.addresses[0], // TODO - revisit
              blockHeight: block.height,
              n: vout.n,
              value: vout.value
            };

            txout.push(to);
            utxo.push({
              ...to,
              _id: `${ rpctx.txid }:${ vout.n }`,
              txId: rpctx.txid
            });
          });

          // Insert unspent transactions.
          if (utxo.length) {
            await UTXO.insertMany(utxo);
          }
        }

        await TX.create({
          _id: rpctx.txid,
          blockHash: hash,
          blockHeight: block.height,
          createdAt: block.createdAt,
          txId: rpctx.txid,
          version: rpctx.version,
          vin: txin,
          vout: txout
        });
      });
    }

    console.log(`Height: ${ block.height } Hash: ${ block.hash }`);
  }
}

/**
 * Handle locking.
 */
async function update() {
  const type = 'block';
  let code = 0;

  try {
    const info = await rpc.call('getinfo');
    const block = await Block.findOne().sort({ height: - 1});
    const height = block && block.height ? block.height : 0;

    locker.lock(type);
    await syncBlocks(height, info.blocks);
    locker.unlock(type);
  } catch(err) {
    console.log(err);
    code = 1;
  } finally {
    exit(code);
  }
}

update();
