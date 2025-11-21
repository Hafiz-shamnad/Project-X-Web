/**
 * Announcement Routes (ESM + Optimized)
 * -------------------------------------
 * All announcement routes require authentication (Bearer JWT).
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

// Apply auth to all routes in this module
router.use(authenticate);

// Create announcement
router.post("/", createAnnouncement);

// Get all announcements for the user
router.get("/", getAnnouncements);

// Get unread announcement count
router.get("/unread", unreadCount);

// Mark single announcement as read
router.post("/:id/read", markRead);

export default router;
