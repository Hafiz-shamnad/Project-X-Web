/**
 * WebSocket Server (Browser-safe + Cookie-safe + JWT Auth)
 */

import { WebSocketServer } from "ws";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;

// Allowed frontend origins
const ALLOWED_ORIGINS = [
  "http://localhost:3000",
  "http://127.0.0.1:3000",
];

let wss = null;
let clients = new Set();

/**
 * Extract token from:
 *  - ws://host/ws?token=xxx  (browser)
 *  - Authorization: Bearer xxx (CLI/tools)
 */
function extractToken(req) {
  // CLI / tools
  const auth = req.headers?.authorization;
  if (auth && auth.startsWith("Bearer ")) {
    return auth.slice(7);
  }

  // Browser: token query
  try {
    const url = new URL(req.url, "http://localhost");
    return url.searchParams.get("token");
  } catch (_) {}

  return null;
}

export function initWebSocketServer(server) {
  wss = new WebSocketServer({ noServer: true });

  server.on("upgrade", (req, socket, head) => {
    if (!req.url.startsWith("/ws")) {
      socket.write("HTTP/1.1 404 Not Found\r\n\r\n");
      socket.destroy();
      return;
    }

    /* ---------------------------------------------------------
       ORIGIN VALIDATION (Browser security)
    --------------------------------------------------------- */
    const origin = req.headers.origin ?? "";
    if (origin && !ALLOWED_ORIGINS.includes(origin)) {
      socket.write("HTTP/1.1 403 Forbidden\r\n\r\n");
      socket.destroy();
      return;
    }

    /* ---------------------------------------------------------
       TOKEN VALIDATION
    --------------------------------------------------------- */
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

    /* ---------------------------------------------------------
       UPGRADE TO WEBSOCKET
    --------------------------------------------------------- */
    wss.handleUpgrade(req, socket, head, (ws) => {
      wss.emit("connection", ws, req);
    });
  });

  /* ---------------------------------------------------------
     CLIENT CONNECTED
  --------------------------------------------------------- */
  wss.on("connection", (ws, req) => {
    ws.user = req.user;
    clients.add(ws);

    console.log(`🔗 WS connected: ${ws.user.username} (${ws.user.role})`);

    ws.on("close", () => {
      clients.delete(ws);
      console.log(`❌ WS disconnected: ${ws.user.username}`);
    });
  });

  console.log("🔌 WebSocket server initialized (JWT + Browser-safe)");
  return wss;
}

/**
 * Send event to all clients
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
