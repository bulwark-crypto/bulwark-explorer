
const mongoose = require('mongoose');

/**
 * TXIn
 *
 * The inputs for a tx.
 */
const TXIn = new mongoose.Schema({
  __v: { select: false, type: Number },
  coinbase: { type: String },
  sequence: { type: Number },
  txId: { type: String },
  vout: { type: Number }
});

/**
 * TXOut
 *
 * The outputs for a tx.
 */
const TXOut = new mongoose.Schema({
  __v: { select: false, type: Number },
  address: { required: true, type: String },
  n: { required: true, type: Number },
  value: { required: true, type: Number }
});

/**
 * TX
 *
 * The transaction object.  Very basic as
 * details will be requested by txid (hash)
 * from the node on demand.  A cache can be
 * implemented if needed for recent txs.
 */
const TX = mongoose.model('TX', new mongoose.Schema({
  __v: { select: false, type: Number },
  _id: { required: true, select: false, type: String },
  blockHash: { required: true, type: String },
  blockHeight: { required: true, type: Number },
  createdAt: { index: true, required: true, type: Date },
  txId: { index: true, required: true, type: String },
  version: { required: true, type: Number },
  vin: { required: true, type: [TXIn] },
  vout: { required: true, type: [TXOut] }
}, { versionKey: false }), 'txs');

module.exports =  TX;
