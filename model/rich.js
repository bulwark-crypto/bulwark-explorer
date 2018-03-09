
const mongoose = require('mongoose');

const Rich = mongoose.model('Rich', new mongoose.Schema({
  __v: { select: false, type: Number },
  address: { index: 1, required: true, type: String },
  value: { default: 0.0, required: true, type: Number }
}, { versionKey: false }), 'rich');

module.exports =  Rich;
