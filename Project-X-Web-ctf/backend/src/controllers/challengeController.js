import Challenge from '../models/Challenge.js';
import User from '../models/User.js';

export const getChallenges = async (req, res) => {
  const challenges = await Challenge.find().select('-flag');
  res.json(challenges);
};

export const submitFlag = async (req, res) => {
  const { userId, challengeId, submittedFlag } = req.body;
  const challenge = await Challenge.findById(challengeId);
  if (!challenge) return res.status(404).json({ message: 'Challenge not found' });

  if (submittedFlag === challenge.flag) {
    await User.findByIdAndUpdate(userId, { $inc: { score: challenge.points } });
    res.json({ message: '✅ Correct flag! Points awarded.' });
  } else {
    res.status(400).json({ message: '❌ Incorrect flag.' });
  }
};
