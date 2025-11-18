/**
 * Port Allocation Utility (ESM)
 */

export function getRandomPort() {
  return Math.floor(20000 + Math.random() * 30000);
}

export default { getRandomPort };
