import express from "express";
import { verifyToken } from "../middlewares/authMiddleware.js";
import { getNotifications, markAsRead, getUnreadCount } from "../controllers/notificationController.js";

const router = express.Router();

router.get("/", verifyToken, getNotifications);
router.get("/unread-count", verifyToken, getUnreadCount);
router.put("/mark-as-read/:notificationId", verifyToken, markAsRead);

export default router;
