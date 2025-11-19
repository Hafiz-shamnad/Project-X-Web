/**
 * Flag Submission Controller (ESM + Secured + Optimized)
 */

import prisma from "../config/db.js";
import hashFlag from "../utils/hashFlag.js";

const FIRST_SOLVER_BONUS = 0.5;
const POINT_DECAY = 0.05;

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

  // Permanent ban (9999 date)
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

  if (until > now) {
    const minutes = Math.ceil((until - now) / 60000);
    return {
      blocked: true,
      response: {
        status: "banned",
        permanent: false,
        bannedUntil: until,
        remainingMinutes: minutes,
        message: `Team banned for ${minutes} more minutes`
      }
    };
  }

  // expired → auto-unban
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
    const userId = req.user?.id; // 🔒 SECURE: Always authenticated user
    const { challengeId, flag } = req.body;

    if (!userId || !challengeId || !flag) {
      return res.status(400).json({ error: "Missing fields" });
    }

    const cid = Number(challengeId);

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, teamId: true }
    });

    if (!user) return res.status(404).json({ error: "User not found" });

    /* ---------------------------------------------------------------------- */
    /* Ban Check                                                              */
    /* ---------------------------------------------------------------------- */

    const banCheck = await checkTeamBan(user.teamId);
    if (banCheck.blocked) return res.status(403).json(banCheck.response);

    /* ---------------------------------------------------------------------- */
    /* Fetch Challenge                                                        */
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
    /* Prevent Duplicate Solve                                                */
    /* ---------------------------------------------------------------------- */

    const existingSolve = await prisma.solved.findFirst({
      where: {
        OR: [
          { userId: user.id, challengeId: cid },
          user.teamId ? { teamId: user.teamId, challengeId: cid } : undefined
        ].filter(Boolean)
      }
    });

    if (existingSolve) {
      return res.json({ status: "already_solved", message: "Already solved" });
    }

    /* ---------------------------------------------------------------------- */
    /* Validate Flag                                                          */
    /* ---------------------------------------------------------------------- */

    const correct = hashFlag(flag) === challenge.flagHash;

    // Log every submission
    await prisma.attempt.create({
      data: {
        userId: user.id,
        challengeId: cid,
        ip: req.ip,
        correct
      }
    });

    if (!correct) {
      return res.json({ status: "incorrect", message: "Incorrect flag" });
    }

    /* ---------------------------------------------------------------------- */
    /* Dynamic Scoring                                                        */
    /* ---------------------------------------------------------------------- */

    const solveCount = await prisma.solved.count({
      where: { challengeId: cid }
    });

    let awarded = challenge.points;

    if (solveCount === 0) {
      // First blood
      awarded = Math.ceil(awarded * (1 + FIRST_SOLVER_BONUS));
    } else {
      // Score decay
      const decay = Math.max(0, 1 - POINT_DECAY * solveCount);
      awarded = Math.max(10, Math.ceil(awarded * decay));
    }

    // Record Solve
    await prisma.solved.create({
      data: {
        userId: user.id,
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
    return res.status(500).json({ error: "Server error submitting flag" });
  }
}

export default { submitFlag };
