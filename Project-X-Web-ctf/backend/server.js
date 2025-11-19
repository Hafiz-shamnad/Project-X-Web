/**
 * Project_X - Production Server (ESM Version)
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

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// WebSocket server
const server = http.createServer(app);

// --------------------------------------------------------------------------
// ORIGIN NORMALIZER (Fixes all CORS mismatch bugs)
// --------------------------------------------------------------------------

function normalizeOrigin(origin) {
  if (!origin) return null;
  try {
    if (!origin.startsWith("http")) origin = "https://" + origin;
    const u = new URL(origin);
    return `${u.protocol}//${u.hostname}${u.port ? ":" + u.port : ""}`;
  } catch {
    return null;
  }
}

const frontend = normalizeOrigin(process.env.FRONTEND_URL);
const allowedOrigins = [
  "http://localhost:3000",
  frontend,
].filter(Boolean);

console.log("Allowed Origins:", allowedOrigins);

// --------------------------------------------------------------------------
// Security
// --------------------------------------------------------------------------

app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" },
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

app.use(compression());

app.use(
  rateLimit({
    windowMs: 60 * 1000,
    max: 120,
    standardHeaders: true,
  })
);

// --------------------------------------------------------------------------
// CORS CONFIG
// --------------------------------------------------------------------------

app.set("trust proxy", 1);
app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin) return cb(null, true);

      origin = normalizeOrigin(origin);

      const ok =
        allowedOrigins.includes(origin) ||
        origin?.endsWith(".vercel.app");

      if (ok) return cb(null, true);

      console.log("❌ BLOCKED ORIGIN:", origin);
      return cb(new Error("CORS Forbidden"), false);
    },
    credentials: true,
  })
);

// * Minimal fallback headers
app.use((req, res, next) => {
  if (req.headers.origin) {
    res.header("Access-Control-Allow-Origin", req.headers.origin);
  }
  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  if (req.method === "OPTIONS") return res.sendStatus(200);
  next();
});

// --------------------------------------------------------------------------
// Body + Cookies
// --------------------------------------------------------------------------

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
// WebSocket INIT (after DB)
// --------------------------------------------------------------------------

initWebSocketServer(server);

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
// Static Uploads
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
  if (!/^[a-zA-Z0-9._-]+$/.test(file))
    return res.status(400).json({ error: "Invalid filename" });

  const filepath = path.join(__dirname, "uploads", file);
  if (!fs.existsSync(filepath))
    return res.status(404).json({ error: "File not found" });

  res.download(filepath, file);
});

// --------------------------------------------------------------------------
// Health Check
// --------------------------------------------------------------------------

app.get("/api/health", (req, res) => {
  res.json({
    ok: true,
    timestamp: new Date(),
    node: process.version,
    mode: process.env.NODE_ENV || "dev",
  });
});

// --------------------------------------------------------------------------
// Error Handler
// --------------------------------------------------------------------------

app.use((err, req, res, next) => {
  console.error("🔥 Global Error:", err);
  res.status(err.status || 500).json({
    error: err.message || "Server error",
  });
});

// --------------------------------------------------------------------------
// Start Server
// --------------------------------------------------------------------------

server.listen(PORT, () =>
  console.log(`🚀 Project_X API + WS running on port ${PORT}`)
);

// --------------------------------------------------------------------------
// Fail-safe
// --------------------------------------------------------------------------

process.on("unhandledRejection", (e) =>
  console.error("UNHANDLED:", e)
);

process.on("uncaughtException", (e) => {
  console.error("UNCAUGHT:", e);
  process.exit(1);
});
