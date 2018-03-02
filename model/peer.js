
const mongoose = require('mongoose');

const Peer = mongoose.model('Peer', {
  _id: String,
  country: String,
  countryCode: String,
  createdAt: Date,
  ip: String,
  lat: String,
  lon: String,
  port: Number,
  subver: String,
  timeZone: String,
  ver: String
}, 'peers');

module.exports =  Peer;
