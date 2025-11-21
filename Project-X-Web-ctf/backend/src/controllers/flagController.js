/**
 * Flag Submission Controller (ESM + Secured + Optimized)
 */

import prisma from "../config/db.js";
import hashFlag from "../utils/hashFlag.js";

const FIRST_SOLVER_BONUS = 0.5;
const POINT_DECAY = 0.05;

/* -------------------------------------------------------------------------- */
/*                           AUTH HELPER (Cookie Based)                       */
/* -------------------------------------------------------------------------- */

function requireUser(req) {
  if (!req.user?.id) {
    const error = new Error("Unauthorized");
    error.status = 401;
    throw error;
  }
  return req.user.id;
}

/* -------------------------------------------------------------------------- */
/*                       TEAM BAN VALIDATION HELPER                           */
/* -------------------------------------------------------------------------- */

async function checkTeamBan(teamId) {
  if (!teamId) return { blocked: false };

  const team = await prisma.team.findUnique({
    where: { id: teamId },
    select: { bannedUntil: true }
  });

  if (!team || !team.bannedUntil) return { blocked: false };

  const until = new Date(team.bannedUntil);
  const now = new Date();

  // Permanent ban
  if (until.getFullYear() === 9999) {
    return {
      blocked: true,
      response: {
        status: "banned",
        permanent: true,
        message: "Your team is permanently banned."
      }
    };
  }

  // Still banned
  if (until > now) {
    const minutes = Math.ceil((until - now) / 60000);
    return {
      blocked: true,
      response: {
        status: "banned",
        permanent: false,
        bannedUntil: until,
        remainingMinutes: minutes,
        message: `Team banned for ${minutes} more minute(s)`
      }
    };
  }

  // Ban expired → auto-unban
  await prisma.team.update({
    where: { id: teamId },
    data: { bannedUntil: null }
  });

  return { blocked: false };
}

/* -------------------------------------------------------------------------- */
/*                         MAIN FLAG SUBMISSION HANDLER                       */
/* -------------------------------------------------------------------------- */

export async function submitFlag(req, res) {
  try {
    const userId = requireUser(req);

    const { challengeId, flag } = req.body;

    if (!challengeId || !flag) {
      return res.status(400).json({ error: "challengeId and flag are required" });
    }

    const cid = Number(challengeId);
    if (isNaN(cid)) {
      return res.status(400).json({ error: "Invalid challenge ID" });
    }

    /* ---------------------------------------------------------------------- */
    /* Fetch User (teamId required for scoring)                                */
    /* ---------------------------------------------------------------------- */

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, teamId: true }
    });

    if (!user) return res.status(404).json({ error: "User not found" });

    /* ---------------------------------------------------------------------- */
    /* Team Ban Check                                                         */
    /* ---------------------------------------------------------------------- */

    const banCheck = await checkTeamBan(user.teamId);
    if (banCheck.blocked) {
      return res.status(403).json(banCheck.response);
    }

    /* ---------------------------------------------------------------------- */
    /* Fetch Challenge                                                         */
    /* ---------------------------------------------------------------------- */

    const challenge = await prisma.challenge.findUnique({
      where: { id: cid },
      select: { flagHash: true, points: true, released: true }
    });

    if (!challenge || !challenge.flagHash) {
      return res.status(404).json({ error: "Challenge not found" });
    }

    if (!challenge.released) {
      return res.status(403).json({ error: "Challenge not yet released" });
    }

    /* ---------------------------------------------------------------------- */
    /* Prevent Duplicate Solve                                                 */
    /* ---------------------------------------------------------------------- */

    const existingSolve = await prisma.solved.findFirst({
      where: {
        OR: [
          { userId, challengeId: cid },
          user.teamId ? { teamId: user.teamId, challengeId: cid } : undefined
        ].filter(Boolean)
      }
    });

    if (existingSolve) {
      return res.json({
        status: "already_solved",
        message: "You or your team has already solved this challenge"
      });
    }

    /* ---------------------------------------------------------------------- */
    /* Validate Flag                                                           */
    /* ---------------------------------------------------------------------- */

    const correct = hashFlag(flag) === challenge.flagHash;

    await prisma.attempt.create({
      data: {
        userId,
        challengeId: cid,
        ip: req.headers["x-forwarded-for"]?.split(",")[0] || req.ip,
        correct
      }
    });

    if (!correct) {
      return res.json({ status: "incorrect", message: "Incorrect flag" });
    }

    /* ---------------------------------------------------------------------- */
    /* Dynamic Scoring                                                         */
    /* ---------------------------------------------------------------------- */

    const solveCount = await prisma.solved.count({
      where: { challengeId: cid }
    });

    let awarded = challenge.points;

    if (solveCount === 0) {
      // First blood bonus
      awarded = Math.ceil(awarded * (1 + FIRST_SOLVER_BONUS));
    } else {
      // Decay formula
      const decay = Math.max(0, 1 - POINT_DECAY * solveCount);
      awarded = Math.max(10, Math.ceil(awarded * decay));
    }

    /* ---------------------------------------------------------------------- */
    /* Record Solve                                                            */
    /* ---------------------------------------------------------------------- */

    await prisma.solved.create({
      data: {
        userId,
        teamId: user.teamId,
        challengeId: cid,
        points: awarded
      }
    });

    return res.json({
      status: "correct",
      pointsAwarded: awarded
    });

  } catch (err) {
    console.error("Flag submit error:", err);
    return res.status(err.status || 500).json({
      error: "Server error submitting flag"
    });
  }
}

export default { submitFlag };
