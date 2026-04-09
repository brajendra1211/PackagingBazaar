import express from "express";
import {
  login,
  register,
  registerSeller,
  getCurrentUser,
} from "../controllers/authController.js";
import { verifyToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/signin", login);
router.post("/signup", register);
router.post("/register-seller", registerSeller);
router.get("/me", verifyToken, getCurrentUser);

export default router;
