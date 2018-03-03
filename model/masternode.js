
const mongoose = require('mongoose');

const Masternode = mongoose.model('Masternode', new mongoose.Schema({
  _id: { required: true, select: false, type: String },
  active: { required: true, type: Number },
  addr: { required: true, type: String },
  createdAt: { required: true, type: Date },
  ip: { required: true, type: String },
  lastAt: { required: true, type: Date },
  lastPaidAt: { type: Date },
  network: { type: String },
  proto: { required: true, type: String },
  rank: { type: Number },
  status: { required: true, type: String },
  txHash: { required: true, type: String },
  txOutIdx: { required: true, type: Number },
  ver: { required: true, type: Number }
}, { versionKey: false }), 'masternodes');

module.exports =  Masternode;
