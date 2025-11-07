const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const FlagSubmissionSchema = new Schema({
  instance_id: { type: Schema.Types.ObjectId, ref: 'Instance' },
  team_id: { type: Schema.Types.ObjectId, ref: 'Team' },
  flag_submitted: String,
  is_correct: Boolean,
  submitted_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('FlagSubmission', FlagSubmissionSchema);
