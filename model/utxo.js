
const mongoose = require('mongoose');

const UTXO = mongoose.model('UTXO', new mongoose.Schema({
  address: { required: true, type: String },
  n: { required: true, type: Number },
  txId: { required: true, type: String },
  value: { required: true, type: Number }
}, { versionKey: false }), 'utxo');

module.exports =  UTXO;
