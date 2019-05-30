
const mongoose = require('mongoose');

/**
 * The inputs for a tx.
 */
const TXIn = new mongoose.Schema({
  __v: { select: false, type: Number },
  coinbase: { type: String },
  sequence: { type: Number },
  txId: { type: String },
  vout: { type: Number }
});

/**
 * The outputs for a tx.
 */
const TXOut = new mongoose.Schema({
  __v: { select: false, type: Number },
  address: { index: true, required: true, type: String },
  n: { required: true, type: Number },
  value: { required: true, type: Number }
});

/**
 * Structure for detailed breakdown of the staking reward
 */
const BlockRewardDetailsStakeInput = new mongoose.Schema({
  txId: { index: false, required: true, type: String },
  amount: { index: false, required: true, type: Number },
  confirmations: { index: false, required: true, type: Number },
  date: { index: false, required: true, type: Date },
  age: { index: false, required: true, type: Number },
});
/**
 * Structure for detailed breakdown of the staking input
 */
const BlockRewardDetailsStakeReward = new mongoose.Schema({
  amount: { index: false, required: true, type: Number },
  address: { index: false, required: true, type: String },
});

/**
 * Structure for detailed breakdown of the stake
 */
const BlockRewardDetailsStake = new mongoose.Schema({
  address: { index: false, required: true, type: String },
  input: { index: false, required: true, type: BlockRewardDetailsStakeInput },
  reward: { index: false, required: true, type: BlockRewardDetailsStakeReward },
});

/**
 * Structure for detailed breakdown of the masternode reward
 */
const BlockRewardDetailsMasternodeReward = new mongoose.Schema({
  amount: { index: false, required: true, type: Number },
  address: { index: false, required: true, type: String },
});
/**
 * Structure for detailed breakdown of the stake
 */
const BlockRewardDetailsMasternode = new mongoose.Schema({
  reward: { index: false, required: true, type: BlockRewardDetailsMasternodeReward },
});

/**
 * Structure for detailed breakdown of the reward
 */
const BlockRewardDetails = new mongoose.Schema({
  stake: { index: false, required: true, type: BlockRewardDetailsStake },
  masternode: { index: false, required: true, type: BlockRewardDetailsMasternode },
});


/**
 * Setup the schema for transactions.
 */
const txSchema = new mongoose.Schema({
  __v: { select: false, type: Number },
  _id: { required: true, select: false, type: String },
  blockHash: { required: true, type: String },
  blockHeight: { index: true, required: true, type: Number },
  createdAt: { index: true, required: true, type: Date },
  txId: { index: true, required: true, type: String },
  version: { required: true, type: Number },
  vin: { required: true, type: [TXIn] },
  vout: { required: true, type: [TXOut] },
  isReward: { required: false, type: Boolean },
  blockRewardDetails: { required: false, type: BlockRewardDetails }
}, { versionKey: false });

/**
 * Helper method to return vout value for tx.
 */
txSchema.virtual('value')
  .get(() => {
    return this.vout.reduce((acc, vo) => acc + vo.value, 0.0);
  });

/**
 * The transaction object.  Very basic as
 * details will be requested by txid (hash)
 * from the node on demand.  A cache can be
 * implemented if needed for recent txs.
 */
const TX = mongoose.model('TX', txSchema, 'txs');

module.exports = TX;
