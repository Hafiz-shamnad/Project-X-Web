/**
 * Leaderboard Controller (ESM + Schema-Accurate + Optimized)
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
            challenge: { select: { id: true, points: true } }
          }
        }
      }
    });

    const leaderboard = users
      .map((u) => {
        const score = u.solved.reduce(
          (sum, s) => sum + (s.challenge?.points ?? 0),
          0
        );

        return {
          id: u.id,
          username: u.username,
          score,
          solved: u.solved.length,
          solves: u.solved.map((s) => ({
            challengeId: s.challengeId,
            points: s.challenge.points,
            createdAt: s.createdAt
          }))
        };
      })
      .sort((a, b) => b.score - a.score)
      .map((entry, index) => ({
        rank: index + 1,
        ...entry
      }));

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
              include: { challenge: { select: { id: true, points: true } } }
            }
          }
        },
        solved: {
          include: { challenge: true }
        }
      }
    });

    const now = new Date();

    const leaderboard = teams
      // Only show teams not under active ban
      .filter((t) => !t.bannedUntil || new Date(t.bannedUntil) <= now)
      .map((team) => {
        // Member solves
        const memberSolves = team.members.flatMap((m) => m.solved);

        // Team solves (rarely used, but schema supports it)
        const teamSolves = team.solved ?? [];

        // Combine and dedupe
        const allSolves = [...memberSolves, ...teamSolves];

        const unique = Array.from(
          allSolves.reduce((map, s) => {
            if (!map.has(s.challengeId)) map.set(s.challengeId, s);
            return map;
          }, new Map()).values()
        );

        const rawScore = unique.reduce(
          (sum, s) => sum + (s.challenge?.points ?? 0),
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
            challengeId: s.challengeId,
            points: s.challenge.points,
            createdAt: s.createdAt
          })),
        };
      })
      .sort((a, b) => b.score - a.score)
      .map((entry, index) => ({
        rank: index + 1,
        ...entry
      }));

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
    if (isNaN(teamId)) {
      return res.status(400).json({ error: "Invalid team ID" });
    }

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
          (sum, s) => sum + (s.challenge?.points ?? 0),
          0
        );

        return {
          id: m.id,
          username: m.username,
          score,
          solved: m.solved.length,
          solves: m.solved.map((s) => ({
            challengeId: s.challengeId,
            points: s.challenge.points,
            createdAt: s.createdAt
          })),
        };
      })
      .sort((a, b) => b.score - a.score)
      .map((entry, index) => ({
        rank: index + 1,
        ...entry
      }));

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
  getTeamMembersLeaderboard,
};
