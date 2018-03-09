
const mongoose = require('mongoose');

/**
 * The inputs for a tx.
 */
const TXIn = new mongoose.Schema({
  __v: { select: false, type: Number },
  _id: { required: true, select: false, type: String },
  coinbase: { type: String },
  sequence: { type: Number },
  txId: { index: 1, type: String },
  vout: { type: Number }
});

/**
 * The outputs for a tx.
 */
const TXOut = new mongoose.Schema({
  __v: { select: false, type: Number },
  _id: { required: true, select: false, type: String },
  addresses: { default: [], required: true, type: [String] },
  n: { required: true, type: Number },
  value: { required: true, type: Number }
});

/**
 * The transaction object.  Very basic as
 * details will be requested by txid (hash)
 * from the node on demand.  A cache can be
 * implemented if needed for recent txs.
 */
const TX = mongoose.model('TX', new mongoose.Schema({
  __v: { select: false, type: Number },
  _id: { required: true, select: false, type: String },
  blockHash: { index: 1, required: true, type: String },
  blockHeight: { index: 1, required: true, type: Number },
  createdAt: { required: true, type: Date },
  txId: { index: 1, required: true, type: String },
  version: { required: true, type: Number },
  vin: { required: true, type: [TXIn] },
  vout: { required: true, type: [TXOut] }
}, { versionKey: false }), 'txs');

module.exports =  TX;
