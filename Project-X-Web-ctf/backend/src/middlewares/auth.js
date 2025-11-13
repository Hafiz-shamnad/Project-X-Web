/**
 * Authentication Middleware
 * -------------------------
 * Verifies JWT from cookies and attaches the user object to req.user.
 * Also includes an admin authorization guard.
 */

const jwt = require("jsonwebtoken");

/* -------------------------------------------------------------------------- */
/*                              Authenticate User                              */
/* -------------------------------------------------------------------------- */

/**
 * Validate the JWT stored in cookies and attach user info to req.user.
 * @route Middleware
 */
exports.authenticate = (req, res, next) => {
  try {
    const token = req.cookies?.token;

    if (!token) {
      return res.status(401).json({ error: "Authentication token missing" });
    }

    const secret = process.env.JWT_SECRET || "supersecretkey";
    const decoded = jwt.verify(token, secret);

    const userId = decoded.userId || decoded.id;

    if (!userId) {
      return res.status(401).json({ error: "Invalid token: missing user ID" });
    }

    // Normalize user object for consistency across controllers
    req.user = {
      id: userId,
      username: decoded.username || null,
      role: decoded.role || "user",
    };

    return next();
  } catch (err) {
    console.error("Authentication error:", err.message);
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};

/* -------------------------------------------------------------------------- */
/*                               Require Admin                                 */
/* -------------------------------------------------------------------------- */

/**
 * Guard middleware to restrict access to admin-only routes.
 */
exports.requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ error: "Access denied: admin only" });
  }

  return next();
};
