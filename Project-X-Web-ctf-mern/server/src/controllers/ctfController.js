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
