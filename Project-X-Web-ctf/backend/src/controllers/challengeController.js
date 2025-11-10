const { prisma } = require('../config/db');

exports.getChallengeById = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const challenge = await prisma.challenge.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        description: true,
        category: true,
        difficulty: true,
        points: true,
        filePath: true, // ✅ include file path
      },
    });

    if (!challenge) {
      return res.status(404).json({ error: 'Challenge not found' });
    }

    // ✅ include full download URL (so frontend doesn’t need to join)
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const fileUrl = challenge.file ? `${baseUrl}${challenge.file}` : null;

    res.json({ ...challenge, fileUrl });
  } catch (err) {
    console.error('❌ Error fetching challenge:', err);
    res.status(500).json({ error: 'Server error' });
  }
};


exports.getChallenges = async (req, res) => {
  try {
    const challenges = await prisma.challenge.findMany();
    res.json(challenges);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
