/**
 * Docker Client Initialization
 * ----------------------------
 * Provides a preconfigured Dockerode instance for communicating with the local
 * Docker engine via the Unix socket. This is used across the system to create,
 * start, stop, and inspect containers.
 */

const Docker = require("dockerode");

const docker = new Docker({
  socketPath: "/var/run/docker.sock",
});

module.exports = docker;
