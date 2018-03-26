
const mongoose = require('mongoose');

/**
 * Rich
 *
 * Wallet balances.
 */
const Rich = mongoose.model('Rich', new mongoose.Schema({
  __v: { select: false, type: Number },
  address: { index: true, required: true, type: String, unique: true },
  value: { default: 0.0, index: true, required: true, type: Number }
}, { versionKey: false }), 'rich');

module.exports =  Rich;
