const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const FlagSchema = new Schema({
  challenge_id: { type: Schema.Types.ObjectId, ref: 'Challenge' },
  flag: String,
  is_active: { type: Boolean, default: true }
});

module.exports = mongoose.model('Flag', FlagSchema);
