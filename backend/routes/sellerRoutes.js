import express from "express";
const router = express.Router();

import { getSellerProfile, getSellerProducts, createProduct, updateProduct, updateSellerProfile, getSellerOrders } from "../controllers/sellerController.js";
import { verifyToken, isSeller } from "../middlewares/authMiddleware.js";

// All routes require authentication and seller role
router.get("/me", verifyToken, isSeller, getSellerProfile);
router.get("/products", verifyToken, isSeller, getSellerProducts);
router.get("/orders", verifyToken, isSeller, getSellerOrders); // Added this
router.post("/products", verifyToken, isSeller, createProduct);
router.put("/products/:id", verifyToken, isSeller, updateProduct);
router.put("/profile", verifyToken, isSeller, updateSellerProfile);

export default router;
