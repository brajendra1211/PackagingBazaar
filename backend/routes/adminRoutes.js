import express from "express";
import { getPendingSellers, approveSeller, rejectSeller } from "../controllers/adminController.js";
import { verifyToken, isAdmin } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Route: Get all pending sellers (Requires Login & Admin role)
router.get("/sellers/pending", verifyToken, isAdmin, getPendingSellers);

// Route: Approve a seller
router.put("/sellers/:id/approve", verifyToken, isAdmin, approveSeller);

// Route: Reject a seller
router.delete("/sellers/:id/reject", verifyToken, isAdmin, rejectSeller);

export default router;
