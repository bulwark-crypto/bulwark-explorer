
const mongoose = require('mongoose');

/**
 * Block is the system representation of a block
 * that closely reflects that used on the network.
 */
const Block = mongoose.model('Block', {
  bits: String,
  confirmations: Number,
  createdAt: Date,
  diff: String,
  hash: String,
  height: Number,
  merkle: String,
  nonce: Number,
  prev: String,
  size: Number,
  txs: [String],
  ver: Number
}, 'blocks');

export default Block;
