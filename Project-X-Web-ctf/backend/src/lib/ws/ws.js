/**
 * WebSocket Server (JWT Auth + Browser-safe + CLI-safe + CORS-safe)
 */

import { WebSocketServer } from "ws";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;

let wss = null;
let clients = new Set();

/**
 * Extract JWT token from:
 * 1) Authorization header (CLI/cURL)
 * 2) ?token= in WebSocket URL (Browser)
 */
function extractToken(req) {
  // 1) Authorization header
  const auth = req.headers?.authorization;
  if (auth && auth.startsWith("Bearer ")) {
    return auth.split(" ")[1];
  }

  // 2) Query param: ws://host/ws?token=...
  try {
    const url = new URL(req.url, "http://localhost"); // base irrelevant
    const t = url.searchParams.get("token");
    if (t) return t;
  } catch (_) {}

  return null;
}

export function initWebSocketServer(server) {
  wss = new WebSocketServer({ noServer: true });

  server.on("upgrade", (req, socket, head) => {
    // Only accept /ws
    if (!req.url.startsWith("/ws")) {
      socket.write("HTTP/1.1 404 Not Found\r\n\r\n");
      socket.destroy();
      return;
    }

    // --- AUTH ---
    const token = extractToken(req);

    if (!token) {
      socket.write("HTTP/1.1 401 Unauthorized\r\n\r\n");
      socket.destroy();
      return;
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;
    } catch (err) {
      socket.write("HTTP/1.1 401 Unauthorized\r\n\r\n");
      socket.destroy();
      return;
    }

    // --- Accept upgrade ---
    wss.handleUpgrade(req, socket, head, (ws) => {
      wss.emit("connection", ws, req);
    });
  });

  // Allow CORS on WebSocket handshake response
  wss.on("headers", (headers, req) => {
    headers.push("Access-Control-Allow-Origin: *");
  });

  // --- On Connection ---
  wss.on("connection", (ws, req) => {
    ws.user = req.user;
    clients.add(ws);

    console.log(`🔗 WS connected: ${ws.user.username} (${ws.user.role})`);

    ws.on("close", () => {
      clients.delete(ws);
      console.log(`❌ WS disconnected: ${ws.user.username}`);
    });
  });

  console.log("🔌 WebSocket server initialized with JWT + Browser-safe auth");
  return wss;
}

/**
 * Broadcast event to all connected clients
 */
export function broadcast(event) {
  const message = JSON.stringify(event);

  for (const ws of clients) {
    try {
      ws.send(message);
    } catch (err) {
      console.error("WebSocket send failed:", err);
    }
  }
}

export default { initWebSocketServer, broadcast };
