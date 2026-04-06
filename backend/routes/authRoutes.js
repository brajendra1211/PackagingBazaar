import express from "express";
import {
  login,
  register,
  registerSeller,
  getCurrentUser,
} from "../controllers/authController.js";
import { verifyToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/signin", login); // Login ke liye
router.post("/signup", register);
router.post("/register-seller", registerSeller); // Register ke liye
router.get("/me", verifyToken, getCurrentUser); // Get current logged in user

export default router;
