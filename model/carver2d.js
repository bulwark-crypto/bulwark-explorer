
const mongoose = require('mongoose');

// This enum was originally a Typescript enum
export const AddressType = {
  Tx: 0,
  Address: 1,
  Coinbase: 2,
  Zerocoin: 3,
  Burn: 4
}
export const Address = mongoose.model('Address', new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  label: { required: true, unique: true, index: true, type: String },
  balance: { index: true, required: true, type: Number },

  time: { index: true, required: true, type: Number },
  addressType: { index: true, required: true, type: Number },

  lastMovementTime: { index: true, required: true, type: Number },
  valueOut: { index: true, required: true, type: Number },
  valueIn: { index: true, required: true, type: Number },
  countIn: { index: true, required: true, type: Number },
  countOut: { index: true, required: true, type: Number },

  sequence: { required: true, type: Number },
}, { _id: false, versionKey: false }), 'addresses');

// This enum was originally a Typescript enum
export const MovementType = {
  CoinbaseToTx: 0,

  AddressToTx: 1,
  TxToAddress: 2,

  PosAddressToTx: 3,
  TxToPosAddress: 4,
  TxToMnAddress: 5,
  TxToCoinbaseRewardAddress: 6,

  ZerocoinToTx: 7,
  TxToZerocoin: 8,
  Burn: 9
}
export const Movement = mongoose.model('Movement', new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,

  movementType: { required: true, index: true, type: Number },

  label: { required: true, unique: true, index: true, type: String },
  amount: { required: true, index: true, type: Number },

  time: { index: true, required: true, type: Number },
  fromBalance: { required: true, type: Number },
  toBalance: { required: true, type: Number },

  from: { index: true, required: true, type: mongoose.Schema.Types.ObjectId, ref: 'Address' },
  to: { index: true, required: true, type: mongoose.Schema.Types.ObjectId, ref: 'Address' },

  sequence: { unique: true, required: true, type: Number }
}, { _id: false, versionKey: false }), 'movements');

