const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ChallengeSchema = new Schema({
  title: String,
  slug: { type: String, unique: true },
  description: String,
  docker_image: String,
  public_port: Number,
  created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Challenge', ChallengeSchema);
