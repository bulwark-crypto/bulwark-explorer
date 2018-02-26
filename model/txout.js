
const mongoose = require('mongoose');

/**
 * Will represent all the out transactions
 * on the chain.  This will be used for building
 * the rich list, etc.
 */
const TXOut = mongoose.model('TXOut', {
  addresses: [String],
  spendTx: String,
  txid: String,
  value: Number,
  vout: Number
}, 'txsout');

module.exports =  TXOut;
