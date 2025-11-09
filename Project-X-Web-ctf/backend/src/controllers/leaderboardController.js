import User from '../models/User.js';

export const getLeaderboard = async (req, res) => {
  const leaderboard = await User.find().sort({ score: -1 }).limit(20);
  res.json(leaderboard);
};
