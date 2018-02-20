
import mongoose from 'mongoose';

const Coin = mongoose.model('Coin', {
  cap: Number,
  createdAt: Date,
  btc: Number,
  supply: Number,
  usd: Number
});

export default Coin;
