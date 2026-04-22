import express from "express";
import { 
  getPendingSellers, rejectSeller, 
  getAllSellers, getAllUsers, updateUser, deleteUser,
  getAllProductsAdmin, getDashboardStats, getAllOrdersAdmin,
  getUserOrdersAdmin, getSellerOrdersAdmin, getSellerProductsAdmin,
  getSellersWithOrdersAdmin, getAllInquiriesAdmin, updateInquiryStatus, toggleHotDeal, toggleTrending,
  getRecommendedSellers, addProductForSeller, uploadImage, updateSellerStatus,
  addSellerAdmin, updateSellerDetailsAdmin,
  createCategory, deleteCategory, createSubCategory, deleteSubCategory
} from "../controllers/adminController.js";
import { deleteProduct } from "../controllers/productController.js";
import { verifyToken, isAdmin } from "../middlewares/authMiddleware.js";
import upload from "../middlewares/uploadMiddleware.js";

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
router.put("/sellers/:id/status", verifyToken, isAdmin, updateSellerStatus);
router.put("/sellers/:id", verifyToken, isAdmin, upload.single('gst_certificate'), updateSellerDetailsAdmin);
router.post("/sellers/add", verifyToken, isAdmin, upload.single('gst_certificate'), addSellerAdmin);
router.delete("/sellers/:id/reject", verifyToken, isAdmin, rejectSeller);

// --- Product Management ---
router.get("/products/all", verifyToken, isAdmin, getAllProductsAdmin);
router.get("/products/seller/:sellerId", verifyToken, isAdmin, getSellerProductsAdmin);
router.patch("/products/:id/hot-deal", verifyToken, isAdmin, toggleHotDeal);
router.patch("/products/:id/trending", verifyToken, isAdmin, toggleTrending);
router.post("/products/seller/:sellerUserId", verifyToken, isAdmin, addProductForSeller);
router.post('/upload-image', verifyToken, isAdmin, upload.single('product_image'), uploadImage);
router.delete("/products/:id", verifyToken, isAdmin, deleteProduct);

// --- Sales Management ---
router.get("/orders", verifyToken, isAdmin, getAllOrdersAdmin);
router.get("/orders/user/:userId", verifyToken, isAdmin, getUserOrdersAdmin);
router.get("/orders/seller/:sellerId", verifyToken, isAdmin, getSellerOrdersAdmin);

// --- Inquiry Management ---
router.get("/inquiries", verifyToken, isAdmin, getAllInquiriesAdmin);
router.patch("/inquiries/:id", verifyToken, isAdmin, updateInquiryStatus);
router.get("/inquiries/:id/recommendations", verifyToken, isAdmin, getRecommendedSellers);

// --- Category & SubCategory Management ---
router.post("/categories", verifyToken, isAdmin, createCategory);
router.delete("/categories/:id", verifyToken, isAdmin, deleteCategory);
router.post("/subcategories", verifyToken, isAdmin, createSubCategory);
router.delete("/subcategories/:id", verifyToken, isAdmin, deleteSubCategory);

export default router;
