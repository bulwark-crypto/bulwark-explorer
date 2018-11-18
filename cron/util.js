
require('babel-polyfill');
const { rpc } = require('../lib/cron');
const TX = require('../model/tx');
const UTXO = require('../model/utxo');

/**
 * Process the inputs for the tx.
 * @param {Object} rpctx The rpc tx object.
 */
async function vin(rpctx) {
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
  return txin;
}

/**
 * Process the outputs for the tx.
 * @param {Object} rpctx The rpc tx object.
 * @param {Number} blockHeight The block height for the tx.
 */
async function vout(rpctx, blockHeight) {
  // Setup the outputs for the transaction.
  const txout = [];
  if (rpctx.vout) {
    const utxo = [];
    rpctx.vout.forEach((vout) => {
      if (vout.value <= 0 || vout.scriptPubKey.type === 'nulldata') {
        return;
      }

      const to = {
        blockHeight,
        address: vout.scriptPubKey.type === 'zerocoinmint' ? 'ZEROCOIN' : vout.scriptPubKey.addresses[0],
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
  return txout;
}

/**
 * Process a proof of stake block.
 * @param {Object} block The block model object.
 * @param {Object} rpctx The rpc object from the node.
 */
async function addPoS(block, rpctx) {
  // We will ignore the empty PoS txs.
  if (rpctx.vin[0].coinbase && rpctx.vout[0].value === 0)
    return;

  const txin = await vin(rpctx);
  const txout = await vout(rpctx, block.height);

  await TX.create({
    _id: rpctx.txid,
    blockHash: block.hash,
    blockHeight: block.height,
    createdAt: block.createdAt,
    txId: rpctx.txid,
    version: rpctx.version,
    vin: txin,
    vout: txout
  });
}

/**
 * Handle a proof of work block.
 * @param {Object} block The block model object.
 * @param {Object} rpctx The rpc object from the node.
 */
async function addPoW(block, rpctx) {
  const txin = await vin(rpctx);
  const txout = await vout(rpctx, block.height);

  await TX.create({
    _id: rpctx.txid,
    blockHash: block.hash,
    blockHeight: block.height,
    createdAt: block.createdAt,
    txId: rpctx.txid,
    version: rpctx.version,
    vin: txin,
    vout: txout
  });
}

/**
 * Will process the tx from the node and return.
 * @param {String} tx The transaction hash string.
 */
async function getTX(txhash) {
  const hex = await rpc.call('getrawtransaction', [txhash]);
  return await rpc.call('decoderawtransaction', [hex]);
}

module.exports = {
  addPoS,
  addPoW,
  getTX,
  vin,
  vout
};
