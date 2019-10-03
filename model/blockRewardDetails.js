
const mongoose = require('mongoose');

/*
  Nesting is as follows: 
  
  BlockRewardDetails
  ->BlockRewardDetailsMasternode
  ->BlockRewardDetailsStake
  -->BlockRewardDetailsStakeInput
*/

/**
 * Structure for detailed breakdown of the staking reward
 */
const BlockRewardDetailsStakeInput = new mongoose.Schema({
  //txId: { required: true, type: String },
  carverMovement: { type: mongoose.Schema.Types.ObjectId, ref: 'CarverMovement' },
  value: { index: true, required: true, type: Number },
  blockHeight: { required: true, type: Number },
  date: { required: true, type: Date },
  isRestake: { required: true, type: Boolean },
  //restakeCount: { required: true, type: Number }, //@todo How many times we restaked in a row (could have leaderboards for this)
  vinCount: { required: true, type: Number },
  voutCount: { required: true, type: Number },
}, { _id: false, versionKey: false });

/**
 * Structure for detailed breakdown of the stake
 */
const BlockRewardDetailsStake = new mongoose.Schema({
  addressLabel: { index: true, required: true, type: String },
  reward: { required: true, type: Number },
  input: { required: true, type: BlockRewardDetailsStakeInput },
  carverAddress: { index: true, type: mongoose.Schema.Types.ObjectId, ref: 'CarverAddress' },
  roi: { index: true, required: true, type: Number },
  ageBlocks: { required: true, type: Number },
  ageTime: { required: true, type: Number },
}, { _id: false, versionKey: false });

/**
 * Structure for detailed breakdown of the masternode
 */
const BlockRewardDetailsMasternode = new mongoose.Schema({
  addressLabel: { index: true, required: true, type: String },
  carverAddress: { index: true, type: mongoose.Schema.Types.ObjectId, ref: 'CarverAddress' },
  reward: { required: true, type: Number },
  roi: { required: true, type: Number },
  ageBlocks: { required: true, type: Number },
  ageTime: { required: true, type: Number },
}, { _id: false, versionKey: false });

/**
 * Structure for detailed breakdown of pow
 */
const BlockRewardDetailsProofOfWork = new mongoose.Schema({
  addressLabel: { required: true, type: String },
  carverAddress: { type: mongoose.Schema.Types.ObjectId, ref: 'CarverAddress' },
  reward: { required: true, type: Number },
}, { _id: false, versionKey: false });


/**
 * Structure for detailed breakdown of the reward
 */
const blockRewardDetailsSchema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,

  blockHeight: { index: true, required: true, unique: true, type: Number },
  date: { index: true, required: true, type: Date },
  txId: { required: true, type: String }, //@todo add CarverMovement (instead of txId)

  stake: { type: BlockRewardDetailsStake },
  masternode: { type: BlockRewardDetailsMasternode },
  proofOfWork: { type: BlockRewardDetailsProofOfWork },

  hasStakeReward: { required: true, type: Boolean },
  hasMasternodeReward: { required: true, type: Boolean },
  hasPoofOfWorkReward: { required: true, type: Boolean },
}, { versionKey: false });

blockRewardDetailsSchema.index({ hasStakeReward: 1, blockHeight: 1 }, { partialFilterExpression: { hasStakeReward: true } });
blockRewardDetailsSchema.index({ hasMasternodeReward: 1, blockHeight: 1 }, { partialFilterExpression: { hasMasternodeReward: true } });
blockRewardDetailsSchema.index({ hasPoofOfWorkReward: 1, blockHeight: 1 }, { partialFilterExpression: { hasPoofOfWorkReward: true } });

/**
 * Block Reward Details
 *
 * 
 */
const BlockRewardDetails = mongoose.model('BlockRewardDetails', blockRewardDetailsSchema, 'blockRewardDetails');

module.exports = {
  BlockRewardDetails
};
