// src/controllers/adminController.js
const crypto = require('crypto');
const { prisma } = require('../config/db');
const path = require('path');
const fs = require('fs');

const FLAG_SALT = process.env.FLAG_SALT || '';

function hashFlag(flag) {
  return crypto.createHash('sha256').update(FLAG_SALT + flag.trim()).digest('hex');
}

// create challenge (with optional file and flag text)
exports.createChallenge = async (req, res) => {
  try {
    const { name, category, difficulty, points, description, flag } = req.body;
    let filePath = null;
    if (req.file) {
      // multer saved file
      filePath = req.file.path;
    }

    const data = {
      name, category, difficulty, points: Number(points), description,
      filePath,
      flagHash: flag ? hashFlag(flag) : null
    };

    const ch = await prisma.challenge.create({ data });
    res.json({ ok: true, challenge: ch });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server_error' });
  }
};

exports.updateChallenge = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, category, difficulty, points, description, flag } = req.body;
    const update = { name, category, difficulty, points: Number(points), description };
    if (flag) update.flagHash = hashFlag(flag);
    if (req.file) update.filePath = req.file.path;

    const ch = await prisma.challenge.update({ where: { id: Number(id) }, data: update });
    res.json({ ok: true, challenge: ch });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server_error' });
  }
};

exports.deleteChallenge = async (req, res) => {
  try {
    const { id } = req.params;
    // Optionally delete uploaded file
    const ch = await prisma.challenge.findUnique({ where: { id: Number(id) } });
    if (ch?.filePath && fs.existsSync(ch.filePath)) fs.unlinkSync(ch.filePath);

    await prisma.challenge.delete({ where: { id: Number(id) } });
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'server_error' });
  }
};

exports.getAllChallenges = async (req, res) => {
  try {
    const challenges = await prisma.challenge.findMany({
      select: {
        id: true,
        name: true,
        description: true,
        category: true,
        difficulty: true,
        points: true,
        filePath: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(challenges);
  } catch (err) {
  console.error('❌ Error fetching challenges:', err.message);
  console.error(err.stack);
  res.status(500).json({ error: err.message });
}

};

