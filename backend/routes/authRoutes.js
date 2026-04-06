import express from "express";
import {
  login,
  register,
  registerSeller,
} from "../controllers/authController.js";

const router = express.Router();

router.post("/signin", login); // Login ke liye
router.post("/signup", register);
router.post("/register-seller", registerSeller); // Register ke liye

export default router;
