const { prisma } = require('../config/db');

// 👤 Get current user's profile
exports.getMyProfile = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        team: true,
        solves: {
          include: { challenge: true },
          orderBy: { id: 'desc' },
        },
      },
    });

    if (!user) return res.status(404).json({ error: 'User not found' });

    const totalPoints = user.solves.reduce(
      (acc, s) => acc + (s.challenge?.points || 0),
      0
    );

    res.json({
      id: user.id,
      username: user.username,
      bio: user.bio,
      country: user.country,
      team: user.team ? { id: user.team.id, name: user.team.name } : null,
      totalPoints,
      challengesSolved: user.solves.map((s) => ({
        id: s.challenge.id,
        name: s.challenge.name,
        category: s.challenge.category,
        points: s.challenge.points,
      })),
      createdAt: user.createdAt,
      avatarUrl: user.avatarUrl,
    });
  } catch (err) {
    console.error('Profile fetch error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// 🌐 Public profile by username
exports.getPublicProfile = async (req, res) => {
  try {
    const { username } = req.params;

    const user = await prisma.user.findUnique({
      where: { username },
      include: {
        team: true,
        solves: {
          include: { challenge: true },
        },
      },
    });

    if (!user) return res.status(404).json({ error: 'User not found' });

    const totalPoints = user.solves.reduce(
      (acc, s) => acc + (s.challenge?.points || 0),
      0
    );

    res.json({
      username: user.username,
      bio: user.bio,
      country: user.country,
      team: user.team ? user.team.name : null,
      totalPoints,
      solves: user.solves.length,
      avatarUrl: user.avatarUrl,
    });
  } catch (err) {
    console.error('Public profile error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// ✏️ Update logged-in user's profile
exports.updateMyProfile = async (req, res) => {
  try {
    const { bio, country, avatarUrl } = req.body;

    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        bio: bio || '',
        country: country || '',
        avatarUrl: avatarUrl || '',
      },
      select: {
        id: true,
        username: true,
        bio: true,
        country: true,
        avatarUrl: true,
        createdAt: true,
      },
    });

    res.json({
      message: 'Profile updated successfully',
      user,
    });
  } catch (err) {
    console.error('Profile update error:', err);
    res.status(500).json({ error: 'Server error updating profile' });
  }
};
