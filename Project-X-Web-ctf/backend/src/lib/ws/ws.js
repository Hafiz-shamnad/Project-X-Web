/**
 * WebSocket Server (ESM + JWT Auth + Hardened)
 */

import { WebSocketServer } from "ws";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

let wss = null;
let clients = new Set();

export function initWebSocketServer(server) {
  wss = new WebSocketServer({ noServer: true });

  server.on("upgrade", (req, socket, head) => {
    if (req.url !== "/ws") {
      socket.destroy();
      return;
    }

    // --- JWT BEARER VALIDATION ---
    try {
      const auth = req.headers["authorization"];

      if (!auth || !auth.startsWith("Bearer ")) {
        socket.write("HTTP/1.1 401 Unauthorized\r\n\r\n");
        socket.destroy();
        return;
      }

      const token = auth.split(" ")[1];

      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded; // attach user to request
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

  wss.on("connection", (ws, req) => {
    ws.user = req.user;
    clients.add(ws);

    console.log(`🔗 WS connected: ${ws.user.username} (${ws.user.role})`);

    ws.on("close", () => {
      clients.delete(ws);
      console.log(`❌ WS disconnected: ${ws.user.username}`);
    });
  });

  console.log("🔌 WebSocket server initialized with JWT Auth");
  return wss;
}

/**
 * Broadcast event to all connected clients
 */
export function broadcast(event) {
  const json = JSON.stringify(event);

  for (const ws of clients) {
    try {
      ws.send(json);
    } catch (err) {
      console.error("WebSocket send failed:", err);
    }
  }
}

export default { initWebSocketServer, broadcast };
