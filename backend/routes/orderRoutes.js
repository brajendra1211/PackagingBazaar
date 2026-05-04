import express from "express";
const router = express.Router();

import { checkout, getMyOrders, updateOrderStatus } from "../controllers/orderController.js";
import { verifyToken, isAdmin } from "../middlewares/authMiddleware.js";

// Order routes
router.post("/checkout", verifyToken, checkout);
router.get("/my-orders", verifyToken, getMyOrders);
router.put("/update-status/:id", verifyToken, updateOrderStatus);

export default router;
