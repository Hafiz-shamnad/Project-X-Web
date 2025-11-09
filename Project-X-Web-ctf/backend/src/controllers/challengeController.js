const { prisma } = require('../config/db');

exports.getChallenges = async (req, res) => {
  try {
    const challenges = await prisma.challenge.findMany();
    res.json(challenges);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
