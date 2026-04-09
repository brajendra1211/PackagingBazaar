import express from "express";
import { 
  getPendingSellers, approveSeller, rejectSeller, 
  getAllSellers, getAllUsers, updateUser, deleteUser,
  getAllProductsAdmin, getDashboardStats, getAllOrdersAdmin,
  getUserOrdersAdmin, getSellerOrdersAdmin, getSellerProductsAdmin,
  getSellersWithOrdersAdmin
} from "../controllers/adminController.js";
import { deleteProduct } from "../controllers/productController.js";
import { verifyToken, isAdmin } from "../middlewares/authMiddleware.js";

const router = express.Router();

// --- Dashboard Summary ---
router.get("/stats", verifyToken, isAdmin, getDashboardStats);

// --- User Management ---
router.get("/users", verifyToken, isAdmin, getAllUsers);
router.put("/users/:id", verifyToken, isAdmin, updateUser);
router.delete("/users/:id", verifyToken, isAdmin, deleteUser);

// --- Seller Management ---
router.get("/sellers/all", verifyToken, isAdmin, getAllSellers);
router.get("/sellers/pending", verifyToken, isAdmin, getPendingSellers);
router.get("/sellers/with-orders", verifyToken, isAdmin, getSellersWithOrdersAdmin);
router.put("/sellers/:id/approve", verifyToken, isAdmin, approveSeller);
router.delete("/sellers/:id/reject", verifyToken, isAdmin, rejectSeller);

// --- Product Management ---
router.get("/products/all", verifyToken, isAdmin, getAllProductsAdmin);
router.get("/products/seller/:sellerId", verifyToken, isAdmin, getSellerProductsAdmin);
router.delete("/products/:id", verifyToken, isAdmin, deleteProduct);

// --- Sales Management ---
router.get("/orders", verifyToken, isAdmin, getAllOrdersAdmin);
router.get("/orders/user/:userId", verifyToken, isAdmin, getUserOrdersAdmin);
router.get("/orders/seller/:sellerId", verifyToken, isAdmin, getSellerOrdersAdmin);

export default router;
