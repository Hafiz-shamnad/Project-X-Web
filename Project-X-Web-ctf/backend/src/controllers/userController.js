const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Create user if not exists, else return existing
const createOrGetUser = async (req, res) => {
  const { username } = req.body;

  try {
    let user = await prisma.user.findUnique({ where: { username } });

    if (!user) {
      user = await prisma.user.create({ data: { username } });
    }

    res.json(user);
  } catch (error) {
    console.error('Error creating/getting user:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const getUser = async (req, res) => {
  const { username } = req.params;
  try {
    const user = await prisma.user.findUnique({
      where: { username },
      include: { solved: true }, // include solved relations
    });

    if (!user) {
      return res.json({
        id: null,
        username,
        solved: [],
      });
    }

    res.json({
      id: user.id,
      username: user.username,
      solved: user.solved || [],
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};


// Toggle challenge solve
const toggleSolve = async (req, res) => {
  const { username, challengeId } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { username } });
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Example logic
    const solved = await prisma.solved.create({
      data: {
        userId: user.id,
        challengeId: challengeId,
      },
    });

    res.json(solved);
  } catch (error) {
    console.error('Error toggling solve:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

module.exports = {
  createOrGetUser,
  getUser,
  toggleSolve,
};
