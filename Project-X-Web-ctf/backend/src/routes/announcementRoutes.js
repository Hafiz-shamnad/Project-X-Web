import express from "express";
import { authenticate } from "../middlewares/auth.js";

import {
  createAnnouncement,
  getAnnouncements,
  markRead,
  unreadCount,
} from "../controllers/announcementController.js";

const router = express.Router();

router.post("/", authenticate, createAnnouncement);
router.get("/", authenticate, getAnnouncements);
router.get("/unread", authenticate, unreadCount);
router.post("/:id/read", authenticate, markRead);

export default router;
