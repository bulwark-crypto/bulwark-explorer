
const mongoose = require('mongoose');

/**
 * Coin
 *
 * Represents the state of the coin in general.
 */
const Coin = mongoose.model('Coin', new mongoose.Schema({
  __v: { select: false, type: Number },
  blocks: { required: true, type: Number },
  btc: { required: true, type: Number },
  cap: { required: true, type: Number },
  createdAt: { index: true, required: true, type: Date },
  diff: { required: true, type: Number },
  mnsOff: { required: true, type: Number },
  mnsOn: { required: true, type: Number },
  netHash: { required: true, type: Number },
  peers: { required: true, type: Number },
  status: { required: true, type: String },
  supply: { required: true, type: Number },
  usd: { required: true, type: Number }
}, { versionKey: false }), 'coins');

module.exports =  Coin;
