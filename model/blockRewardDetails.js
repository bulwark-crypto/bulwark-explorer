
const mongoose = require('mongoose');

/*
  Nesting is as follows: 
  
  BlockRewardDetails
  ->BlockRewardDetailsStake
  -->BlockRewardDetailsStakeInput
  -->BlockRewardDetailsStakeReward
  ->BlockRewardDetailsMasternode
  -->BlockRewardDetailsMasternodeReward
  
*/

/**
 * Structure for detailed breakdown of the staking reward
 */
const BlockRewardDetailsStakeInput = new mongoose.Schema({
  txId: { index: true, required: true, type: String },
  amount: { index: true, required: true, type: Number },
  confirmations: { index: true, required: true, type: Number },
  date: { index: true, required: true, type: Date },
  age: { index: true, required: true, type: Number },
});
/**
 * Structure for detailed breakdown of the staking input
 */
const BlockRewardDetailsStakeReward = new mongoose.Schema({
  amount: { index: false, required: true, type: Number },
  address: { index: true, required: true, type: String },
});

/**
 * Structure for detailed breakdown of the stake
 */
const BlockRewardDetailsStake = new mongoose.Schema({
  address: { index: true, required: true, type: String },
  input: { index: false, required: true, type: BlockRewardDetailsStakeInput },
  reward: { index: false, required: true, type: BlockRewardDetailsStakeReward },
});

/**
 * Structure for detailed breakdown of the masternode reward
 */
const BlockRewardDetailsMasternodeReward = new mongoose.Schema({
  amount: { index: false, required: true, type: Number },
  address: { index: true, required: true, type: String },
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
  __v: { select: false, type: Number },
  blockHash: { required: true, type: String },
  blockHeight: { index: true, required: true, type: Number },
  stake: { index: false, required: true, type: BlockRewardDetailsStake },
  masternode: { index: false, required: true, type: BlockRewardDetailsMasternode },
}, { versionKey: false });

/**
 * Block Reward Details
 *
 * 
 */
const BlockRewardDetailsSchema = mongoose.model('BlockRewardDetails', BlockRewardDetails, 'blockRewardDetails');

module.exports =  BlockRewardDetailsSchema;
