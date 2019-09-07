
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
  txId: { required: true, type: String },
  value: { required: true, type: Number },
  confirmations: { required: true, type: Number },
  date: { required: true, type: Date },
  age: { required: true, type: Number },
  isRestake: { required: true, type: Boolean },
  restakeCount: { required: true, type: Number },
  vinCount: { required: true, type: Number },
  voutCount: { required: true, type: Number },
}, { _id: false, versionKey: false });

/**
 * Structure for detailed breakdown of the stake
 */
const BlockRewardDetailsStake = new mongoose.Schema({
  address: { required: true, type: String },
  reward: { required: true, type: Number },
  input: { required: true, type: BlockRewardDetailsStakeInput },
  roi: { required: true, type: Number },
}, { _id: false, versionKey: false });

/**
 * Structure for detailed breakdown of the masternode
 */
const BlockRewardDetailsMasternode = new mongoose.Schema({
  address: { required: true, type: String },
  reward: { required: true, type: Number },
  roi: { required: true, type: Number },
}, { _id: false, versionKey: false });

/**
 * Structure for detailed breakdown of pow
 */
const BlockRewardDetailsProofOfWork = new mongoose.Schema({
  address: { required: true, type: String },
  reward: { required: true, type: Number },
}, { _id: false, versionKey: false });


/**
 * Structure for detailed breakdown of the reward
 */
const BlockRewardDetails = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  blockHeight: { required: true, type: Number },
  date: { required: true, type: Date },
  txId: { required: true, type: String },

  stake: { type: BlockRewardDetailsStake },
  masternode: { type: BlockRewardDetailsMasternode },
  pow: { type: BlockRewardDetailsProofOfWork },
}, { versionKey: false });

/**
 * Block Reward Details
 *
 * 
 */
const BlockRewardDetailsSchema = mongoose.model('BlockRewardDetails', BlockRewardDetails, 'blockRewardDetails');

module.exports = BlockRewardDetailsSchema;
