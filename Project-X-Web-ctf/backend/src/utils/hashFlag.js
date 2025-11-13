/**
 * Flag Hashing Utility
 * --------------------
 * Creates a SHA-256 hash of a flag combined with an optional salt.
 */

const crypto = require("crypto");

const FLAG_SALT = process.env.FLAG_SALT || "";

/**
 * Hash a flag using SHA-256 with optional salt.
 * @param {string} flag
 * @returns {string} hex hash
 */
function hashFlag(flag) {
  if (typeof flag !== "string") {
    throw new Error("Invalid flag: expected a string");
  }

  return crypto
    .createHash("sha256")
    .update(FLAG_SALT + flag.trim())
    .digest("hex");
}

module.exports = hashFlag;
