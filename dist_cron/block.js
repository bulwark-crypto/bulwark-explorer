'use strict';

require('babel-polyfill');

var _cron = require('../lib/cron');

var _pIteration = require('p-iteration');

var _block = require('../model/block');

var _block2 = _interopRequireDefault(_block);

var _tx = require('../model/tx');

var _tx2 = _interopRequireDefault(_tx);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Process the blocks and transactions.
 * @param {Number} current The current starting block height.
 * @param {Number} stop The current block height at the tip of the chain.
 */

// Models.
async function syncBlocks(current, stop) {
  let block, hash, rpcblock;
  for (let height = current; height < stop; height++) {
    hash = await _cron.rpc.call('getblockhash', [height]);
    rpcblock = await _cron.rpc.call('getblock', [hash]);

    block = new _block2.default({
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
      await (0, _pIteration.forEach)(block.txs, async txhash => {
        hex = await _cron.rpc.call('getrawtransaction', [txhash]);
        rpctx = await _cron.rpc.call('decoderawtransaction', [hex]);

        // Setup the vout addresses.
        const addrs = new Set();

        // Build the total for the output of this tx.
        let vout = 0.0;
        if (rpctx.vout) {
          rpctx.vout.forEach(vo => {
            vout += vo.value;
            if (vo.scriptPubKey.addresses && vo.scriptPubKey.addresses.length) {
              vo.scriptPubKey.addresses.forEach(voa => addrs.add(voa));
            }
          });
        }

        tx = new _tx2.default({
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

    console.log(`Height: ${block.height} Hash: ${block.hash}`);
  }
}

/**
 * Get blockchain information from node and
 * update the database with the node.
 */
async function update() {
  try {
    const info = await _cron.rpc.call('getinfo');
    const block = await _block2.default.findOne().sort({ height: -1 });
    const height = block && block.height ? block.height : 0;

    await syncBlocks(height, info.blocks);
  } catch (err) {
    console.log(err);
    (0, _cron.exit)(1);
  }

  (0, _cron.exit)();
}

update();