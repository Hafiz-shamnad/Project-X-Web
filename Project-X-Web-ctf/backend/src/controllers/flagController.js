const crypto = require('crypto');
const { prisma } = require('../config/db');

const FLAG_SALT = process.env.FLAG_SALT || '';
const FIRST_SOLVER_BONUS = Number(process.env.FIRST_SOLVER_BONUS || 0.2); // 20%
const POINT_DECAY_PER_SOLVE = Number(process.env.POINT_DECAY_PER_SOLVE || 0.01);

function hashFlag(flag) {
  return crypto.createHash('sha256').update(FLAG_SALT + flag.trim()).digest('hex');
}

exports.submitFlag = async (req, res) => {
  const { username, challengeId, flag } = req.body;
  const ip = req.ip || req.headers['x-forwarded-for'] || null;

  if (!username || !challengeId || !flag)
    return res.status(400).json({ error: 'username, challengeId, flag required' });

  try {
    // 🧩 find or create user
    let user = await prisma.user.findUnique({ where: { username } });
    if (!user) {
      user = await prisma.user.create({ data: { username, passwordHash: '' } });
    }

    // 🧠 get user's team (if any)
    const teamId = user.teamId || null;

    // 🧾 log attempt
    const attempted = await prisma.attempt.create({
      data: { userId: user.id, challengeId: Number(challengeId), ip, correct: false },
    });

    const challenge = await prisma.challenge.findUnique({
      where: { id: Number(challengeId) },
    });

    if (!challenge || !challenge.flagHash) {
      return res.status(404).json({ error: 'Challenge not found or flag not published' });
    }

    // 🚫 already solved by user or team
    const already = await prisma.solved.findFirst({
      where: {
        OR: [
          { userId: user.id, challengeId: Number(challengeId) },
          teamId ? { teamId, challengeId: Number(challengeId) } : undefined,
        ].filter(Boolean),
      },
    });
    if (already)
      return res.status(200).json({ status: 'already_solved', message: 'Already solved' });

    // ✅ verify
    const submittedHash = hashFlag(flag);
    if (submittedHash !== challenge.flagHash) {
      return res.status(200).json({ status: 'incorrect', message: 'Wrong flag' });
    }

    // 🧮 Compute dynamic points
    const numSolvesSoFar = await prisma.solved.count({
      where: { challengeId: Number(challengeId) },
    });

    let awarded = challenge.points;
    if (numSolvesSoFar === 0) {
      awarded = Math.ceil(awarded * (1 + FIRST_SOLVER_BONUS));
    } else {
      const decay = Math.max(0, 1 - POINT_DECAY_PER_SOLVE * numSolvesSoFar);
      awarded = Math.max(10, Math.ceil(awarded * decay));
    }

    // 🧩 Create solved record
    await prisma.solved.create({
      data: {
        userId: user.id,
        challengeId: Number(challengeId),
        teamId,
        points: awarded, // ✅ Store awarded points
      },
    });

    // 🧩 Update attempt to correct
    await prisma.attempt.update({
      where: { id: attempted.id },
      data: { correct: true },
    });

    // 🧩 Compute totals
    const solvedRecords = await prisma.solved.findMany({
      where: { userId: user.id },
    });
    const totalUserScore = solvedRecords.reduce((sum, s) => sum + s.points, 0);

    let totalTeamScore = 0;
    if (teamId) {
      const teamSolves = await prisma.solved.findMany({ where: { teamId } });
      totalTeamScore = teamSolves.reduce((sum, s) => sum + s.points, 0);
    }

    return res.json({
      status: 'correct',
      message: 'Flag correct',
      pointsAwarded: awarded,
      userTotal: totalUserScore,
      teamTotal: totalTeamScore,
      teamId,
    });
  } catch (err) {
    console.error('flag submit error', err);
    return res.status(500).json({ error: 'server_error' });
  }
};
