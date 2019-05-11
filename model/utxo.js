
const mongoose = require('mongoose');

/**
 * UTXO
 *
 * Unspent transactions in the blockchain.
 */
const utxoSchema = new mongoose.Schema({
  __v: { select: false, type: Number },
  _id: { required: true, select: false, type: String },
  address: { index: true, required: true, type: String },
  blockHeight: { index: true, required: true, type: Number },
  n: { required: true, type: Number },
  txId: { required: true, type: String },
  value: { required: true, type: Number }
}, { versionKey: false });

// Add coumpound index: address_blockHeight
utxoSchema.index({ address: 1, blockHeight: 1  });

const UTXO = mongoose.model('UTXO', utxoSchema, 'utxo');

module.exports =  UTXO;
