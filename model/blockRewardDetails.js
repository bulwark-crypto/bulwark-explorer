
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
  txId: { index: true, required: true, type: String },
  value: { index: true, required: true, type: Number },
  confirmations: { index: true, required: true, type: Number },
  date: { index: true, required: true, type: Date },
  age: { index: true, required: true, type: Number },
  isRestake: { index: false, required: true, type: Boolean },
  vinCount: { index: true, required: true, type: Number },
  voutCount: { index: true, required: true, type: Number },
}, { _id: false, versionKey: false });

/**
 * Structure for detailed breakdown of the stake
 */
const BlockRewardDetailsStake = new mongoose.Schema({
  address: { index: true, required: true, type: String },
  reward: { index: false, required: true, type: Number },
  input: { index: false, required: true, type: BlockRewardDetailsStakeInput },
}, { _id: false, versionKey: false });

/**
 * Structure for detailed breakdown of the stake
 */
const BlockRewardDetailsMasternode = new mongoose.Schema({
  address: { index: true, required: true, type: String },
  reward: { index: false, required: true, type: Number },
}, { _id: false, versionKey: false });

/**
 * Structure for detailed breakdown of the reward
 */
const BlockRewardDetails = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  //blockHash: { required: true, type: String },
  blockHeight: { index: true, required: true, type: Number },
  date: { index: true, required: true, type: Date },
  txId: { index: true, required: true, type: String },

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
