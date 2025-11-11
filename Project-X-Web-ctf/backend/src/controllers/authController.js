const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { prisma } = require('../config/db');

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';
const JWT_EXPIRES_IN = '7d';
const BCRYPT_ROUNDS = 12;

function generateToken(user) {
  return jwt.sign(
    { userId: user.id, username: user.username, role: user.role },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

const cookieOptions = {
  httpOnly: true, // 🚫 cannot be accessed by JS
  secure: process.env.NODE_ENV === 'production', // only HTTPS in prod
  sameSite: 'lax', // protect against CSRF
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

// 🧩 Register
exports.register = async (req, res) => {
  try {
    const { username, password, email } = req.body;

    if (!username || !password)
      return res.status(400).json({ error: 'Username and password required' });

    const existing = await prisma.user.findUnique({ where: { username } });
    if (existing) return res.status(409).json({ error: 'Username already exists' });

    const hash = await bcrypt.hash(password, BCRYPT_ROUNDS);
    const user = await prisma.user.create({
      data: { username, passwordHash: hash, email },
    });

    const token = generateToken(user);
    res.cookie('token', token, cookieOptions); // 🍪 Set cookie

    return res.json({
      message: 'Registration successful',
      user: { id: user.id, username: user.username, role: user.role },
    });
  } catch (err) {
    console.error('Register Error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// 🔐 Login
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await prisma.user.findUnique({ where: { username } });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) return res.status(401).json({ error: 'Invalid credentials' });

    const token = generateToken(user);
    res.cookie('token', token, cookieOptions); // 🍪 Set cookie

    return res.json({
      message: 'Login successful',
      user: { id: user.id, username: user.username, role: user.role },
    });
  } catch (err) {
    console.error('Login Error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// in src/controllers/authController.js
exports.logout = (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  });
  res.json({ message: 'Logged out successfully' });
};


// 👤 Get Current User (/api/auth/me)
exports.me = async (req, res) => {
  try {
    const token = req.cookies?.token;
    if (!token) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    // ✅ Verify token integrity
    const decoded = jwt.verify(token, JWT_SECRET);

    // ✅ Fetch user + minimal team info securely
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        createdAt: true,
        team: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // ✅ Return sanitized user data
    res.json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
        teamId: user.team?.id || null,
        teamName: user.team?.name || null,
      },
    });
  } catch (err) {
    console.error('❌ /auth/me error:', err);

    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Session expired. Please log in again.' });
    }

    res.status(401).json({ error: 'Invalid or expired token' });
  }
};
