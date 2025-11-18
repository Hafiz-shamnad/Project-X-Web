/**
 * Team Controller (ESM + Optimized)
 */

import prisma from "../config/db.js";
import crypto from "crypto";

/* -------------------------------------------------------------------------- */
/*                             Join Code Generator                             */
/* -------------------------------------------------------------------------- */

function generateJoinCode() {
  return crypto.randomBytes(3).toString("hex").toUpperCase(); // A3F9D2
}

/* -------------------------------------------------------------------------- */
/*                                  Create Team                                */
/* -------------------------------------------------------------------------- */

export async function createTeam(req, res) {
  try {
    const userId = req.user?.id;
    const { name } = req.body;

    if (!userId) return res.status(401).json({ error: "Unauthorized" });
    if (!name || typeof name !== "string")
      return res.status(400).json({ error: "Team name is required" });

    // Check if user already has a team
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { teamId: true },
    });

    if (user?.teamId)
      return res
        .status(400)
        .json({ error: "User already belongs to a team" });

    const joinCode = generateJoinCode();

    const team = await prisma.team.create({
      data: {
        name,
        joinCode,
        members: { connect: { id: userId } },
      },
      include: { members: true },
    });

    return res.json({ team });
  } catch (err) {
    console.error("createTeam error:", err);
    return res.status(500).json({ error: "Server error creating team" });
  }
}

/* -------------------------------------------------------------------------- */
/*                                   Join Team                                 */
/* -------------------------------------------------------------------------- */

export async function joinTeam(req, res) {
  try {
    const userId = req.user?.id;
    const { joinCode } = req.body;

    if (!userId) return res.status(401).json({ error: "Unauthorized" });
    if (!joinCode) return res.status(400).json({ error: "Join code required" });

    const team = await prisma.team.findUnique({
      where: { joinCode },
      include: { members: true },
    });

    if (!team) return res.status(404).json({ error: "Invalid join code" });

    await prisma.user.update({
      where: { id: userId },
      data: { teamId: team.id },
    });

    const updatedTeam = await prisma.team.findUnique({
      where: { id: team.id },
      include: { members: true },
    });

    return res.json({ team: updatedTeam });
  } catch (err) {
    console.error("joinTeam error:", err);
    return res.status(500).json({ error: "Server error joining team" });
  }
}

/* -------------------------------------------------------------------------- */
/*                                 Get My Team                                 */
/* -------------------------------------------------------------------------- */

export async function getMyTeam(req, res) {
  try {
    const userId = req.user?.id;

    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { teamId: true },
    });

    if (!user?.teamId)
      return res.status(404).json({ error: "User does not belong to a team" });

    const team = await prisma.team.findUnique({
      where: { id: user.teamId },
      include: {
        members: {
          include: {
            solved: {
              include: {
                challenge: {
                  select: {
                    id: true,
                    name: true,
                    points: true,
                    category: true,
                    difficulty: true,
                  },
                },
              },
              orderBy: { createdAt: "asc" },
            },
          },
        },
        solved: true,
      },
    });

    if (!team) return res.status(404).json({ error: "Team not found" });

    const totalPoints = team.solved.reduce((a, b) => a + b.points, 0);

    const members = team.members.map((m) => {
      const solves = m.solved.map((s) => ({
        challengeId: s.challenge.id,
        challengeName: s.challenge.name,
        points: s.points,
        solvedAt: s.solvedAt,
        category: s.challenge.category,
        difficulty: s.challenge.difficulty,
      }));

      return {
        id: m.id,
        username: m.username,
        points: solves.reduce((a, b) => a + b.points, 0),
        solveCount: solves.length,
        solves,
      };
    });

    return res.json({
      team: {
        id: team.id,
        name: team.name,
        joinCode: team.joinCode,
        totalPoints,
        members,
      },
    });
  } catch (err) {
    console.error("getMyTeam error:", err);
    return res.status(500).json({ error: "Server error fetching team" });
  }
}

/* -------------------------------------------------------------------------- */
/*                                 Team Solves                                 */
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
              orderBy: { createdAt: "asc" },
            },
          },
        },
      },
    });

    if (!team) return res.status(404).json({ error: "Team not found" });

    const solves = team.members.flatMap((member) =>
      member.solved.map((s) => ({
        username: member.username,
        challengeId: s.challengeId,
        createdAt: s.createdAt,
        challenge: s.challenge,
      }))
    );

    return res.json({ teamId, solved: solves });
  } catch (err) {
    console.error("getTeamSolves error:", err);
    return res
      .status(500)
      .json({ error: "Server error fetching team solves" });
  }
}

export default {
  createTeam,
  joinTeam,
  getMyTeam,
  getTeamSolves,
};
