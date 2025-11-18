/**
 * Project_X - Production Server (ESM Version)
 * Secure, Strict & Scalable Express + WebSocket Setup
 */

import "dotenv/config";
import express from "express";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import morgan from "morgan";
import path from "path";
import fs from "fs";
import compression from "compression";
import http from "http";

import { fileURLToPath } from "url";

// DB + Jobs
import { initDB } from "./src/config/db.js";
import { autoStopExpiredContainers } from "./src/jobs/autostopper.js";

// WebSocket
import { initWebSocketServer } from "./src/lib/ws/ws.js";

// Routes
import challengeRoutes from "./src/routes/challengeRoutes.js";
import leaderboardRoutes from "./src/routes/leaderboardRoutes.js";
import userRoutes from "./src/routes/userRoutes.js";
import flagRoutes from "./src/routes/flagRoutes.js";
import authRoutes from "./src/routes/authRoutes.js";
import adminRoutes from "./src/routes/adminRoutes.js";
import teamRoutes from "./src/routes/teamRoutes.js";
import profileRoutes from "./src/routes/profileRoutes.js";
import announcementRoutes from "./src/routes/announcementRoutes.js";

// --------------------------------------------------------------------------
// Init
// --------------------------------------------------------------------------

const app = express();
const PORT = process.env.PORT || 4000;

// Handle __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// WebSocket
const server = http.createServer(app);
initWebSocketServer(server);

// --------------------------------------------------------------------------
// Security
// --------------------------------------------------------------------------

app.use(
  helmet({
    contentSecurityPolicy: false,
  })
);

app.use(compression());

const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 120,
  standardHeaders: true,
  message: { error: "Too many requests, slow down." },
});

app.use("/api", apiLimiter);

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
}

// --------------------------------------------------------------------------
// Database
// --------------------------------------------------------------------------

initDB();

// --------------------------------------------------------------------------
// Cron Jobs
// --------------------------------------------------------------------------

setInterval(() => {
  autoStopExpiredContainers().catch((err) =>
    console.error("Auto-stop job error:", err)
  );
}, 60000);

// --------------------------------------------------------------------------
// Routes
// --------------------------------------------------------------------------

app.use("/api/challenges", challengeRoutes);
app.use("/api/leaderboard", leaderboardRoutes);
app.use("/api/user", userRoutes);
app.use("/api/flag", flagRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/team", teamRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/announcement", announcementRoutes);

// --------------------------------------------------------------------------
// Static
// --------------------------------------------------------------------------

app.use(
  "/uploads",
  express.static(path.join(__dirname, "uploads"), {
    immutable: true,
    maxAge: "7d",
  })
);

// --------------------------------------------------------------------------
// Downloads
// --------------------------------------------------------------------------

app.get("/api/download/:filename", (req, res) => {
  const file = req.params.filename;

  if (!/^[a-zA-Z0-9._-]+$/.test(file)) {
    return res.status(400).json({ error: "Invalid filename" });
  }

  const filePath = path.join(__dirname, "uploads", file);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: "File not found" });
  }

  res.download(filePath, file);
});

// --------------------------------------------------------------------------
// Health
// --------------------------------------------------------------------------

app.get("/api/health", (req, res) => {
  res.json({
    ok: true,
    timestamp: new Date(),
    mode: process.env.NODE_ENV ?? "dev",
  });
});

// --------------------------------------------------------------------------
// Error Handler
// --------------------------------------------------------------------------

app.use((err, req, res, next) => {
  console.error("🔥 Global Error:", err);
  res
    .status(err.status || 500)
    .json({ error: err.message || "Internal Server Error" });
});

// --------------------------------------------------------------------------
// Start Server
// --------------------------------------------------------------------------

server.listen(PORT, () =>
  console.log(`🚀 Project_X API + WebSocket running on ${PORT}`)
);

// --------------------------------------------------------------------------
// Fail-safe
// --------------------------------------------------------------------------

process.on("unhandledRejection", (err) =>
  console.error("UNHANDLED REJECTION:", err)
);

process.on("uncaughtException", (err) => {
  console.error("UNCAUGHT EXCEPTION:", err);
  process.exit(1);
});
