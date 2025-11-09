import mongoose from 'mongoose';

const challengeSchema = new mongoose.Schema({
  title: String,
  category: String,
  description: String,
  flag: String,
  points: Number,
});

export default mongoose.model('Challenge', challengeSchema);
