
const mongoose = require('mongoose');

/**
 * Block
 *
 * Is the system representation of a block
 * that closely reflects that used on the network.
 */
const Block = mongoose.model('Block', new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,

  bits: { required: true, type: String },
  confirmations: { required: true, type: Number },
  createdAt: { index: true, required: true, type: Date },
  diff: { required: true, type: String },
  hash: { index: true, required: true, type: String, unique: true },
  height: { index: true, required: true, type: Number },
  merkle: { required: true, type: String },
  nonce: { required: true, type: Number },
  prev: { required: true, type: String },
  size: { type: Number },
  //txs: { default: [], required: true, type: [String] }, // New txs from Carver2D Below.
  ver: { required: true, type: Number },
  vinsCount: { required: true, type: Number },
  voutsCount: { required: true, type: Number },

  isConfirmed: { required: true, type: Boolean }, // Block was confirmed after config.blockConfirmations

  // Carver2D 
  sequenceStart: { type: Number },
  sequenceEnd: { type: Number },
  txs: [{ required: true, type: mongoose.Schema.Types.ObjectId, ref: 'CarverAddress' }],
}, { _id: false, versionKey: false }), 'blocks');

module.exports = Block;
