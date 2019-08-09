
const mongoose = require('mongoose');

/*
Useful mongo queries:

db.currentOp({"secs_running":{$gte:1}})                                               // Find mongo queries >1 sec in execution time. Most likely you will need a new index or optimize query.
db.carverAddresses.aggregate([{ $indexStats: {} },{$match:{"accesses.ops":0}}])       // Find unused index with 0 accesses

*/

const carverAddressSchema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  label: { required: true, unique: true, index: true, type: String },
  balance: { index: true, required: true, type: Number },

  blockHeight: { index: true, required: true, type: Number }, // By storing block height we know WHEN this address was created (Technically, it could have been created during invalid block as well)
  date: { index: true, required: true, type: Date },
  carverAddressType: { index: true, required: true, type: Number },

  lastMovementDate: { required: true, type: Date, index: true /* Possible Analytics Examples: Sort by last active wallets, Last active wallets, Last time POW was used, First Time POS was used, Last 100 distributed rewards*/ },
  valueOut: { required: true, type: Number, index: true /* Possible Analytics Examples: Sort by wallets with most/least funds out)*/ },
  valueIn: { index: true, required: true, type: Number },
  countIn: { index: true, required: true, type: Number },
  countOut: { index: true, required: true, type: Number },

  // Track rewards (CarverAddressType.Address only). That way we can subtract them from countIn/countOut to get number of non-reward txs
  posCountIn: { index: true, type: Number },
  posValueIn: { type: Number, index: true },

  mnCountIn: { index: true, type: Number },
  mnValueIn: { index: true, type: Number },

  powCountIn: { index: true, type: Number },
  powValueIn: { index: true, type: Number },

  sequence: { required: true, type: Number }
}, { _id: false, versionKey: false });

carverAddressSchema.index({ carverAddressType: 1, sequence: 1 }); // Important compound index as we're doing a lot of find()+sort by carverAddresType/sequence
const CarverAddress = mongoose.model('CarverAddress', carverAddressSchema, 'carverAddresses');

const carverMovementsSchema = new mongoose.Schema({
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
  posInputBlockHeightDiff: { index: true, type: Number }, // blockHeight-posInputBlockHeightDiff
  posRewardAmount: { type: Number }, // Because POS TX can have multiple outputs we'll need to assign it to one of these outputs (for unreconciliation)

  sequence: { unique: true, required: true, type: Number }
}, { _id: false, versionKey: false });

// When viewing specific address we'll be filtering by from/to and sorting by sequence so we'll need these two compound indexes
carverMovementsSchema.index({ targetAddress: 1, sequence: 1 }, { unique: true });
carverMovementsSchema.index({ targetTx: 1, sequence: 1 }, { unique: true });

// We'll be doing a lot of sorting on type + sequence so let's create an index on that as well
carverMovementsSchema.index({ carverAddressType: 1, sequence: 1 }, { unique: true });


const CarverMovement = mongoose.model('CarverMovement', carverMovementsSchema, 'carverMovements');

module.exports = {
  CarverAddress,
  CarverMovement
}