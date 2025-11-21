/**
 * WebSocket Server (JWT Auth + Origin-safe + Browser-safe)
 */

import { WebSocketServer } from "ws";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;

// Allowed frontend for WS
const FRONTEND = "http://localhost:3000";

let wss = null;
let clients = new Set();

/**
 * Extract JWT token
 * - Authorization: Bearer xxx (CLI)
 * - ws://host/ws?token=xxx (Browser)
 */
function extractToken(req) {
  const auth = req.headers?.authorization;
  if (auth && auth.startsWith("Bearer ")) {
    return auth.slice(7);
  }

  try {
    const url = new URL(req.url, "http://localhost"); 
    return url.searchParams.get("token");
  } catch (_) {}

  return null;
}

export function initWebSocketServer(server) {
  wss = new WebSocketServer({ noServer: true });

  server.on("upgrade", (req, socket, head) => {
    // Only handle /ws path
    if (!req.url.startsWith("/ws")) {
      socket.write("HTTP/1.1 404 Not Found\r\n\r\n");
      socket.destroy();
      return;
    }

    // --- ORIGIN CHECK (browser security) ---
    const origin = req.headers.origin || "";
    if (origin && origin !== FRONTEND) {
      socket.write("HTTP/1.1 403 Forbidden\r\n\r\n");
      socket.destroy();
      return;
    }

    // --- TOKEN CHECK ---
    const token = extractToken(req);

    if (!token) {
      socket.write("HTTP/1.1 401 Unauthorized\r\n\r\n");
      socket.destroy();
      return;
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;
    } catch {
      socket.write("HTTP/1.1 401 Unauthorized\r\n\r\n");
      socket.destroy();
      return;
    }

    // Upgrade to WebSocket
    wss.handleUpgrade(req, socket, head, (ws) => {
      wss.emit("connection", ws, req);
    });
  });

  // *** DO NOT SET CORS HEADERS FOR WebSockets ***
  // Browsers do not use CORS for WS; adding CORS breaks HTTP response headers.
  // wss.on("headers", ...) was removed.

  // --- On Client Connection ---
  wss.on("connection", (ws, req) => {
    ws.user = req.user;
    clients.add(ws);

    console.log(`🔗 WS connected: ${ws.user.username} (${ws.user.role})`);

    ws.on("close", () => {
      clients.delete(ws);
      console.log(`❌ WS disconnected: ${ws.user.username}`);
    });
  });

  console.log("🔌 WebSocket server initialized (JWT + Origin-safe)");
  return wss;
}

/**
 * Broadcast event to all connected clients
 */
export function broadcast(event) {
  const msg = JSON.stringify(event);

  for (const ws of clients) {
    try {
      ws.send(msg);
    } catch (err) {
      console.error("WebSocket send failed:", err);
    }
  }
}

export default { initWebSocketServer, broadcast };
