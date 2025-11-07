const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const InstanceSchema = new Schema({
  challenge_id: { type: Schema.Types.ObjectId, ref: 'Challenge' },
  team_id: { type: Schema.Types.ObjectId, ref: 'Team' },
  container_id: String,
  host_port: Number,
  expires_at: Date,
  is_active: { type: Boolean, default: true }
});

module.exports = mongoose.model('Instance', InstanceSchema);
