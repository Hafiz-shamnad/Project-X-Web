// src/routes/authRoutes.js
import express from "express";
import { register, login, logout, me } from "../controllers/authController.js";
import { authenticate } from "../middlewares/auth.js";

const router = express.Router();

// Public
router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);

// Protected
router.get("/me", authenticate, me);

export default router;
