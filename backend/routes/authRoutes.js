import express from "express";
import {
  login,
  register,
  registerSeller,
  getCurrentUser,
} from "../controllers/authController.js";
import { verifyToken } from "../middlewares/authMiddleware.js";
import upload from "../middlewares/uploadMiddleware.js";

const router = express.Router();

router.post("/signin", login);
router.post("/signup", register);
router.post("/register-seller", upload.single("gst_certificate"), registerSeller);
router.get("/me", verifyToken, getCurrentUser);

export default router;
