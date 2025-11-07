require('dotenv').config();
module.exports = {
  MONGO_URI: process.env.MONGO_URI || 'mongodb://localhost:27017/Project-X-Web_ctf',
  PORT: process.env.PORT || 8100,
  TTL_SECONDS: parseInt(process.env.CTF_INSTANCE_TTL_SECONDS || '3600', 10),
  NETWORK_MODE: process.env.CTF_NETWORK_MODE || 'bridge',
  CPU_SHARES: parseInt(process.env.CONTAINER_CPU_SHARES || '512', 10),
  MEM_LIMIT: process.env.CONTAINER_MEM_LIMIT || '256m'
};
