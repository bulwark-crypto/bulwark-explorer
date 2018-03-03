
const mongoose = require('mongoose');

const Masternode = mongoose.model('Masternode', new mongoose.Schema({
  __v: { select: false, type: Number },
  _id: { required: true, select: false, type: String },
  active: { required: true, type: Number },
  addr: { required: true, type: String },
  createdAt: { required: true, type: Date },
  ip: { index: 1, required: true, type: String },
  lastAt: { index: 1, required: true, type: Date },
  lastPaidAt: { index: 1, type: Date },
  network: { type: String },
  proto: { required: true, type: String },
  rank: { index: 1, type: Number },
  status: { required: true, type: String },
  txHash: { index: 1, required: true, type: String },
  txOutIdx: { required: true, type: Number },
  ver: { required: true, type: Number }
}, { versionKey: false }), 'masternodes');

module.exports =  Masternode;
