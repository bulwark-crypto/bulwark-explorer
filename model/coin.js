
import mongoose from 'mongoose';

const Coin = mongoose.model('Coin', {
  cap: Number,
  createdAt: Date,
  blocks: Number,
  btc: Number,
  diff: Number,
  mnsOff: Number,
  mnsOn: Number,
  netHash: Number,
  peers: Number,
  status: String,
  supply: Number,
  usd: Number
});

export default Coin;
