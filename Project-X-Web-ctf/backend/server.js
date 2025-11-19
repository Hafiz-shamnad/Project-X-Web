/**
 * Project_X Backend (FINAL FIXED)
 */

import "dotenv/config";
import express from "express";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import compression from "compression";
import http from "http";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

// DB
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

// ----------------------------------------------------------------------------

const app = express();
const PORT = process.env.PORT || 4000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const server = http.createServer(app);

// ----------------------------------------------------------------------------
// FRONTEND + BACKEND CONFIG
// ----------------------------------------------------------------------------

const FRONTEND = "http://localhost:3000";
const BACKEND_DOMAIN = "http://localhost:4000/api";

console.log("🌐 FRONTEND:", FRONTEND);
console.log("🌐 BACKEND DOMAIN:", BACKEND_DOMAIN);

// ----------------------------------------------------------------------------
// ORDER IS CRITICAL: Body parser MUST be FIRST
// ----------------------------------------------------------------------------

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ----------------------------------------------------------------------------
// Security
// ----------------------------------------------------------------------------

app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

app.use(compression());
app.set("trust proxy", 1);

// ----------------------------------------------------------------------------
// CORS (FULLY FIXED)
// ----------------------------------------------------------------------------

app.use(
  cors({
    origin: FRONTEND,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Preflight support (Node 22 + Express 5 fixed)
app.options(/.*/, (req, res) => {
  res.header("Access-Control-Allow-Origin", FRONTEND);
  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.header("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
  res.sendStatus(200);
});

// ----------------------------------------------------------------------------
// Rate Limit
// ----------------------------------------------------------------------------

app.use(
  rateLimit({
    windowMs: 60_000,
    max: 200,
  })
);

// ----------------------------------------------------------------------------
// DB / Jobs / WS
// ----------------------------------------------------------------------------

initDB();
autoStopExpiredContainers?.();
initWebSocketServer(server);

// ----------------------------------------------------------------------------
// API ROUTES
// ----------------------------------------------------------------------------

app.use("/api/challenges", challengeRoutes);
app.use("/api/leaderboard", leaderboardRoutes);
app.use("/api/user", userRoutes);
app.use("/api/flag", flagRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/team", teamRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/announcement", announcementRoutes);

// ----------------------------------------------------------------------------
// Static files
// ----------------------------------------------------------------------------

app.use(
  "/uploads",
  express.static(path.join(__dirname, "uploads"), {
    immutable: true,
    maxAge: "7d",
  })
);

// ----------------------------------------------------------------------------
// Download
// ----------------------------------------------------------------------------

app.get("/api/download/:file", (req, res) => {
  const file = req.params.file;
  const filePath = path.join(__dirname, "uploads", file);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: "Not found" });
  }

  res.download(filePath);
});

// ----------------------------------------------------------------------------
// Health
// ----------------------------------------------------------------------------

app.get("/api/health", (req, res) => {
  res.json({ ok: true, time: new Date() });
});

// ----------------------------------------------------------------------------
// Error handler
// ----------------------------------------------------------------------------

app.use((err, req, res, next) => {
  console.error("🔥 ERROR:", err);
  res.status(500).json({ error: err.message || "Server error" });
});

// ----------------------------------------------------------------------------
// Start Server
// ----------------------------------------------------------------------------

server.listen(PORT, () => {
  console.log(`🚀 Project_X backend running on port ${PORT}`);
});
