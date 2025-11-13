/**
 * Flag Submission Controller
 * --------------------------
 * Responsibilities:
 *  - Validate and process flag submissions
 *  - Enforce temporary and permanent team bans
 *  - Auto-unban expired bans
 *  - Log attempts
 *  - Apply dynamic scoring (first blood bonus and decay)
 *  - Update user and team scores
 */

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const FIRST_SOLVER_BONUS = 0.5;           // +50% for first solver
const POINT_DECAY_PER_SOLVE = 0.05;       // 5% decay per additional solve

const hashFlag = require("../utils/hashFlag");


/* -------------------------------------------------------------------------- */
/*                         MAIN FLAG SUBMISSION HANDLER                       */
/* -------------------------------------------------------------------------- */

/**
 * Handle user flag submission.
 * @route POST /api/submit
 */
exports.submitFlag = async (req, res) => {
  const { username, challengeId, flag } = req.body;
  const ip = req.ip || req.headers["x-forwarded-for"] || null;

  if (!username || !challengeId || !flag) {
    return res.status(400).json({
      error: "username, challengeId, and flag are required",
    });
  }

  try {
    /* ---------------------------------------------------------------------- */
    /* 1. Load User */
    /* ---------------------------------------------------------------------- */
    const user = await prisma.user.findUnique({
      where: { username },
    });

    if (!user) {
      return res.status(400).json({ error: "User not found" });
    }

    const teamId = user.teamId || null;

    /* ---------------------------------------------------------------------- */
    /* 2. Enforce Team Ban (blocks submission if banned) */
    /* ---------------------------------------------------------------------- */
    const banCheck = await checkTeamBan(teamId);
    if (banCheck.blocked) {
      return res.status(403).json(banCheck.response);
    }

    /* ---------------------------------------------------------------------- */
    /* 3. Log Attempt (incorrect by default) */
    /* ---------------------------------------------------------------------- */
    const attemptRecord = await prisma.attempt.create({
      data: {
        userId: user.id,
        challengeId: Number(challengeId),
        ip,
        correct: false,
      },
    });

    /* ---------------------------------------------------------------------- */
    /* 4. Load Challenge */
    /* ---------------------------------------------------------------------- */
    const challenge = await prisma.challenge.findUnique({
      where: { id: Number(challengeId) },
    });

    if (!challenge || !challenge.flagHash) {
      return res.status(404).json({
        error: "Challenge not found or not available",
      });
    }

    /* ---------------------------------------------------------------------- */
    /* 5. Prevent Re-solve (user or team already solved) */
    /* ---------------------------------------------------------------------- */
    const solvedAlready = await prisma.solved.findFirst({
      where: {
        OR: [
          { userId: user.id, challengeId: Number(challengeId) },
          teamId ? { teamId, challengeId: Number(challengeId) } : undefined,
        ].filter(Boolean),
      },
    });

    if (solvedAlready) {
      return res.json({
        status: "already_solved",
        message: "This challenge has already been solved.",
      });
    }

    /* ---------------------------------------------------------------------- */
    /* 6. Validate Flag */
    /* ---------------------------------------------------------------------- */
    const submittedHash = hashFlag(flag);

    if (submittedHash !== challenge.flagHash) {
      return res.json({
        status: "incorrect",
        message: "Incorrect flag",
      });
    }

    /* ---------------------------------------------------------------------- */
    /* 7. Dynamic Scoring */
    /* ---------------------------------------------------------------------- */
    const solveCount = await prisma.solved.count({
      where: { challengeId: Number(challengeId) },
    });

    let awardedPoints = challenge.points;

    if (solveCount === 0) {
      // First solver receives bonus
      awardedPoints = Math.ceil(
        awardedPoints * (1 + FIRST_SOLVER_BONUS)
      );
    } else {
      // Apply decay per solve
      const decayFactor = Math.max(0, 1 - POINT_DECAY_PER_SOLVE * solveCount);
      awardedPoints = Math.max(
        10,
        Math.ceil(awardedPoints * decayFactor)
      );
    }

    /* ---------------------------------------------------------------------- */
    /* 8. Mark Attempt as Correct */
    /* ---------------------------------------------------------------------- */
    await prisma.attempt.update({
      where: { id: attemptRecord.id },
      data: { correct: true },
    });

    /* ---------------------------------------------------------------------- */
    /* 9. Insert Solve Record */
    /* ---------------------------------------------------------------------- */
    await prisma.solved.create({
      data: {
        userId: user.id,
        teamId,
        challengeId: Number(challengeId),
        points: awardedPoints,
      },
    });

    /* ---------------------------------------------------------------------- */
    /* 10. Recalculate User Total Score */
    /* ---------------------------------------------------------------------- */
    const userSolves = await prisma.solved.findMany({
      where: { userId: user.id },
    });

    const userTotalScore = userSolves.reduce(
      (sum, s) => sum + s.points,
      0
    );

    /* ---------------------------------------------------------------------- */
    /* 11. Recalculate Team Total Score (if team exists) */
    /* ---------------------------------------------------------------------- */
    let teamTotalScore = 0;

    if (teamId) {
      const teamSolves = await prisma.solved.findMany({
        where: { teamId },
      });

      teamTotalScore = teamSolves.reduce(
        (sum, s) => sum + s.points,
        0
      );
    }

    /* ---------------------------------------------------------------------- */
    /* 12. Final Successful Response */
    /* ---------------------------------------------------------------------- */
    return res.json({
      status: "correct",
      message: "Flag accepted",
      pointsAwarded: awardedPoints,
      userTotal: userTotalScore,
      teamTotal: teamTotalScore,
      teamId,
    });
  } catch (err) {
    console.error("Flag Submission Error:", err);
    return res.status(500).json({ error: "server_error" });
  }
};


/* -------------------------------------------------------------------------- */
/*                       TEAM BAN VALIDATION HELPER                           */
/* -------------------------------------------------------------------------- */

/**
 * Check and enforce team ban status.
 *
 * Ban rules:
 *  - null           → not banned
 *  - "PERMANENT"    → permanently banned
 *  - future Date    → temporarily banned
 *  - past Date      → expired → auto-unban
 *
 * @param {number|null} teamId
 * @returns {object} ban evaluation result
 */
async function checkTeamBan(teamId) {
  if (!teamId) return { blocked: false };

  const team = await prisma.team.findUnique({
    where: { id: teamId },
  });

  const banValue = team?.bannedUntil;

  // Permanent ban
  if (banValue === "PERMANENT") {
    return {
      blocked: true,
      response: {
        status: "banned",
        permanent: true,
        message: "Your team has been permanently banned.",
      },
    };
  }

  // No ban (null)
  if (!banValue) return { blocked: false };

  const bannedUntil = new Date(banValue);
  const now = new Date();

  // Active temporary ban
  if (bannedUntil > now) {
    const remainingMinutes = Math.ceil((bannedUntil - now) / 60000);

    return {
      blocked: true,
      response: {
        status: "banned",
        permanent: false,
        bannedUntil,
        remainingMinutes,
        message: `Team is temporarily banned for ${remainingMinutes} more minutes.`,
      },
    };
  }

  // Ban expired → auto-unban
  if (bannedUntil <= now) {
    await prisma.team.update({
      where: { id: teamId },
      data: { bannedUntil: null },
    });
  }

  return { blocked: false };
}
