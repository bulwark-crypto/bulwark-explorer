
const mongoose = require('mongoose');

/*
Useful mongo queries:

db.currentOp({"secs_running":{$gte:1}})                                               // Find mongo queries >1 sec in execution time. Most likely you will need a new index or optimize query.
db.carverAddresses.aggregate([{ $indexStats: {} },{$match:{"accesses.ops":0}}])       // Find unused index with 0 accesses

@todo We can further optimize indexes by adding conditions to them
*/

const carverAddressSchema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  label: { required: true, unique: true, index: true, type: String },
  balance: { required: true, type: Number },

  blockHeight: { index: true, required: true, type: Number }, // By storing block height we know WHEN this address was created (Technically, it could have been created during invalid block as well)
  date: { required: true, type: Date },
  carverAddressType: { required: true, type: Number },

  lastMovement: { type: mongoose.Schema.Types.ObjectId, ref: 'CarverMovement' },
  valueOut: { required: true, type: Number /*, index: true Possible Analytics Examples: Sort by wallets with most/least funds out)*/ },
  valueIn: { required: true, type: Number/*, index: true*/ },
  countIn: { required: true, type: Number/*, index: true*/ },
  countOut: { required: true, type: Number/*, index: true*/ },

  // Track rewards (CarverAddressType.Address only). That way we can subtract them from countIn/countOut to get number of non-reward txs
  posCountIn: { type: Number,/*, index: true*/ },
  posValueIn: { type: Number/*, index: true*/ },

  mnCountIn: { type: Number/*, index: true*/ },
  mnValueIn: { type: Number/*, index: true*/ },

  powCountIn: { type: Number/*, index: true*/ },
  powValueIn: { type: Number/*, index: true*/ },

  sequence: { index: true, required: true, type: Number } // Not unique because two addresses can have same sequence
}, { _id: false, versionKey: false });

carverAddressSchema.index({ carverAddressType: 1, sequence: 1 }); // Important compound index as we're doing a lot of find()+sort by carverAddresType/sequence
carverAddressSchema.index({ carverAddressType: 1, valueOut: 1 }); // Since we have new Sort By "Value"

carverAddressSchema.index({ carverAddressType: 1, balance: 1 }); // For rich list (@todo, add condition for address)

const CarverAddress = mongoose.model('CarverAddress', carverAddressSchema, 'carverAddresses');

const carverMovementsSchema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,

  carverMovementType: { required: true, type: Number },

  label: { required: true, unique: true, index: true, type: String },
  amount: { required: true, type: Number/*, index: true*/ },

  blockHeight: { index: true, required: true, type: Number }, // By storing block height we know how many blocks ago/confirmations we have
  date: { required: true, type: Date/*, index: true*/ },
  fromBalance: { required: true, type: Number },
  toBalance: { required: true, type: Number },

  from: { required: true, type: mongoose.Schema.Types.ObjectId, ref: 'CarverAddress' },
  to: { required: true, type: mongoose.Schema.Types.ObjectId, ref: 'CarverAddress' },

  // We'll use this for finding movements for specific address/tx (also note the two compound indexes below).
  // Because all movements are tx->address or address->tx both of these fields are always filled
  contextAddress: { type: mongoose.Schema.Types.ObjectId, ref: 'CarverAddress' }, // What address does this movement belong to? (ex: when looking at movements for specific address)
  contextTx: { type: mongoose.Schema.Types.ObjectId, ref: 'CarverAddress' }, // What tx does this movement belong to?

  sequence: { index: true, unique: true, required: true, type: Number },

  // These two fields are required for unreconciliation. When we undo a carver movement we set the from/to address sequences back to what they were before the movement happened.
  lastFromMovement: { type: mongoose.Schema.Types.ObjectId, ref: 'CarverMovement' },
  lastToMovement: { type: mongoose.Schema.Types.ObjectId, ref: 'CarverMovement' },

  // For POS rewards store additional info
  //@todo Remove all of these (in favor of new address type TxReward). From there we can figure out all of this data
  destinationAddress: { type: mongoose.Schema.Types.ObjectId, ref: 'CarverAddress' }, // POS, MN & POW Rewards will also have a destinationAddress
  posInputAmount: { type: Number/*, index: true*/ }, // What was the input amount of the stake
  posInputBlockHeightDiff: { type: Number }, // blockHeight-posInputBlockHeightDiff
  posRewardAmount: { type: Number } // Because POS TX can have multiple outputs we'll need to assign it to one of these outputs (for unreconciliation)
}, { _id: false, versionKey: false });

carverMovementsSchema.index({ blockHeight: 1, sequence: 1 }, { unique: true }); // For unreconciliation query (blockHeight: gte, order by sequence)

// When viewing specific address we'll be filtering by from/to and sorting by sequence so we'll need these two compound indexes
carverMovementsSchema.index({ contextAddress: 1, sequence: 1 }, { unique: true });
carverMovementsSchema.index({ contextTx: 1, sequence: 1 }, { unique: true });

// We'll be doing a lot of sorting on type + sequence so let's create an index on that as well
// At the moment we only use this for reward breakdown, after that moves to new address type we could remove this
carverMovementsSchema.index({ carverMovementType: 1, sequence: 1 }, { unique: true });


const CarverMovement = mongoose.model('CarverMovement', carverMovementsSchema, 'carverMovements');

module.exports = {
  CarverAddress,
  CarverMovement
}