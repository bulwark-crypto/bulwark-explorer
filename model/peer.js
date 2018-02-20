
import mongoose from 'mongoose';

const Peer = mongoose.model('Peer', {
  _id: String,
  country: String,
  createdAt: Date,
  ip: String,
  lat: String,
  lon: String,
  port: Number,
  subver: String,
  timeZone: String,
  ver: String
});

export default Peer;
