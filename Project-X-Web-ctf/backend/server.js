const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const path = require("path");
const fs = require("fs");

const { initDB } = require("./src/config/db");

const challengeRoutes = require("./src/routes/challengeRoutes");
const leaderboardRoutes = require("./src/routes/leaderboardRoutes");
const userRoutes = require("./src/routes/userRoutes");
const flagRoutes = require("./src/routes/flagRoutes");
const authRoutes = require("./src/routes/authRoutes");
const adminRoutes = require("./src/routes/adminRoutes");
const teamRoutes = require("./src/routes/teamRoutes");
const profileRoutes = require("./src/routes/profileRoutes");

const app = express();

/* -------------------------------------------------------------------------- */
/*                                Security Setup                               */
/* -------------------------------------------------------------------------- */

// Basic security headers
app.use(helmet());

// Prevent brute-force and flag submission hammering
const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 120,            // max 120 requests/min per IP
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api", apiLimiter);

// CORS with strict configuration
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  })
);

app.use(express.json());
app.use(cookieParser());

/* -------------------------------------------------------------------------- */
/*                           Initialize Database                               */
/* -------------------------------------------------------------------------- */

initDB();

/* -------------------------------------------------------------------------- */
/*                                   Routes                                    */
/* -------------------------------------------------------------------------- */

app.use("/api/challenges", challengeRoutes);
app.use("/api/leaderboard", leaderboardRoutes);
app.use("/api/user", userRoutes);
app.use("/api/flag", flagRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/team", teamRoutes);
app.use("/api/profile", profileRoutes);

// Static file serving
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

/* -------------------------------------------------------------------------- */
/*                       Secure File Download Endpoint                        */
/* -------------------------------------------------------------------------- */

/**
 * Secure file download
 * GET /api/download/:filename
 */
app.get("/api/download/:filename", (req, res) => {
  try {
    const fileName = req.params.filename;

    // Reject path traversal attempts
    if (!/^[a-zA-Z0-9._-]+$/.test(fileName)) {
      return res.status(400).json({ error: "Invalid filename" });
    }

    const filePath = path.join(__dirname, "uploads", fileName);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: "File not found" });
    }

    res.download(filePath, fileName);
  } catch (err) {
    console.error("File download error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

/* -------------------------------------------------------------------------- */
/*                                 Health Check                                */
/* -------------------------------------------------------------------------- */

app.get("/api/health", (req, res) => {
  res.json({ ok: true, timestamp: new Date().toISOString() });
});

/* -------------------------------------------------------------------------- */
/*                                   Startup                                   */
/* -------------------------------------------------------------------------- */

const PORT = process.env.PORT || 4000;
app.listen(PORT, () =>
  console.log(`Project_X API is running securely on port ${PORT}`)
);
