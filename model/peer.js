
const mongoose = require('mongoose');

const Peer = mongoose.model('Peer', new mongoose.Schema({
  __v: { select: false, type: Number },
  _id: { required: true, select: false, type: String },
  country: { required: true, type: String },
  countryCode: { required: true, type: String },
  createdAt: { required: true, type: Date },
  ip: { required: true, type: String },
  lat: { type: String },
  lon: { type: String },
  port: { type: Number },
  subver: { required: true, type: String },
  timeZone: { type: String },
  ver: { required: true, type: Number }
}, { versionKey: false }), 'peers');

module.exports =  Peer;
