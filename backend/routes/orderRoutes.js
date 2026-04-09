import express from "express";
const router = express.Router();

import { checkout, getMyOrders } from "../controllers/orderController.js";
import { verifyToken } from "../middlewares/authMiddleware.js";

// Order routes
router.post("/checkout", verifyToken, checkout);
router.get("/my-orders", verifyToken, getMyOrders);

export default router;
