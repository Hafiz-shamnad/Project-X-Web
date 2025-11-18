/**
 * Flag Submission Controller (ESM + Optimized)
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

  if (!team || team.bannedUntil === null) return { blocked: false };

  if (team.bannedUntil === "PERMANENT")
    return {
      blocked: true,
      response: {
        status: "banned",
        permanent: true,
        message: "Your team is permanently banned."
      }
    };

  const until = new Date(team.bannedUntil);
  const now = new Date();

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

  // expired => auto-unban
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
    const { username, challengeId, flag } = req.body;

    if (!username || !challengeId || !flag)
      return res.status(400).json({ error: "Missing fields" });

    const cid = Number(challengeId);

    const user = await prisma.user.findUnique({
      where: { username },
      select: { id: true, teamId: true }
    });

    if (!user) return res.status(404).json({ error: "User not found" });

    const banCheck = await checkTeamBan(user.teamId);
    if (banCheck.blocked) return res.status(403).json(banCheck.response);

    const challenge = await prisma.challenge.findUnique({
      where: { id: cid },
      select: { flagHash: true, points: true }
    });

    if (!challenge || !challenge.flagHash)
      return res.status(404).json({ error: "Challenge not found" });

    /* ---------------------------------------------------------------------- */
    /* Prevent Duplicate Solve */
    /* ---------------------------------------------------------------------- */

    const exists = await prisma.solved.findFirst({
      where: {
        OR: [
          { userId: user.id, challengeId: cid },
          user.teamId ? { teamId: user.teamId, challengeId: cid } : undefined
        ].filter(Boolean)
      }
    });

    if (exists)
      return res.json({ status: "already_solved", message: "Already solved" });

    /* ---------------------------------------------------------------------- */
    /* Validate Flag */
    /* ---------------------------------------------------------------------- */

    if (hashFlag(flag) !== challenge.flagHash)
      return res.json({ status: "incorrect", message: "Incorrect flag" });

    /* ---------------------------------------------------------------------- */
    /* Dynamic Scoring */
    /* ---------------------------------------------------------------------- */

    const solveCount = await prisma.solved.count({
      where: { challengeId: cid }
    });

    let awarded = challenge.points;
    if (solveCount === 0) {
      awarded = Math.ceil(awarded * (1 + FIRST_SOLVER_BONUS));
    } else {
      const decay = Math.max(0, 1 - POINT_DECAY * solveCount);
      awarded = Math.max(10, Math.ceil(awarded * decay));
    }

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
    return res.status(500).json({ error: "Server error" });
  }
}

export default { submitFlag };
