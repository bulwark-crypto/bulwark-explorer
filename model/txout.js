
const mongoose = require('mongoose');

/**
 * Will represent all the out transactions
 * on the chain.  This will be used for building
 * the rich list, etc.
 */
const TXOut = mongoose.model('TXOut', new mongoose.Schema({
  addresses: { required: true, type: [String] },
  spendTx: { type: String },
  txid: { required: true, type: String },
  value: { required: true, type: Number },
  vout: { required: true, type: Number }
}, { versionKey: false }), 'txsout');

module.exports =  TXOut;
