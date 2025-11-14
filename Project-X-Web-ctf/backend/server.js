/**
 * Project_X - Production Server
 * Secure, Strict, Scalable Express Setup
 */

require("dotenv").config();

const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const rateLimit = require("express-rate-limit");
const morgan = require("morgan");
const path = require("path");
const fs = require("fs");
const compression = require("compression");

const { initDB } = require("./src/config/db");
const { autoStopExpiredContainers } = require("./src/jobs/autostopper");

/* -------------------------------------------------------------------------- */
/*                               Initialize App                                */
/* -------------------------------------------------------------------------- */

const app = express();
const PORT = process.env.PORT || 4000;

/* -------------------------------------------------------------------------- */
/*                               Security Setup                                */
/* -------------------------------------------------------------------------- */

// Security headers
app.use(
  helmet({
    contentSecurityPolicy: false, // Disable if frontend loads external scripts
  })
);

// Response compression (better performance)
app.use(compression());

// Prevent brute-force
const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 120, // 120 requests/min
  message: { error: "Too many requests, slow down." },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api", apiLimiter);

// Strict CORS
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Request logging
if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
}

/* -------------------------------------------------------------------------- */
/*                                Database Init                                */
/* -------------------------------------------------------------------------- */

initDB();

/* -------------------------------------------------------------------------- */
/*                                   Cron Job                                  */
/* -------------------------------------------------------------------------- */

// Auto-stop expired Docker containers every 1 minute
setInterval(() => {
  autoStopExpiredContainers().catch((err) =>
    console.error("Auto-stop job error:", err)
  );
}, 60 * 1000);

/* -------------------------------------------------------------------------- */
/*                                   Routes                                    */
/* -------------------------------------------------------------------------- */

app.use("/api/challenges", require("./src/routes/challengeRoutes"));
app.use("/api/leaderboard", require("./src/routes/leaderboardRoutes"));
app.use("/api/user", require("./src/routes/userRoutes"));
app.use("/api/flag", require("./src/routes/flagRoutes"));
app.use("/api/auth", require("./src/routes/authRoutes"));
app.use("/api/admin", require("./src/routes/adminRoutes"));
app.use("/api/team", require("./src/routes/teamRoutes"));
app.use("/api/profile", require("./src/routes/profileRoutes"));

/* -------------------------------------------------------------------------- */
/*                           Static File Handling                              */
/* -------------------------------------------------------------------------- */

app.use(
  "/uploads",
  express.static(path.join(__dirname, "uploads"), {
    immutable: true,
    maxAge: "7d",
  })
);

/* -------------------------------------------------------------------------- */
/*                        Secure File Download Endpoint                        */
/* -------------------------------------------------------------------------- */

app.get("/api/download/:filename", (req, res) => {
  try {
    const fileName = req.params.filename;

    // Validate filename carefully
    if (!/^[a-zA-Z0-9._-]+$/.test(fileName)) {
      return res.status(400).json({ error: "Invalid filename" });
    }

    const filePath = path.join(__dirname, "uploads", fileName);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: "File not found" });
    }

    res.download(filePath, fileName);
  } catch (err) {
    console.error("Download error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

/* -------------------------------------------------------------------------- */
/*                                 Health Check                                */
/* -------------------------------------------------------------------------- */

app.get("/api/health", (req, res) => {
  res.json({
    ok: true,
    env: process.env.NODE_ENV || "development",
    timestamp: new Date().toISOString(),
  });
});

/* -------------------------------------------------------------------------- */
/*                             Global Error Handler                             */
/* -------------------------------------------------------------------------- */

app.use((err, req, res, next) => {
  console.error("🔥 Global Error:", err);
  res
    .status(err.status || 500)
    .json({ error: err.message || "Internal Server Error" });
});

/* -------------------------------------------------------------------------- */
/*                                   Startup                                   */
/* -------------------------------------------------------------------------- */

app.listen(PORT, () =>
  console.log(`Project_X API running securely on port ${PORT}`)
);

process.on("unhandledRejection", (err) => {
  console.error("UNHANDLED PROMISE REJECTION:", err);
});

process.on("uncaughtException", (err) => {
  console.error("UNCAUGHT EXCEPTION:", err);
  process.exit(1);
});
