// src/routes/authRoutes.js

import express from "express";
import {
  register,
  login,
  logout,
  me
} from "../controllers/authController.js";
import { authenticate } from "../middlewares/auth.js";

const router = express.Router();

/* -------------------------------------------------------------------------- */
/*                                   PUBLIC                                    */
/* -------------------------------------------------------------------------- */

router.post("/register", register);
router.post("/login", login);

/* 
  logout does NOT require authentication,
  because a user may call logout even if their cookie is expired.
*/
router.post("/logout", logout);

/* -------------------------------------------------------------------------- */
/*                                  PROTECTED                                  */
/* -------------------------------------------------------------------------- */

router.get("/me", authenticate, me);

export default router;
