
const mongoose = require('mongoose');

/**
 * Timed Interval Statistics
 *
 * Allows us to store pre-computed aggregated data on a wide variety of time-based intervals (ex: daily, hourly, per-block, etc.)
 */

const socialSubmissionSchema = new mongoose.Schema({
  name: { required: true, type: String },
  type: { required: true, type: Number },
  intervalNumber: { required: true, type: Number }, // The above representation in numerical form (ex: timestamp, block number)
  group: { required: true, type: String },

  /**
   * Common storage format across different social networks
   */
  title: { required: true, type: String },
  description: { required: true, type: String },
  points: { required: true, type: Number },
  url: { required: true, type: String },
  thumbnail: { required: true, type: String },
  tag: { required: true, type: String },
}, { versionKey: false });

const SocialSubmission = mongoose.model('SocialSubmission', socialSubmissionSchema, 'socialSubmissions');

module.exports = {
  SocialSubmission,
}