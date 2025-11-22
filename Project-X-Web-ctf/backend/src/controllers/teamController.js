/**
 * Team Controller (ESM + Secured + Optimized)
 */

import prisma from "../config/db.js";
import crypto from "crypto";

/* -------------------------------------------------------------------------- */
/*                               AUTH HELPER                                   */
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
/*                        JOIN CODE GENERATOR                                  */
/* -------------------------------------------------------------------------- */

function generateJoinCode() {
  return crypto.randomBytes(3).toString("hex").toUpperCase();
}

/* -------------------------------------------------------------------------- */
/*                                 CREATE TEAM                                 */
/* -------------------------------------------------------------------------- */

export async function createTeam(req, res) {
  try {
    const userId = requireUser(req);
    const { name } = req.body;

    if (!name || typeof name !== "string" || !name.trim()) {
      return res.status(400).json({ error: "Team name is required" });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { teamId: true }
    });

    if (user?.teamId) {
      return res.status(400).json({ error: "User already belongs to a team" });
    }

    const joinCode = generateJoinCode();

    const team = await prisma.team.create({
      data: {
        name: name.trim(),
        joinCode,
        members: { connect: { id: userId } }
      },
      include: {
        members: {
          select: { id: true, username: true }
        }
      }
    });

    return res.json({ team });
  } catch (err) {
    console.error("createTeam error:", err);

    if (err.code === "P2002") {
      return res.status(400).json({ error: "Team name already exists" });
    }

    return res.status(500).json({ error: "Server error creating team" });
  }
}

/* -------------------------------------------------------------------------- */
/*                                  JOIN TEAM                                  */
/* -------------------------------------------------------------------------- */

export async function joinTeam(req, res) {
  try {
    const userId = requireUser(req);
    const { joinCode } = req.body;

    if (!joinCode || typeof joinCode !== "string") {
      return res.status(400).json({ error: "Join code required" });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { teamId: true }
    });

    if (user?.teamId) {
      return res.status(400).json({ error: "User already belongs to a team" });
    }

    const team = await prisma.team.findUnique({
      where: { joinCode: joinCode.trim().toUpperCase() },
      include: {
        members: { select: { id: true, username: true } }
      }
    });

    if (!team) return res.status(404).json({ error: "Invalid join code" });

    await prisma.user.update({
      where: { id: userId },
      data: { teamId: team.id }
    });

    const updatedTeam = await prisma.team.findUnique({
      where: { id: team.id },
      include: {
        members: { select: { id: true, username: true } }
      }
    });

    return res.json({ team: updatedTeam });
  } catch (err) {
    console.error("joinTeam error:", err);
    return res.status(500).json({ error: "Server error joining team" });
  }
}

/* -------------------------------------------------------------------------- */
/*                                  GET MY TEAM                                */
/* -------------------------------------------------------------------------- */

export async function getMyTeam(req, res) {
  try {
    const userId = requireUser(req);

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { teamId: true }
    });

    if (!user?.teamId) {
      return res.status(404).json({ error: "User does not belong to a team" });
    }

    const team = await prisma.team.findUnique({
      where: { id: user.teamId },
      include: {
        members: {
          include: {
            solved: {
              include: { challenge: true },
              orderBy: { solvedAt: "asc" }
            }
          }
        },
        solved: {
          include: { challenge: true }
        }
      }
    });

    if (!team) return res.status(404).json({ error: "Team not found" });

    const teamPoints = (team.solved || []).reduce(
      (sum, s) => sum + (s.challenge?.points ?? 0),
      0
    );

    const members = team.members.map((m) => {
      const solves = m.solved.map((s) => ({
        challengeId: s.challengeId,
        challengeName: s.challenge.name,
        points: s.challenge.points,
        solvedAt: s.solvedAt,
        category: s.challenge.category,
        difficulty: s.challenge.difficulty
      }));

      return {
        id: m.id,
        username: m.username,
        points: solves.reduce((sum, s) => sum + s.points, 0),
        solveCount: solves.length,
        solves
      };
    });

    return res.json({
      team: {
        id: team.id,
        name: team.name,
        joinCode: team.joinCode,
        totalPoints: teamPoints,
        members
      }
    });
  } catch (err) {
    console.error("getMyTeam error:", err);
    return res.status(500).json({ error: "Server error fetching team" });
  }
}

/* -------------------------------------------------------------------------- */
/*                                   TEAM SOLVES                               */
/* -------------------------------------------------------------------------- */

export async function getTeamSolves(req, res) {
  try {
    const teamId = Number(req.params.id);
    if (isNaN(teamId)) return res.status(400).json({ error: "Invalid team ID" });

    const team = await prisma.team.findUnique({
      where: { id: teamId },
      include: {
        members: {
          include: {
            solved: {
              include: { challenge: true },
              orderBy: { solvedAt: "asc" }
            }
          }
        }
      }
    });

    if (!team) return res.status(404).json({ error: "Team not found" });

    const solves = team.members.flatMap((member) =>
      member.solved.map((s) => ({
        username: member.username,
        challengeId: s.challengeId,
        createdAt: s.createdAt,
        challenge: s.challenge
      }))
    );

    return res.json({ teamId, solved: solves });
  } catch (err) {
    console.error("getTeamSolves error:", err);
    return res.status(500).json({ error: "Server error fetching team solves" });
  }
}

export default {
  createTeam,
  joinTeam,
  getMyTeam,
  getTeamSolves
};
