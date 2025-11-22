/**
 * Announcement Routes (ESM + Cookie Auth)
 * ---------------------------------------
 * All announcement routes require:
 *   - Valid cookie-based JWT (authenticate)
 * Admin-only actions are enforced in the controller.
 */

import express from "express";
import { authenticate } from "../middlewares/auth.js";

import {
  createAnnouncement,
  getAnnouncements,
  markRead,
  unreadCount,
} from "../controllers/announcementController.js";

const router = express.Router();

/* -------------------------------------------------------------------------- */
/*                               AUTH MIDDLEWARE                               */
/* -------------------------------------------------------------------------- */

// All announcement endpoints require authentication
router.use(authenticate);

/* -------------------------------------------------------------------------- */
/*                                 ANNOUNCEMENTS                               */
/* -------------------------------------------------------------------------- */

// Admin-only (checked inside controller)
router.post("/", createAnnouncement);

// Get all announcements available to the authenticated user
router.get("/", getAnnouncements);

// Get unread announcement count for this user
router.get("/unread", unreadCount);

// Mark an announcement as read
router.post("/:id/read", markRead);

export default router;
