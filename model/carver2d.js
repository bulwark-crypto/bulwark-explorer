
const mongoose = require('mongoose');

const CarverAddress = mongoose.model('CarverAddress', new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  label: { required: true, unique: true, index: true, type: String },
  balance: { index: true, required: true, type: Number },

  blockHeight: { index: true, required: true, type: Number }, // By storing block height we know WHEN this address was created (Technically, it could have been created during invalid block as well)
  date: { index: true, required: true, type: Date },
  carverAddressType: { index: true, required: true, type: Number },

  lastMovementDate: { index: true, required: true, type: Date },
  valueOut: { index: true, required: true, type: Number },
  valueIn: { index: true, required: true, type: Number },
  countIn: { index: true, required: true, type: Number },
  countOut: { index: true, required: true, type: Number },

  // Track rewards (CarverAddressType.Address only). That way we can subtract them from countIn/countOut to get number of non-reward txs
  posCountIn: { index: true, type: Number },
  posValueIn: { index: true, type: Number },
  posLastBlockHeight: { type: Number }, // Store last time this address received a POS reward (we use this for sequential syncing + data analytics)

  mnCountIn: { index: true, type: Number },
  mnValueIn: { index: true, type: Number },

  powCountIn: { index: true, type: Number },
  powValueIn: { index: true, type: Number },

  sequence: { required: true, type: Number }
}, { _id: false, versionKey: false }), 'carverAddresses');

const movementsSchema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,

  carverMovementType: { required: true, index: true, type: Number },

  label: { required: true, unique: true, index: true, type: String },
  amount: { required: true, index: true, type: Number },

  blockHeight: { index: true, required: true, type: Number }, // By storing block height we know how many blocks ago/confirmations we have
  date: { index: true, required: true, type: Date },
  fromBalance: { required: true, type: Number },
  toBalance: { required: true, type: Number },

  from: { required: true, type: mongoose.Schema.Types.ObjectId, ref: 'CarverAddress' },
  to: { required: true, type: mongoose.Schema.Types.ObjectId, ref: 'CarverAddress' },
  destinationAddress: { type: mongoose.Schema.Types.ObjectId, ref: 'CarverAddress' }, // POS, MN & POW Rewards will also have a destinationAddress

  // We'll use this for finding movements for specific address/tx (also note the two compound indexes below).
  // Because all movements are tx->address or address->tx both of these fields are always filled
  targetAddress: { type: mongoose.Schema.Types.ObjectId, ref: 'CarverAddress' },
  targetTx: { type: mongoose.Schema.Types.ObjectId, ref: 'CarverAddress' },

  // For POS rewards store additional info
  posInputAmount: { index: true, type: Number }, // What was the input amount of the stake
  posInputBlockHeight: { index: true, type: Number },   // What was the block of the input
  posInputBlockHeightDiff: { index: true, type: Number }, // blockHeight-posInputBlockHeightDiff

  sequence: { unique: true, required: true, type: Number }
}, { _id: false, versionKey: false });

// When viewing specific address we'll be filtering by from/to and sorting by sequence so we'll need these two compound indexes
movementsSchema.index({ targetAddress: 1, sequence: 1 }, { unique: true });
movementsSchema.index({ targetTx: 1, sequence: 1 }, { unique: true });

// We'll be doing a lot of sorting on type + sequence so let's create an index on that as well
movementsSchema.index({ carverAddressType: 1, sequence: 1 }, { unique: true });


const CarverMovement = mongoose.model('CarverMovement', movementsSchema, 'carverMovements');

module.exports = {
  CarverAddress,
  CarverMovement
}