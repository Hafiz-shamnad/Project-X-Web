/**
 * Flag Hashing Utility (ESM)
 * --------------------------
 * Creates a SHA-256 hash of a flag combined with an optional salt.
 */

import crypto from "crypto";

const FLAG_SALT = process.env.FLAG_SALT || "";

/**
 * Normalize flag input:
 *  - Trim whitespace
 *  - Remove invisible zero-width characters
 */
function normalizeFlag(str) {
  return str
    .trim()
    .replace(/[\u200B-\u200D\uFEFF]/g, ""); // remove zero-width chars
}

/**
 * Hash a flag using SHA-256 with optional salt.
 * @param {string} flag
 * @returns {string} hex hash
 */
export function hashFlag(flag) {
  if (typeof flag !== "string") {
    throw new Error("Invalid flag: expected a string");
  }

  const clean = normalizeFlag(flag);

  return crypto
    .createHash("sha256")
    .update(FLAG_SALT + clean)
    .digest("hex");
}

export default hashFlag;
