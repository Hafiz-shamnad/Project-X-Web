/**
 * Score Calculation Utility (ESM)
 * --------------------------------
 * Supports modern Prisma Solved entries and legacy ID lists.
 *
 * Modern format:
 *   user.solved = [
 *     { challengeId: 3, challenge: { points: 100 } },
 *     { challengeId: 5, challenge: { points: 50 } }
 *   ]
 *
 * Legacy format:
 *   user.solved = [ 3, 5 ]
 */

export function calcScore(user, challenges = []) {
  if (!user || !Array.isArray(user.solved)) return 0;

  // Build challenge map from provided challenge list
  const challengeMap = new Map(
    challenges.map((ch) => [ch.id, ch.points || 0])
  );

  let total = 0;

  for (const s of user.solved) {
    // Prisma-style solve entry
    if (typeof s === "object" && s.challenge) {
      total += s.challenge.points || 0;
    }
    // Legacy ID-only solve entry
    else if (typeof s === "number") {
      total += challengeMap.get(s) || 0;
    }
  }

  return total;
}
