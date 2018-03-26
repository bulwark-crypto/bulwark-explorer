
const mongoose = require('mongoose');

/**
 * Masternode
 *
 * Connected masternode to the network.
 */
const Masternode = mongoose.model('Masternode', new mongoose.Schema({
  __v: { select: false, type: Number },
  active: { index: true, required: true, type: Number },
  addr: { index: true, required: true, type: String },
  createdAt: { required: true, type: Date },
  lastAt: { required: true, type: Date },
  lastPaidAt: { index: true, type: Date },
  network: { type: String },
  rank: { type: Number },
  status: { required: true, type: String },
  txHash: { index: true, required: true, type: String },
  txOutIdx: { required: true, type: Number },
  ver: { required: true, type: Number }
}, { versionKey: false }), 'masternodes');

module.exports =  Masternode;
