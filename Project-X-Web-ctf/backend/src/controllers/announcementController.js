/**
 * Announcement Controller (ESM + Secured + Optimized)
 */

import prisma from "../config/db.js";
import { broadcast } from "../lib/ws/ws.js";

/* -------------------------------------------------------------------------- */
/*                                  Helpers                                   */
/* -------------------------------------------------------------------------- */

function assertAdmin(req) {
  if (!req.user || req.user.role !== "admin") {
    const error = new Error("Admin only");
    error.status = 403;
    throw error;
  }
}

/* -------------------------------------------------------------------------- */
/*                              Create Announcement                            */
/* -------------------------------------------------------------------------- */

export async function createAnnouncement(req, res) {
  try {
    assertAdmin(req);

    const title = req.body.title?.trim();
    const message = req.body.message?.trim();

    if (!title || !message) {
      return res.status(400).json({ error: "Title and message required" });
    }

    const ann = await prisma.announcement.create({
      data: { title, message },
    });

    // WS should never block API flow
    try {
      broadcast({
        type: "announcement",
        id: ann.id,
        title: ann.title,
        message: ann.message,
        createdAt: ann.createdAt,
      });
    } catch (err) {
      console.error("WS broadcast failed:", err);
    }

    return res.json(ann);
  } catch (err) {
    console.error("Create announcement error:", err);
    return res.status(err.status || 500).json({
      error: err.status === 403 ? "Admin only" : "Failed to create announcement",
    });
  }
}

/* -------------------------------------------------------------------------- */
/*                             Get All Announcements                           */
/* -------------------------------------------------------------------------- */

export async function getAnnouncements(req, res) {
  try {
    const anns = await prisma.announcement.findMany({
      orderBy: { createdAt: "desc" },
    });

    return res.json(anns);
  } catch (err) {
    console.error("Announcement fetch error:", err);
    return res.status(500).json({ error: "Failed to fetch announcements" });
  }
}

/* -------------------------------------------------------------------------- */
/*                                   Mark Read                                */
/* -------------------------------------------------------------------------- */

export async function markRead(req, res) {
  try {
    const announcementId = Number(req.params.id);
    const userId = req.user.id;

    if (isNaN(announcementId)) {
      return res.status(400).json({ error: "Invalid announcement ID" });
    }

    const exists = await prisma.announcement.findUnique({
      where: { id: announcementId },
      select: { id: true },
    });

    if (!exists) {
      return res.status(404).json({ error: "Announcement not found" });
    }

    await prisma.announcementRead.upsert({
      where: { announcementId_userId: { announcementId, userId } },
      create: { announcementId, userId },
      update: {},
    });

    return res.json({ ok: true });
  } catch (err) {
    console.error("Mark read error:", err);
    return res.status(500).json({ error: "Failed to mark read" });
  }
}

/* -------------------------------------------------------------------------- */
/*                                 Unread Count                               */
/* -------------------------------------------------------------------------- */

export async function unreadCount(req, res) {
  try {
    const userId = req.user.id;

    const unread = await prisma.announcement.count({
      where: {
        reads: {
          none: { userId }
        }
      }
    });

    return res.json({ unread });
  } catch (err) {
    console.error("Unread count error:", err);
    return res.status(500).json({ error: "Failed to fetch unread count" });
  }
}

export default {
  createAnnouncement,
  getAnnouncements,
  markRead,
  unreadCount,
};
