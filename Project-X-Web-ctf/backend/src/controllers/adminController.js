/**
 * Admin Controller (ESM + Hardened + Secure + JWT Bearer Compatible)
 */

import fs from "fs";
import prisma from "../config/db.js";
import hashFlag from "../utils/hashFlag.js";
import { broadcast } from "../lib/ws/ws.js";

// Announcements helper
async function sendAnnouncement({ title, message }) {
  try {
    const ann = await prisma.announcement.create({
      data: { title, message },
    });

    try {
      broadcast({
        type: "announcement",
        id: ann.id,
        title: ann.title,
        message: ann.message,
        createdAt: ann.createdAt,
      });
    } catch (wsError) {
      console.error("WS Broadcast failed:", wsError);
    }

    return ann;
  } catch (err) {
    console.error("Announcement DB error:", err);
    return null;
  }
}

/* ========================================================================== */
/*                               ADMIN CHECK                                    */
/* ========================================================================== */

function assertAdmin(req) {
  if (!req.user || req.user.role !== "admin") {
    const error = new Error("Admin only");
    error.status = 403;
    throw error;
  }
}

/* ========================================================================== */
/*                              CREATE CHALLENGE                               */
/* ========================================================================== */

export async function createChallenge(req, res) {
  try {
    assertAdmin(req);

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

    const sanitizedImageName = imageName ? imageName.trim().replace(/[^\w-.]/g, "") : null;
    const hasContainer = Boolean(sanitizedImageName);

    const challengeData = {
      name,
      category,
      difficulty,
      description,
      filePath,
      points: Number(points),
      released: released === "true" || released === true,
      flagHash: flag ? hashFlag(flag) : null,
      hasContainer,
      imageName: hasContainer ? sanitizedImageName : null
    };

    const challenge = await prisma.challenge.create({ data: challengeData });

    return res.json({ ok: true, challenge });
  } catch (err) {
    console.error("Create challenge error:", err);

    if (err.code === "P2002") {
      return res.status(400).json({ error: "A challenge with this name already exists." });
    }

    return res.status(err.status || 500).json({
      error: err.status === 403 ? "Admin only" : "Failed to create challenge"
    });
  }
}

/* ========================================================================== */
/*                              UPDATE CHALLENGE                               */
/* ========================================================================== */

export async function updateChallenge(req, res) {
  try {
    assertAdmin(req);

    const id = Number(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: "Invalid challenge ID" });

    const existing = await prisma.challenge.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: "Challenge not found" });

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
    return res.status(err.status || 500).json({
      error: err.status === 403 ? "Admin only" : "Failed to update challenge"
    });
  }
}

/* ========================================================================== */
/*                              DELETE CHALLENGE                               */
/* ========================================================================== */

export async function deleteChallenge(req, res) {
  try {
    assertAdmin(req);

    const id = Number(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: "Invalid challenge ID" });

    const challenge = await prisma.challenge.findUnique({
      where: { id },
      select: { filePath: true }
    });

    if (!challenge) return res.status(404).json({ error: "Challenge not found" });

    if (challenge.filePath && fs.existsSync(challenge.filePath)) {
      try {
        await fs.promises.unlink(challenge.filePath);
      } catch (e) {
        console.error("File delete error:", e);
      }
    }

    await prisma.challenge.delete({ where: { id } });

    return res.json({ ok: true });
  } catch (err) {
    console.error("Delete challenge error:", err);
    return res.status(err.status || 500).json({
      error: err.status === 403 ? "Admin only" : "Failed to delete challenge"
    });
  }
}

/* ========================================================================== */
/*                              LIST CHALLENGES                                */
/* ========================================================================== */

export async function getAllChallenges(req, res) {
  try {
    assertAdmin(req);

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
    return res.status(err.status || 500).json({
      error: err.status === 403 ? "Admin only" : "Failed to fetch challenges"
    });
  }
}

/* ========================================================================== */
/*                          TOGGLE CHALLENGE RELEASE                           */
/* ========================================================================== */

export async function toggleRelease(req, res) {
  try {
    assertAdmin(req);

    const id = Number(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: "Invalid challenge ID" });

    const released = req.body.released === true || req.body.released === "true";

    const challenge = await prisma.challenge.update({
      where: { id },
      data: { released },
    });

    const msg = released
      ? `Challenge "${challenge.name}" is now released — good luck!`
      : `Challenge "${challenge.name}" has been hidden by the admins.`;

    sendAnnouncement({
      title: `Challenge ${released ? "Released" : "Hidden"}`,
      message: msg,
    });

    return res.json({ ok: true, challenge });
  } catch (err) {
    console.error("Toggle release error:", err);
    return res.status(err.status || 500).json({
      error: err.status === 403 ? "Admin only" : "Failed to toggle release"
    });
  }
}

/* ========================================================================== */
/*                                LIST TEAMS                                  */
/* ========================================================================== */

export async function getAllTeams(req, res) {
  try {
    assertAdmin(req);

    const teams = await prisma.team.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        members: {
          include: {
            solved: {
              include: { challenge: true }
            }
          }
        },
        solved: {
          include: { challenge: true }
        }
      }
    });

    const formatted = teams.map(team => {
      const merge = [...team.solved, ...team.members.flatMap(m => m.solved)];

      // Unique solves by challenge
      const unique = new Map();
      for (const s of merge) {
        if (!unique.has(s.challengeId)) {
          unique.set(s.challengeId, s);
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
        members: team.members.map(m => ({ id: m.id, username: m.username })),
        solvedCount: uniqueSolves.length,
        rawScore,
        totalScore,
        penaltyPoints: penalty
      };
    });

    return res.json(formatted);
  } catch (err) {
    console.error("Fetch teams error:", err);
    return res.status(err.status || 500).json({
      error: err.status === 403 ? "Admin only" : "Failed to fetch teams"
    });
  }
}

/* ========================================================================== */
/*                                  BAN TEAM                                   */
/* ========================================================================== */

export async function banTeam(req, res) {
  try {
    assertAdmin(req);

    const { id } = req.params;
    const { durationMinutes } = req.body;

    let bannedUntil;

    if (Number(durationMinutes) === 0) {
      bannedUntil = new Date("9999-12-31T23:59:59Z");
    } else if (Number(durationMinutes) > 0) {
      bannedUntil = new Date(Date.now() + Number(durationMinutes) * 60000);
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
        ? `Team "${team.name}" has been permanently banned.`
        : `Team "${team.name}" has been banned for ${durationMinutes} minute(s).`;

    sendAnnouncement({
      title: "Team Ban",
      message: msg,
    });

    return res.json({
      ok: true,
      message: msg,
    });
  } catch (err) {
    console.error("Ban team error:", err);
    return res.status(err.status || 500).json({
      error: err.status === 403 ? "Admin only" : "Failed to ban team"
    });
  }
}

/* ========================================================================== */
/*                                UNBAN TEAM                                   */
/* ========================================================================== */

export async function unbanTeam(req, res) {
  try {
    assertAdmin(req);

    const id = Number(req.params.id);

    const team = await prisma.team.update({
      where: { id },
      data: { bannedUntil: null },
      include: { members: true },
    });

    sendAnnouncement({
      title: "Team Unbanned",
      message: `Team "${team.name}" is now unbanned and can continue competing.`,
    });

    return res.json({
      ok: true,
      message: "Team unbanned successfully",
    });
  } catch (err) {
    console.error("Unban team error:", err);
    return res.status(err.status || 500).json({
      error: err.status === 403 ? "Admin only" : "Failed to unban team"
    });
  }
}

/* ========================================================================== */
/*                               APPLY PENALTY                                 */
/* ========================================================================== */

export async function reduceTeamScore(req, res) {
  try {
    assertAdmin(req);

    const id = Number(req.params.id);
    const penalty = Number(req.body.penalty);

    if (Number.isNaN(penalty)) {
      return res.status(400).json({ error: "Invalid penalty" });
    }

    const team = await prisma.team.findUnique({
      where: { id },
      include: {
        solved: { include: { challenge: true } }
      }
    });

    if (!team) return res.status(404).json({ error: "Team not found" });

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

    /* -------------------------------------------------------------------
     * NEW: WebSocket + Announcement creation
     * ------------------------------------------------------------------- */
    sendAnnouncement({
      title: "Penalty Applied",
      message: `A penalty of ${penalty} points was applied to team "${team.name}". Total penalty is now ${updatedPenalty} points.`,
    });

    return res.json({
      ok: true,
      message: `Penalty applied: ${penalty}. Total penalty: ${updatedPenalty}`,
      rawScore,
      finalScore,
    });
  } catch (err) {
    console.error("Penalty error:", err);
    return res.status(err.status || 500).json({
      error: err.status === 403 ? "Admin only" : "Failed to apply penalty"
    });
  }
}


/* ========================================================================== */
/*                               BULK RELEASE                                  */
/* ========================================================================== */

export async function bulkRelease(req, res) {
  try {
    assertAdmin(req);

    const ids = req.body?.ids;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: "Missing or invalid IDs" });
    }

    await prisma.challenge.updateMany({
      where: { id: { in: ids } },
      data: { released: true }
    });

    sendAnnouncement({
      title: "Bulk Release",
      message: `${ids.length} challenges have been released.`,
    });

    return res.json({ ok: true, released: ids.length });
  } catch (err) {
    console.error("Bulk release error:", err);
    return res.status(err.status || 500).json({
      error: "Failed to bulk release challenges",
    });
  }
}

/* ========================================================================== */
/*                               BULK HIDE                                     */
/* ========================================================================== */

export async function bulkHide(req, res) {
  try {
    assertAdmin(req);

    const ids = req.body?.ids;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: "Missing or invalid IDs" });
    }

    await prisma.challenge.updateMany({
      where: { id: { in: ids } },
      data: { released: false }
    });

    sendAnnouncement({
      title: "Bulk Hide",
      message: `${ids.length} challenges have been hidden.`,
    });

    return res.json({ ok: true, hidden: ids.length });
  } catch (err) {
    console.error("Bulk hide error:", err);
    return res.status(err.status || 500).json({
      error: "Failed to bulk hide challenges",
    });
  }
}

/* ========================================================================== */
/*                               BULK DELETE                                   */
/* ========================================================================== */

export async function bulkDelete(req, res) {
  try {
    assertAdmin(req);

    const ids = req.body?.ids;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: "Missing or invalid IDs" });
    }

    // get file paths first (cleanup)
    const files = await prisma.challenge.findMany({
      where: { id: { in: ids } },
      select: { filePath: true }
    });

    await prisma.challenge.deleteMany({
      where: { id: { in: ids } }
    });

    // remove files if exist
    for (const file of files) {
      if (file.filePath && fs.existsSync(file.filePath)) {
        try {
          await fs.promises.unlink(file.filePath);
        } catch (err) {
          console.error("File delete error:", err);
        }
      }
    }

    sendAnnouncement({
      title: "Bulk Delete",
      message: `${ids.length} challenges were deleted.`,
    });

    return res.json({ ok: true, deleted: ids.length });
  } catch (err) {
    console.error("Bulk delete error:", err);
    return res.status(err.status || 500).json({
      error: "Failed to bulk delete challenges",
    });
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
  reduceTeamScore,
  bulkRelease,
  bulkHide,
  bulkDelete
};
