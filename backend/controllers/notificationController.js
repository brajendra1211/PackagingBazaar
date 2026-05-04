import pool from "../config/db.js";

export const getNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const [rows] = await pool.query(
      "SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 50",
      [userId]
    );
    res.json({ success: true, notifications: rows });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const markAsRead = async (req, res) => {
  try {
    const userId = req.user.id;
    const { notificationId } = req.params;

    if (notificationId === "all") {
      await pool.query("UPDATE notifications SET is_read = 1 WHERE user_id = ?", [userId]);
    } else {
      await pool.query("UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?", [
        notificationId,
        userId,
      ]);
    }

    res.json({ success: true, message: "Marked as read" });
  } catch (error) {
    console.error("Error marking notification as read:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getUnreadCount = async (req, res) => {
    try {
      const userId = req.user.id;
      const [rows] = await pool.query(
        "SELECT COUNT(*) as unreadCount FROM notifications WHERE user_id = ? AND is_read = 0",
        [userId]
      );
      res.json({ success: true, unreadCount: rows[0].unreadCount });
    } catch (error) {
      console.error("Error fetching unread count:", error);
      res.status(500).json({ success: false, message: "Server error" });
    }
  };
