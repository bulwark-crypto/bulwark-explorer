
const mongoose = require('mongoose');

/**
 * When a vin is spent, we'll have extra data of what was spent
 */
const RelatedVout = new mongoose.Schema({
  address: { index: false, required: true, type: String },
  value: { required: true, type: Number },
  confirmations: { required: true, type: Number },
  date: { index: true, required: true, type: Date },
  age: { index: true, required: true, type: Number },
}, { _id: false, versionKey: false });

/**
 * Sometimes we can store the asm instruction of the script sig (ex: to identify ZEROCOIN transactions)
 */
const ScriptSig = new mongoose.Schema({
  asm: { type: String },
}, { _id: false, versionKey: false });

/**
 * The inputs for a tx.
 */
const TXIn = new mongoose.Schema({
  coinbase: { type: String },
  //sequence: { type: Number },
  txId: { type: String },
  vout: { type: Number },
  relatedVout: { required: false, type: RelatedVout },
  scriptSig: { required: false, type: ScriptSig }
}, { _id: false, versionKey: false });

/**
 * The outputs for a tx.
 */
const TXOut = new mongoose.Schema({
  address: { index: true, required: true, type: String },
  n: { required: true, type: Number },
  value: { required: true, type: Number }
}, { _id: false, versionKey: false });

/**
 * Setup the schema for transactions.
 */
const txSchema = new mongoose.Schema({
  __v: { select: false, type: Number },
  _id: mongoose.Schema.Types.ObjectId,
  //blockHash: { required: true, type: String },
  blockHeight: { index: true, required: true, type: Number },
  createdAt: { index: true, required: true, type: Date },
  txId: { index: true, required: true, type: String },
  version: { required: true, type: Number },
  vin: { required: true, type: [TXIn] },
  vout: { required: true, type: [TXOut] },
  isReward: { required: false, type: Boolean },
  blockRewardDetails: { type: mongoose.Schema.Types.ObjectId, ref: 'BlockRewardDetails' },
  involvedAddresses: { required: true, type: [String], index: true }
}, { versionKey: false });

/**
 * Helper method to return vout value for tx.
 */
txSchema.virtual('value')
  .get(() => {
    return this.vout.reduce((acc, vo) => acc + vo.value, 0.0);
  });

/**
 * The transaction object.  Very basic as
 * details will be requested by txid (hash)
 * from the node on demand.  A cache can be
 * implemented if needed for recent txs.
 */
const TX = mongoose.model('TX', txSchema, 'txs');

module.exports = TX;
