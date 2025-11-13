/**
 * Score Calculation Utility
 * -------------------------
 * Computes a user's total score based on solved challenge IDs.
 * Expects:
 *  - user.solved: Array of challenge IDs
 *  - challenges: Array of { id, points }
 */

/**
 * Calculate a user's score by summing the points of solved challenges.
 * @param {Object} user - User object containing solved challenge IDs
 * @param {Array} challenges - Array of challenge objects
 * @returns {number} Total score
 */
function calcScore(user, challenges) {
  if (!user || !Array.isArray(user.solved)) {
    return 0;
  }

  if (!Array.isArray(challenges)) {
    return 0;
  }

  // Build a map for faster O(1) lookups
  const challengeMap = new Map(
    challenges.map((ch) => [ch.id, ch.points || 0])
  );

  return user.solved.reduce((sum, challengeId) => {
    return sum + (challengeMap.get(challengeId) || 0);
  }, 0);
}

module.exports = { calcScore };
