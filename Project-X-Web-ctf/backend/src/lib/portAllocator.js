/**
 * Port Allocation Utility
 * ------------------------
 * Returns a pseudo-random port in a high, non-privileged range. This prevents
 * collisions with system services and allows multiple user containers to run
 * concurrently without manual port assignment.
 *
 * NOTE:
 * - Range: 20000–50000
 * - For production-grade systems, consider adding collision checks or using
 *   an allocator service with a persistent pool.
 */

function getRandomPort() {
  return Math.floor(20000 + Math.random() * 30000);
}

module.exports = { getRandomPort };
