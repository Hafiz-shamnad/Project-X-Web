/**
 * Leaderboard Controller
 * ----------------------
 * Handles:
 *  - Global user leaderboard
 *  - Global team leaderboard
 *  - Team-specific member leaderboard
 */

const { prisma } = require("../config/db");

/* -------------------------------------------------------------------------- */
/*                         GLOBAL USER LEADERBOARD                            */
/* -------------------------------------------------------------------------- */

/**
 * Retrieve the global user leaderboard.
 * Ranking is based on total points from solved challenges.
 * @route GET /api/leaderboard/users
 */
exports.getLeaderboard = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      include: {
        solved: { include: { challenge: true } },
      },
    });

    const leaderboard = users
      .map((user) => {
        const totalScore = user.solved.reduce(
          (sum, entry) => sum + (entry.challenge.points || 0),
          0
        );

        return {
          id: user.id,
          username: user.username,
          score: totalScore,
          solved: user.solved.length,
          solves: user.solved.map((entry) => ({
            challenge: { id: entry.challenge.id, points: entry.challenge.points },
            createdAt: entry.createdAt,
          })),
        };
      })
      .sort((a, b) => b.score - a.score)
      .map((user, index) => ({ rank: index + 1, ...user }));

    return res.json(leaderboard);
  } catch (err) {
    console.error("User leaderboard error:", err);
    return res.status(500).json({ error: "Failed to fetch leaderboard" });
  }
};


/* -------------------------------------------------------------------------- */
/*                           GLOBAL TEAM LEADERBOARD                          */
/* -------------------------------------------------------------------------- */

/**
 * Retrieve the global team leaderboard.
 * A challenge solved by any member contributes once to team score.
 * Temporary and expired bans are ignored for listing purposes.
 * @route GET /api/leaderboard/teams
 */
exports.getTeamLeaderboard = async (req, res) => {
  try {
    const teams = await prisma.team.findMany({
      include: {
        members: {
          include: {
            solved: { include: { challenge: true } },
          },
        },
      },
    });

    const leaderboard = teams
      .filter((team) => !team.bannedUntil || new Date(team.bannedUntil) < new Date())
      .map((team) => {
        const allSolves = team.members.flatMap((member) => member.solved);

        // Deduplicate challenge solves for the team
        const uniqueChallenges = new Map();
        for (const solve of allSolves) {
          const cid = solve.challenge.id;
          if (!uniqueChallenges.has(cid)) {
            uniqueChallenges.set(cid, solve);
          }
        }

        const uniqueSolves = Array.from(uniqueChallenges.values());

        const rawScore = uniqueSolves.reduce(
          (sum, entry) => sum + (entry.challenge.points || 0),
          0
        );

        const penalty = team.penaltyPoints || 0;
        const finalScore = Math.max(0, rawScore - penalty);

        return {
          id: team.id,
          teamName: team.name,
          rawScore,
          score: finalScore,
          solved: uniqueSolves.length,
          penaltyPoints: penalty,
          bannedUntil: team.bannedUntil,
          solves: uniqueSolves.map((entry) => ({
            challenge: { id: entry.challenge.id, points: entry.challenge.points },
            createdAt: entry.createdAt,
          })),
        };
      })
      .sort((a, b) => b.score - a.score)
      .map((team, index) => ({ rank: index + 1, ...team }));

    return res.json(leaderboard);
  } catch (err) {
    console.error("Team leaderboard error:", err);
    return res.status(500).json({ error: "Failed to fetch team leaderboard" });
  }
};


/* -------------------------------------------------------------------------- */
/*                       TEAM MEMBER INTERNAL LEADERBOARD                     */
/* -------------------------------------------------------------------------- */

/**
 * Retrieve leaderboard of members within a specific team.
 * @route GET /api/leaderboard/team/:id/members
 */
exports.getTeamMembersLeaderboard = async (req, res) => {
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
            solved: { include: { challenge: true } },
          },
        },
      },
    });

    if (!team) {
      return res.status(404).json({ error: "Team not found" });
    }

    const leaderboard = team.members
      .map((member) => {
        const totalScore = member.solved.reduce(
          (sum, entry) => sum + (entry.challenge.points || 0),
          0
        );

        return {
          id: member.id,
          username: member.username,
          score: totalScore,
          solved: member.solved.length,
          solves: member.solved.map((entry) => ({
            challenge: { id: entry.challenge.id, points: entry.challenge.points },
            createdAt: entry.createdAt,
          })),
        };
      })
      .sort((a, b) => b.score - a.score)
      .map((member, index) => ({ rank: index + 1, ...member }));

    return res.json({
      teamId: team.id,
      teamName: team.name,
      leaderboard,
    });
  } catch (err) {
    console.error("Team member leaderboard error:", err);
    return res.status(500).json({ error: "Failed to fetch team member leaderboard" });
  }
};
