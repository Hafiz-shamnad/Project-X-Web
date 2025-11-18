/**
 * Admin Controller (ESM, Optimized, Secure)
 * -----------------------------------------
 * Handles:
 *  - Challenge CRUD
 *  - Challenge release toggle
 *  - Team listing (deduped solves, scoring)
 *  - Team bans & penalties
 */

import fs from "fs";
import prisma from "../config/db.js";
import hashFlag from "../utils/hashFlag.js";
import { broadcast } from "../lib/ws/ws.js"; 

// helper for creating announcement rows + broadcast (keeps code DRY)
async function sendAnnouncement({ title, message }) {
  try {
    const ann = await prisma.announcement.create({
      data: { title, message },
    });

    // Broadcast minimal payload to clients (don't leak DB internals)
    broadcast({
      type: "announcement",
      id: ann.id,
      title: ann.title,
      message: ann.message,
      createdAt: ann.createdAt,
    });

    return ann;
  } catch (err) {
    console.error("Announcement create/broadcast failed:", err);
    // do not throw — announcement failure shouldn't block main admin action
    return null;
  }
}

/* ========================================================================== */
/*                              CREATE CHALLENGE                               */
/* ========================================================================== */

export async function createChallenge(req, res) {
  try {
    const {
      name,
      category,
      difficulty,
      points,
      description,
      flag,
      released,
      imageName
    } = req.body;

    const filePath = req.file?.path ?? null;

    const hasContainer = Boolean(imageName?.trim());

    const challengeData = {
      name,
      category,
      difficulty,
      description,
      filePath,
      points: Number(points),
      released: released === "true",
      flagHash: flag ? hashFlag(flag) : null,
      hasContainer,
      imageName: hasContainer ? imageName.trim() : null
    };

    const challenge = await prisma.challenge.create({ data: challengeData });

    return res.json({ ok: true, challenge });

  } catch (err) {
    console.error("Create challenge error:", err);

    if (err.code === "P2002") {
      return res.status(400).json({
        error: "A challenge with this name already exists."
      });
    }

    return res.status(500).json({ error: "Failed to create challenge" });
  }
}

/* ========================================================================== */
/*                              UPDATE CHALLENGE                               */
/* ========================================================================== */

export async function updateChallenge(req, res) {
  try {
    const id = Number(req.params.id);

    const {
      name,
      category,
      difficulty,
      points,
      description,
      flag
    } = req.body;

    const updateData = {
      name,
      category,
      difficulty,
      description,
      points: Number(points)
    };

    if (flag) updateData.flagHash = hashFlag(flag);
    if (req.file) updateData.filePath = req.file.path;

    const challenge = await prisma.challenge.update({
      where: { id },
      data: updateData
    });

    return res.json({ ok: true, challenge });
  } catch (err) {
    console.error("Update challenge error:", err);
    return res.status(500).json({ error: "Failed to update challenge" });
  }
}

/* ========================================================================== */
/*                              DELETE CHALLENGE                               */
/* ========================================================================== */

export async function deleteChallenge(req, res) {
  try {
    const id = Number(req.params.id);

    const challenge = await prisma.challenge.findUnique({
      where: { id },
      select: { filePath: true }
    });

    if (!challenge)
      return res.status(404).json({ error: "Challenge not found" });

    if (challenge.filePath && fs.existsSync(challenge.filePath)) {
      fs.unlink(challenge.filePath, () => {});
    }

    await prisma.challenge.delete({ where: { id } });

    return res.json({ ok: true });
  } catch (err) {
    console.error("Delete challenge error:", err);
    return res.status(500).json({ error: "Failed to delete challenge" });
  }
}

/* ========================================================================== */
/*                              LIST CHALLENGES                                */
/* ========================================================================== */

export async function getAllChallenges(req, res) {
  try {
    const challenges = await prisma.challenge.findMany({
      select: {
        id: true,
        name: true,
        category: true,
        difficulty: true,
        points: true,
        description: true,
        filePath: true,
        released: true,
        createdAt: true
      },
      orderBy: { createdAt: "desc" }
    });

    return res.json(challenges);
  } catch (err) {
    console.error("Fetch challenges error:", err);
    return res.status(500).json({ error: "Failed to fetch challenges" });
  }
}

/* ========================================================================== */
/*                        TOGGLE CHALLENGE RELEASE                             */
/* ========================================================================== */

export async function toggleRelease(req, res) {
  try {
    const id = Number(req.params.id);
    // expecting { released: true/false } in body
    const { released } = req.body;

    const challenge = await prisma.challenge.update({
      where: { id },
      data: { released },
    });

    // Friendly public announcement message
    const msg = released
      ? `Challenge "${challenge.name}" is now released — good luck!`
      : `Challenge "${challenge.name}" has been hidden by the admins.`;

    sendAnnouncement({
      title: `Challenge ${released ? "released" : "hidden"}`,
      message: msg,
    });

    return res.json({ ok: true, challenge });
  } catch (err) {
    console.error("Error toggling challenge release:", err);
    return res.status(500).json({ error: "Failed to toggle release status" });
  }
}

/* ========================================================================== */
/*                                 LIST TEAMS                                  */
/* ========================================================================== */

export async function getAllTeams(req, res) {
  try {
    const teams = await prisma.team.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        members: {
          select: {
            id: true,
            username: true,
            solved: {
              include: { challenge: true }
            }
          }
        }
      }
    });

    // Ultra-fast dedupe + scoring
    const formatted = teams.map(team => {
      const unique = new Map();

      for (const member of team.members) {
        for (const s of member.solved) {
          if (!unique.has(s.challengeId)) {
            unique.set(s.challengeId, s);
          }
        }
      }

      const uniqueSolves = [...unique.values()];

      const rawScore = uniqueSolves.reduce(
        (sum, s) => sum + (s.challenge?.points ?? 0),
        0
      );

      const penalty = team.penaltyPoints ?? 0;
      const totalScore = Math.max(0, rawScore - penalty);

      return {
        id: team.id,
        name: team.name,
        createdAt: team.createdAt,
        bannedUntil: team.bannedUntil,

        members: team.members.map(m => ({
          id: m.id,
          username: m.username
        })),

        solvedCount: uniqueSolves.length,
        rawScore,
        totalScore,
        penaltyPoints: penalty
      };
    });

    return res.json(formatted);
  } catch (err) {
    console.error("Fetch teams error:", err);
    return res.status(500).json({ error: "Failed to fetch teams" });
  }
}

/* ========================================================================== */
/*                                  BAN TEAM                                   */
/* ========================================================================== */

export async function banTeam(req, res) {
  try {
    const { id } = req.params;
    const { durationMinutes } = req.body;

    let bannedUntil;

    if (Number(durationMinutes) === 0) {
      // Permanent ban → store far-future date
      bannedUntil = new Date("9999-12-31T23:59:59Z");
    } else if (Number(durationMinutes) > 0) {
      bannedUntil = new Date(Date.now() + Number(durationMinutes) * 60 * 1000);
    } else {
      return res.status(400).json({ error: "Invalid ban duration" });
    }

    const team = await prisma.team.update({
      where: { id: Number(id) },
      data: { bannedUntil },
      include: { members: true },
    });

    const msg =
      Number(durationMinutes) === 0
        ? `Team "${team.name}" has been permanently banned by administrators.`
        : `Team "${team.name}" has been suspended for ${durationMinutes} minute(s).`;

    // send announcement asynchronously (non-blocking)
    sendAnnouncement({
      title: `Team ${Number(durationMinutes) === 0 ? "banned" : "suspended"}`,
      message: msg,
    });

    return res.json({
      ok: true,
      message:
        Number(durationMinutes) === 0
          ? "Team permanently banned"
          : `Team banned for ${durationMinutes} minutes`,
    });
  } catch (err) {
    console.error("Error banning team:", err);
    return res.status(500).json({ error: "Failed to ban team" });
  }
}

/* ========================================================================== */
/*                                UNBAN TEAM                                   */
/* ========================================================================== */

export async function unbanTeam(req, res) {
  try {
    const { id } = req.params;

    const team = await prisma.team.update({
      where: { id: Number(id) },
      data: { bannedUntil: null },
      include: { members: true },
    });

    // announce
    sendAnnouncement({
      title: "Team unbanned",
      message: `Team "${team.name}" has been unbanned and can participate again.`,
    });

    return res.json({
      ok: true,
      message: "Team unbanned successfully",
    });
  } catch (err) {
    console.error("Error unbanning team:", err);
    return res.status(500).json({ error: "Failed to unban team" });
  }
}


/* ========================================================================== */
/*                               APPLY PENALTY                                 */
/* ========================================================================== */

export async function reduceTeamScore(req, res) {
  try {
    const id = Number(req.params.id);
    const penalty = Number(req.body.penalty);

    if (Number.isNaN(penalty))
      return res.status(400).json({ error: "Invalid penalty" });

    const team = await prisma.team.findUnique({
      where: { id },
      include: {
        solved: { include: { challenge: true } }
      }
    });

    if (!team)
      return res.status(404).json({ error: "Team not found" });

    const rawScore = team.solved.reduce(
      (sum, s) => sum + (s.challenge?.points ?? 0),
      0
    );

    const updatedPenalty = (team.penaltyPoints ?? 0) + penalty;
    const finalScore = Math.max(0, rawScore - updatedPenalty);

    await prisma.team.update({
      where: { id },
      data: { penaltyPoints: updatedPenalty }
    });

    return res.json({
      ok: true,
      message: `Penalty applied: ${penalty}. Total penalty: ${updatedPenalty}`,
      rawScore,
      finalScore
    });
  } catch (err) {
    console.error("Penalty error:", err);
    return res.status(500).json({ error: "Failed to apply penalty" });
  }
}

export default {
  createChallenge,
  updateChallenge,
  deleteChallenge,
  getAllChallenges,
  toggleRelease,
  getAllTeams,
  banTeam,
  unbanTeam,
  reduceTeamScore
};
