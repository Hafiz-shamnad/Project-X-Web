const jwt = require('jsonwebtoken');

exports.authenticate = (req, res, next) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecretkey');

    // ✅ Normalize user object so all controllers work
    req.user = {
      id: decoded.userId || decoded.id,
      username: decoded.username,
      role: decoded.role,
    };

    if (!req.user.id) {
      console.warn('⚠️ Missing user id in decoded token:', decoded);
      return res.status(401).json({ error: 'Unauthorized: user missing' });
    }

    next();
  } catch (err) {
    console.error('Auth error:', err);
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

// 🛡️ Optional admin guard
exports.requireAdmin = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden: admin only' });
  }
  next();
};
