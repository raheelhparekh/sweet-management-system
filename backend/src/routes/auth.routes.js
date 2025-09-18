import express from "express";
import { registerUser, authUser, logoutUser, getCurrentUser } from "../controllers/auth.controllers.js";
import protect from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", authUser);
router.post("/logout", logoutUser);
router.get("/me", protect, getCurrentUser);

export default router;
