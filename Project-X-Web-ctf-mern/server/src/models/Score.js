const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ScoreSchema = new Schema({
  team_id: { type: Schema.Types.ObjectId, ref: 'Team' },
  challenge_id: { type: Schema.Types.ObjectId, ref: 'Challenge' },
  points: { type: Number, default: 0 },
  updated_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Score', ScoreSchema);
