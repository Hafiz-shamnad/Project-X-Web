#!/bin/bash
set -e

echo "🚀 Setting up Project-X-Web CTF MERN project..."

# Create directories
mkdir -p Project-X-Web-ctf-mern/{server/src/{routes,controllers,models,services},web/src/components}

cd Project-X-Web-ctf-mern

############################################
# 1️⃣ Backend - Node.js / Express
############################################
cat <<'EOF' > server/package.json
{
  "name": "Project-X-Web-ctf-server",
  "version": "1.0.0",
  "main": "src/index.js",
  "scripts": {
    "start": "node src/index.js"
  },
  "dependencies": {
    "body-parser": "^1.20.2",
    "cors": "^2.8.5",
    "dockerode": "^3.3.0",
    "dotenv": "^16.0.3",
    "express": "^4.18.2",
    "mongoose": "^7.5.0",
    "morgan": "^1.10.0"
  }
}
EOF

cat <<'EOF' > server/.env.example
MONGO_URI=mongodb://mongo:27017/Project-X-Web_ctf
PORT=8100
CTF_INSTANCE_TTL_SECONDS=3600
CTF_NETWORK_MODE=bridge
CONTAINER_CPU_SHARES=512
CONTAINER_MEM_LIMIT=256m
EOF

cat <<'EOF' > server/Dockerfile
FROM node:18-slim
WORKDIR /app
COPY package.json ./
RUN npm install --production
COPY src ./src
RUN useradd -m ctfuser && chown -R ctfuser:ctfuser /app
USER ctfuser
EXPOSE 8100
CMD ["node", "src/index.js"]
EOF

cat <<'EOF' > server/src/config.js
require('dotenv').config();
module.exports = {
  MONGO_URI: process.env.MONGO_URI || 'mongodb://localhost:27017/Project-X-Web_ctf',
  PORT: process.env.PORT || 8100,
  TTL_SECONDS: parseInt(process.env.CTF_INSTANCE_TTL_SECONDS || '3600', 10),
  NETWORK_MODE: process.env.CTF_NETWORK_MODE || 'bridge',
  CPU_SHARES: parseInt(process.env.CONTAINER_CPU_SHARES || '512', 10),
  MEM_LIMIT: process.env.CONTAINER_MEM_LIMIT || '256m'
};
EOF

cat <<'EOF' > server/src/index.js
const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');
const cors = require('cors');
const bodyParser = require('body-parser');
const { MONGO_URI, PORT } = require('./config');
const ctfRoutes = require('./routes/ctf');

(async () => {
  await mongoose.connect(MONGO_URI);
  console.log('✅ Mongo connected');
  const app = express();
  app.use(cors());
  app.use(morgan('dev'));
  app.use(bodyParser.json());
  app.use('/api/ctf', ctfRoutes);
  app.get('/', (req,res)=>res.json({ok:true}));
  app.listen(PORT, ()=>console.log(`🚀 Server running on port ${PORT}`));
})();
EOF

# Models
for model in Challenge Flag Team Instance FlagSubmission Score; do
cat <<'EOF' > server/src/models/${model}.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
EOF
done

# Add each model’s schema
cat <<'EOF' > server/src/models/Challenge.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ChallengeSchema = new Schema({
  title: String,
  slug: { type: String, unique: true },
  description: String,
  docker_image: String,
  public_port: Number,
  created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Challenge', ChallengeSchema);
EOF

cat <<'EOF' > server/src/models/Flag.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const FlagSchema = new Schema({
  challenge_id: { type: Schema.Types.ObjectId, ref: 'Challenge' },
  flag: String,
  is_active: { type: Boolean, default: true }
});

module.exports = mongoose.model('Flag', FlagSchema);
EOF

cat <<'EOF' > server/src/models/Team.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TeamSchema = new Schema({
  name: { type: String, unique: true },
  created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Team', TeamSchema);
EOF

cat <<'EOF' > server/src/models/Instance.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const InstanceSchema = new Schema({
  challenge_id: { type: Schema.Types.ObjectId, ref: 'Challenge' },
  team_id: { type: Schema.Types.ObjectId, ref: 'Team' },
  container_id: String,
  host_port: Number,
  expires_at: Date,
  is_active: { type: Boolean, default: true }
});

module.exports = mongoose.model('Instance', InstanceSchema);
EOF

cat <<'EOF' > server/src/models/FlagSubmission.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const FlagSubmissionSchema = new Schema({
  instance_id: { type: Schema.Types.ObjectId, ref: 'Instance' },
  team_id: { type: Schema.Types.ObjectId, ref: 'Team' },
  flag_submitted: String,
  is_correct: Boolean,
  submitted_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('FlagSubmission', FlagSubmissionSchema);
EOF

cat <<'EOF' > server/src/models/Score.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ScoreSchema = new Schema({
  team_id: { type: Schema.Types.ObjectId, ref: 'Team' },
  challenge_id: { type: Schema.Types.ObjectId, ref: 'Challenge' },
  points: { type: Number, default: 0 },
  updated_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Score', ScoreSchema);
EOF

# Docker client service
cat <<'EOF' > server/src/services/dockerClient.js
const Docker = require('dockerode');
const docker = new Docker({ socketPath: '/var/run/docker.sock' });
module.exports = docker;
EOF

# Controller
cat <<'EOF' > server/src/controllers/ctfController.js
const docker = require('../services/dockerClient');
const Challenge = require('../models/Challenge');
const Flag = require('../models/Flag');
const Team = require('../models/Team');
const Instance = require('../models/Instance');
const FlagSubmission = require('../models/FlagSubmission');
const Score = require('../models/Score');
const { TTL_SECONDS } = require('../config');

exports.createChallenge = async (req, res) => {
  const c = await Challenge.create(req.body);
  res.json(c);
};

exports.spawnInstance = async (req, res) => {
  const { challenge_id, team_id } = req.body;
  const challenge = await Challenge.findById(challenge_id);
  if(!challenge) return res.status(404).json({error:'Challenge not found'});
  const host_port = Math.floor(Math.random()*20000)+20000;
  const container = await docker.createContainer({
    Image: challenge.docker_image,
    Tty: false,
    HostConfig: {
      AutoRemove: true,
      NetworkMode: 'bridge',
      PortBindings: challenge.public_port ? { [`${challenge.public_port}/tcp`]: [{ HostPort: host_port.toString() }] } : {}
    },
    ExposedPorts: challenge.public_port ? { [`${challenge.public_port}/tcp`]: {} } : {}
  });
  await container.start();
  const expires = new Date(Date.now() + TTL_SECONDS*1000);
  const inst = await Instance.create({ challenge_id, team_id, container_id: container.id, host_port, expires_at: expires });
  res.json(inst);
};

exports.verifyFlag = async (req, res) => {
  const { instance_id, team_id, flag } = req.body;
  const inst = await Instance.findById(instance_id);
  if(!inst) return res.status(404).json({error:'Instance not found'});
  const flags = await Flag.find({ challenge_id: inst.challenge_id, is_active:true });
  const correct = flags.some(f => f.flag.trim() === flag.trim());
  await FlagSubmission.create({ instance_id, team_id, flag_submitted: flag, is_correct: correct });
  if(correct){
    const score = await Score.findOneAndUpdate({ team_id, challenge_id: inst.challenge_id }, { $inc: { points: 1 } }, { upsert:true, new:true });
  }
  res.json({ correct, message: correct ? 'Correct flag!' : 'Wrong flag' });
};
EOF

# Routes
cat <<'EOF' > server/src/routes/ctf.js
const express = require('express');
const router = express.Router();
const ctf = require('../controllers/ctfController');

router.post('/challenges', ctf.createChallenge);
router.post('/spawn', ctf.spawnInstance);
router.post('/verify', ctf.verifyFlag);

module.exports = router;
EOF

############################################
# 2️⃣ Frontend - React
############################################
cat <<'EOF' > web/package.json
{
  "name": "Project-X-Web-ctf-web",
  "version": "1.0.0",
  "private": true,
  "dependencies": {
    "axios": "^1.6.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "scripts": {
    "start": "npx serve -s build"
  }
}
EOF

cat <<'EOF' > web/Dockerfile
FROM node:18-slim
WORKDIR /app
COPY package.json ./
RUN npm install --production
COPY src ./src
EXPOSE 3000
CMD ["npx","serve","src"]
EOF

cat <<'EOF' > web/src/index.js
import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
createRoot(document.getElementById("root")).render(<App />);
EOF

cat <<'EOF' > web/src/App.js
import React, { useState } from "react";
import axios from "axios";
function App(){
  const [slug,setSlug]=useState('');
  const [docker,setDocker]=useState('');
  const [flag,setFlag]=useState('');
  const api="http://localhost:8100/api/ctf";
  async function createChallenge(e){e.preventDefault();
    await axios.post(api+"/challenges",{title:slug,slug,docker_image:docker});
    alert('Challenge created');
  }
  async function verifyFlag(e){e.preventDefault();
    const r=await axios.post(api+'/verify',{instance_id:1,team_id:1,flag});
    alert(r.data.message);
  }
  return (<div style={{padding:'2em',fontFamily:'sans-serif'}}>
    <h1>Project-X-Web CTFZone</h1>
    <form onSubmit={createChallenge}>
      <input placeholder='slug' value={slug} onChange={e=>setSlug(e.target.value)}/>
      <input placeholder='docker image' value={docker} onChange={e=>setDocker(e.target.value)}/>
      <button type='submit'>Create</button>
    </form>
    <form onSubmit={verifyFlag}>
      <input placeholder='flag' value={flag} onChange={e=>setFlag(e.target.value)}/>
      <button type='submit'>Verify Flag</button>
    </form>
  </div>);
}
export default App;
EOF

############################################
# 3️⃣ Docker Compose
############################################
cat <<'EOF' > docker-compose.yml
version: '3.8'
services:
  mongo:
    image: mongo:6
    ports:
      - "27017:27017"
    volumes:
      - mongodata:/data/db

  server:
    build: ./server
    env_file:
      - ./server/.env.example
    ports:
      - "8100:8100"
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
    depends_on:
      - mongo

  web:
    build: ./web
    ports:
      - "3000:3000"
    depends_on:
      - server

volumes:
  mongodata:
EOF

echo "✅ Project-X-Web CTF MERN stack created successfully!"
echo "👉 Next steps:"
echo "1. cd Project-X-Web-ctf-mern"
echo "2. docker-compose build"
echo "3. docker-compose up -d"
echo "4. Visit http://localhost:3000"
