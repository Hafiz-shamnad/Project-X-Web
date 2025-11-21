/**
 * Project_X Backend (FINAL — STABLE, OPTIMIZED & SECURE)
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

const FRONTEND = process.env.FRONTEND_URL || "https://project-x-web-ten.vercel.app";

console.log("🌐 FRONTEND:", FRONTEND);

// ----------------------------------------------------------------------------
// ORDER IS CRITICAL: Body parser FIRST
// ----------------------------------------------------------------------------

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ----------------------------------------------------------------------------
// SECURITY MIDDLEWARE
// ----------------------------------------------------------------------------

app.use(
  helmet({
    contentSecurityPolicy: false, // React apps need relaxed CSP
    crossOriginResourcePolicy: { policy: "cross-origin" },
    crossOriginEmbedderPolicy: false,
  })
);

app.set("trust proxy", 1); // Required for Railway / Vercel / Nginx
app.use(compression());

/* ----------------------------------------------------------------------------
   CORS — WORKING IN LOCAL + PRODUCTION
---------------------------------------------------------------------------- */

const allowedOrigins = [
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  process.env.FRONTEND_URL,
  "https://project-x-web-ten.vercel.app",
].filter(Boolean);

app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin) return cb(null, true);           // Allow mobile apps / curl / same-origin
      if (allowedOrigins.includes(origin)) return cb(null, true);
      return cb(new Error("CORS blocked: " + origin));
    },
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  })
);

// Correct preflight
app.options(/.*/, (req, res) => {
  res.header("Access-Control-Allow-Origin", req.headers.origin || "*");
  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.header("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
  res.sendStatus(200);
});

// ----------------------------------------------------------------------------
// RATE LIMITING
// ----------------------------------------------------------------------------

app.use(
  rateLimit({
    windowMs: 60_000,
    max: 200,
    standardHeaders: true,
    legacyHeaders: false,
  })
);

// ----------------------------------------------------------------------------
// INIT DB, JOBS, WS
// ----------------------------------------------------------------------------

await initDB(); // Ensure DB initialized before anything else
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
// STATIC FILES
// ----------------------------------------------------------------------------

app.use(
  "/uploads",
  express.static(path.join(__dirname, "uploads"), {
    immutable: true,
    maxAge: "7d",
  })
);

// ----------------------------------------------------------------------------
// FILE DOWNLOAD
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
// HEALTH CHECK
// ----------------------------------------------------------------------------

app.get("/api/health", (req, res) => {
  res.json({ ok: true, time: new Date().toISOString() });
});

// ----------------------------------------------------------------------------
// GLOBAL ERROR HANDLER
// ----------------------------------------------------------------------------

app.use((err, req, res, next) => {
  console.error("🔥 GLOBAL ERROR:", err);
  res.status(err.status || 500).json({
    error: err.message || "Server error",
  });
});

// ----------------------------------------------------------------------------
// START SERVER
// ----------------------------------------------------------------------------

server.listen(PORT, () => {
  console.log(`🚀 Project_X backend running on port ${PORT}`);
});
