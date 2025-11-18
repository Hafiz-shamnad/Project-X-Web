/**
 * Score Calculation Utility (ESM)
 * -------------------------------
 * Computes a user's total score based on solved challenge IDs.
 */

/**
 * Calculate a user's score by summing the points of solved challenges.
 * @param {Object} user - User object containing solved challenge IDs
 * @param {Array} challenges - Array of challenge objects
 * @returns {number} Total score
 */
export function calcScore(user, challenges) {
  if (!user || !Array.isArray(user.solved)) return 0;
  if (!Array.isArray(challenges)) return 0;

  // Build a map for O(1) lookup
  const challengeMap = new Map(
    challenges.map((ch) => [ch.id, ch.points || 0])
  );

  return user.solved.reduce(
    (sum, challengeId) => sum + (challengeMap.get(challengeId) || 0),
    0
  );
}
