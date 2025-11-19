// src/middlewares/auth.js
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

/**
 * Authenticate using:
 *  1) Authorization: Bearer <token>
 *  2) Fallback: cookie "token" (backward compatibility)
 */
export function authenticate(req, res, next) {
  try {
    const auth = req.headers?.authorization;
    let token = null;

    // Prefer header
    if (auth && typeof auth === "string" && auth.startsWith("Bearer ")) {
      token = auth.split(" ")[1];
    } else {
      // Fallback to cookie
      token = req.cookies?.token || null;
    }

    if (!token) {
      return res.status(401).json({ error: "Authentication token missing" });
    }

    const decoded = jwt.verify(token, JWT_SECRET);

    const userId = decoded.userId || decoded.id;
    if (!userId) {
      return res.status(401).json({ error: "Invalid token: missing user ID" });
    }

    req.user = {
      id: userId,
      username: decoded.username || null,
      role: decoded.role || "user",
    };

    next();
  } catch (err) {
    console.error("Authentication error:", err.message || err);
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

export function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ error: "Access denied: admin only" });
  }
  next();
}

export default { authenticate, requireAdmin };
