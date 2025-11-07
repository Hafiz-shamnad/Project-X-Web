const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TeamSchema = new Schema({
  name: { type: String, unique: true },
  created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Team', TeamSchema);
