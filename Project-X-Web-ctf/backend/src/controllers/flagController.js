// src/controllers/flagController.js
const crypto = require('crypto');
const { prisma } = require('../config/db'); // assumes you export prisma in config/db

function hashFlag(flag) {
  return crypto.createHash('sha256').update(flag).digest('hex');
}

exports.submitFlag = async (req, res) => {
  const { username, challengeId, flag } = req.body;
  if (!username || !challengeId || !flag) {
    return res.status(400).json({ error: 'username, challengeId and flag are required' });
  }

  try {
    // find user
    let user = await prisma.user.findUnique({ where: { username } });
    if (!user) {
      // auto-create user for now
      user = await prisma.user.create({ data: { username } });
    }

    // fetch challenge (include flagHash)
    const challenge = await prisma.challenge.findUnique({ where: { id: Number(challengeId) } });
    if (!challenge || !challenge.flagHash) {
      return res.status(404).json({ error: 'Challenge not found or flag not published' });
    }

    // check if already solved
    const already = await prisma.solved.findUnique({
      where: { userId_challengeId: { userId: user.id, challengeId: Number(challengeId) } }
    }).catch(() => null);

    if (already) {
      return res.status(200).json({ status: 'already_solved', message: 'Challenge already solved', points: 0 });
    }

    // verify flag
    const submittedHash = hashFlag(flag.trim());
    if (submittedHash === challenge.flagHash) {
      // create solved record
      await prisma.solved.create({
        data: { userId: user.id, challengeId: Number(challengeId) }
      });

      // compute new score
      const solvedRecords = await prisma.solved.findMany({
        where: { userId: user.id },
        include: { challenge: true }
      });
      const total = solvedRecords.reduce((s, r) => s + (r.challenge?.points || 0), 0);

      return res.json({
        status: 'correct',
        message: 'Flag correct! Points awarded.',
        pointsAwarded: challenge.points,
        totalScore: total
      });
    } else {
      return res.status(200).json({ status: 'incorrect', message: 'Wrong flag' });
    }
    
  } catch (err) {
    console.error('Flag submit error', err);
    return res.status(500).json({ error: 'Server error' });
  }
};
