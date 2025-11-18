/**
 * Announcement Controller (ESM + Optimized)
 */

import prisma from "../config/db.js";
import { broadcast } from "../lib/ws/ws.js";

/* -------------------------------------------------------------------------- */
/*                               Create Announcement                            */
/* -------------------------------------------------------------------------- */

export async function createAnnouncement(req, res) {
  try {
    const { title, message } = req.body;

    if (!title || !message)
      return res.status(400).json({ error: "Missing fields" });

    const ann = await prisma.announcement.create({
      data: { title, message },
    });

    broadcast({
      type: "announcement",
      id: ann.id,
      title: ann.title,
      message: ann.message,
      createdAt: ann.createdAt,
    });

    return res.json(ann);
  } catch (err) {
    console.error("Create announcement error:", err);
    return res.status(500).json({ error: "Failed to create announcement" });
  }
}

/* -------------------------------------------------------------------------- */
/*                                Get All Announcements                        */
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
/*                                    Mark Read                                 */
/* -------------------------------------------------------------------------- */

export async function markRead(req, res) {
  try {
    const announcementId = Number(req.params.id);
    const userId = req.user.id;

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
/*                                 Unread Count                                 */
/* -------------------------------------------------------------------------- */

export async function unreadCount(req, res) {
  try {
    const userId = req.user.id;

    const unread = await prisma.announcement.count({
      where: { reads: { none: { userId } } },
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
