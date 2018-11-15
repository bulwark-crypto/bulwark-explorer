const mongoose = require('mongoose');

/*
 * proposal
 */
const Proposal = mongoose.model('Proposal', new mongoose.Schema({
  __v: { select: false, type: Number },
  id: { required: true, type: Number },
  creator: { required: false, type: String },
  name: { required: true, type: String },
  status: { required: true, type: Boolean },
  created: { index: true, required: true, type: Date },
  budgetTotal: { required: true, type: Number },
  budgetMonthly: { required: true, type: Number },
  budgetPeriod: { required: true, type: Number },
  hash: { required: true, type: String },
  feehash: { required: true, type: String },
  url: { required: true, type: String }
}, { versionKey: false }), 'proposals');

module.exports =  Proposal;