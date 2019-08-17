
const mongoose = require('mongoose');

const UTXOSchema = new mongoose.Schema({
  label: { required: true, unique: true, index: true, type: String },
  blockHeight: { index: true, required: true, type: Number }, // By storing block height we know how many blocks ago/confirmations we have
  carverAddress: { type: mongoose.Schema.Types.ObjectId, ref: 'CarverAddress' }
}, { _id: false, versionKey: false });

const UTXO = mongoose.model('UTXO', UTXOSchema, 'utxos');
module.exports = {
  UTXO
}