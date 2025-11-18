/**
 * WebSocket Server (ESM)
 */

import { WebSocketServer } from "ws";

let wss = null;
let clients = new Set();

export function initWebSocketServer(server) {
  wss = new WebSocketServer({ noServer: true });

  server.on("upgrade", (req, socket, head) => {
    if (req.url === "/ws") {
      wss.handleUpgrade(req, socket, head, (ws) => {
        wss.emit("connection", ws, req);
      });
    }
  });

  wss.on("connection", (ws) => {
    clients.add(ws);

    ws.on("close", () => {
      clients.delete(ws);
    });
  });

  console.log("🔌 WebSocket server initialized");
  return wss;
}

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
