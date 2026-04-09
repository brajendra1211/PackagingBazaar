import express from "express";
const router = express.Router();

import { 
  getUserProfile, 
  updateUserProfile, 
  getAddresses, 
  addAddress, 
  updateAddress, 
  deleteAddress, 
  setDefaultAddress 
} from "../controllers/userController.js";
import { verifyToken } from "../middlewares/authMiddleware.js";

// Profile Routes
router.get("/profile", verifyToken, getUserProfile);
router.put("/profile", verifyToken, updateUserProfile);

// Address Routes
router.get("/addresses", verifyToken, getAddresses);
router.post("/addresses", verifyToken, addAddress);
router.put("/addresses/:id", verifyToken, updateAddress);
router.delete("/addresses/:id", verifyToken, deleteAddress);
router.patch("/addresses/:id/default", verifyToken, setDefaultAddress);

export default router;
