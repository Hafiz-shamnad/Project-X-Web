/**
 * Leaderboard Controller (ESM + Optimized)
 */

import prisma from "../config/db.js";

/* -------------------------------------------------------------------------- */
/*                         GLOBAL USER LEADERBOARD                            */
/* -------------------------------------------------------------------------- */

export async function getLeaderboard(req, res) {
  try {
    const users = await prisma.user.findMany({
      include: {
        solved: {
          include: {
            challenge: {
              select: { id: true, points: true }
            }
          }
        }
      }
    });

    const leaderboard = users
      .map((u) => {
        const score = u.solved.reduce(
          (sum, s) => sum + (s.challenge?.points || 0),
          0
        );

        return {
          id: u.id,
          username: u.username,
          score,
          solved: u.solved.length,
          solves: u.solved.map((s) => ({
            challengeId: s.challenge.id,
            points: s.challenge.points,
            createdAt: s.createdAt
          }))
        };
      })
      .sort((a, b) => b.score - a.score)
      .map((u, i) => ({ rank: i + 1, ...u }));

    return res.json(leaderboard);
  } catch (err) {
    console.error("Leaderboard error:", err);
    return res.status(500).json({ error: "Failed to fetch leaderboard" });
  }
}

/* -------------------------------------------------------------------------- */
/*                           GLOBAL TEAM LEADERBOARD                          */
/* -------------------------------------------------------------------------- */

export async function getTeamLeaderboard(req, res) {
  try {
    const teams = await prisma.team.findMany({
      include: {
        members: {
          include: {
            solved: {
              include: {
                challenge: { select: { id: true, points: true } }
              }
            }
          }
        }
      }
    });

    const leaderboard = teams
      .filter((t) => !t.bannedUntil || t.bannedUntil < new Date())
      .map((team) => {
        const solves = team.members.flatMap((m) => m.solved);

        // unique solves by challengeId
        const uniqueMap = new Map();
        for (const s of solves) {
          if (!uniqueMap.has(s.challenge.id)) {
            uniqueMap.set(s.challenge.id, s);
          }
        }

        const unique = [...uniqueMap.values()];

        const rawScore = unique.reduce(
          (sum, s) => sum + (s.challenge?.points || 0),
          0
        );

        const penalty = team.penaltyPoints || 0;
        const finalScore = Math.max(0, rawScore - penalty);

        return {
          id: team.id,
          teamName: team.name,
          rawScore,
          score: finalScore,
          solved: unique.length,
          penaltyPoints: penalty,
          bannedUntil: team.bannedUntil,
          solves: unique.map((s) => ({
            challengeId: s.challenge.id,
            points: s.challenge.points,
            createdAt: s.createdAt
          }))
        };
      })
      .sort((a, b) => b.score - a.score)
      .map((team, i) => ({ rank: i + 1, ...team }));

    return res.json(leaderboard);
  } catch (err) {
    console.error("Team leaderboard error:", err);
    return res.status(500).json({ error: "Failed to fetch team leaderboard" });
  }
}

/* -------------------------------------------------------------------------- */
/*                       TEAM MEMBER INTERNAL LEADERBOARD                     */
/* -------------------------------------------------------------------------- */

export async function getTeamMembersLeaderboard(req, res) {
  try {
    const teamId = Number(req.params.id);
    if (isNaN(teamId)) return res.status(400).json({ error: "Invalid team ID" });

    const team = await prisma.team.findUnique({
      where: { id: teamId },
      include: {
        members: {
          include: {
            solved: {
              include: { challenge: { select: { id: true, points: true } } }
            }
          }
        }
      }
    });

    if (!team) return res.status(404).json({ error: "Team not found" });

    const leaderboard = team.members
      .map((m) => {
        const score = m.solved.reduce(
          (sum, s) => sum + (s.challenge?.points || 0),
          0
        );

        return {
          id: m.id,
          username: m.username,
          score,
          solved: m.solved.length,
          solves: m.solved.map((s) => ({
            challengeId: s.challenge.id,
            points: s.challenge.points,
            createdAt: s.createdAt
          }))
        };
      })
      .sort((a, b) => b.score - a.score)
      .map((m, i) => ({ rank: i + 1, ...m }));

    return res.json({
      teamId: team.id,
      teamName: team.name,
      leaderboard
    });
  } catch (err) {
    console.error("Team member leaderboard error:", err);
    return res.status(500).json({ error: "Failed to fetch team member leaderboard" });
  }
}

export default {
  getLeaderboard,
  getTeamLeaderboard,
  getTeamMembersLeaderboard
};
