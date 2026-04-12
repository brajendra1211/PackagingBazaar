import express from "express";
const router = express.Router();

import {
  getAllProducts,
  getProductById,
  getProductVariants,
  getTopSellingProducts,
  addProduct,
  updateProduct,
  deleteProduct,
  getCategories,
  getHotDeals,
  getUniqueProductNames
} from "../controllers/productController.js";
import { verifyToken, isSeller } from "../middlewares/authMiddleware.js";

router.get("/categories", getCategories);
router.get("/products", getAllProducts);
router.get("/products/top-selling", getTopSellingProducts);
router.get("/products/hot-deals", getHotDeals);
router.get("/products/names", getUniqueProductNames);
router.get("/products/:id", getProductById);
router.get("/products/:id/variants", getProductVariants);

// Protected Routes (Seller & Admin)
router.post("/products/add", verifyToken, isSeller, addProduct);
router.put("/products/update/:id", verifyToken, isSeller, updateProduct);
router.delete("/products/delete/:id", verifyToken, isSeller, deleteProduct);

export default router;
