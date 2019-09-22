
const mongoose = require('mongoose');

const TimeIntervalType = {
  DailyAvgPosRoi: 0,
  BlockNumberOfTransactions: 1
}

/**
 * Timed Interval Statistics
 *
 * Allows us to store pre-computed aggregated data on a wide variety of time-based intervals (ex: daily, hourly, per-block, etc.)
 */

const timeIntervalsSchema = new mongoose.Schema({
  type: { required: true, type: Number },
  label: { required: true, type: String },
  intervalNumber: { required: true, type: Number }, // The above representation in numerical form (ex: timestamp, block number)

  value: { required: true, type: Number },
}, { versionKey: false });
timeIntervalsSchema.index({ type: 1, intervalNumber: 1 }, { unique: true });

const TimeInterval = mongoose.model('TimeIntervals', timeIntervalsSchema, 'timeIntervals');


//@todo Uncomment if needed, remove if not used
/*const TimeIntervalSync = mongoose.model('TimeIntervalSyncs', new mongoose.Schema({
  type: { index: true, required: true, type: Number },

  lastInterval: { required: true, type: Number },
}, { versionKey: false }), 'timeIntervalSyncs');*/


module.exports = {
  TimeIntervalType,
  TimeInterval,
  //TimeIntervalSync
}