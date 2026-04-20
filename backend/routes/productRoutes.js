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
  getSubCategories,
  getTags,
  getApplications,
  getHotDeals,
  getUniqueProductNames,
  getSellersByGroupKey,
  getProductGroups,
  createProductGroup
} from "../controllers/productController.js";
import { verifyToken, isSeller, isAdmin } from "../middlewares/authMiddleware.js";

router.get("/categories", getCategories);
router.get("/sub-categories", getSubCategories);
router.get("/tags", getTags);
router.get("/applications", getApplications);
router.get("/product-groups", getProductGroups);
router.post("/product-groups", verifyToken, isAdmin, createProductGroup);
router.get("/products", getAllProducts);
router.get("/products/top-selling", getTopSellingProducts);
router.get("/products/hot-deals", getHotDeals);
router.get("/products/names", getUniqueProductNames);
router.get("/products/:id", getProductById);
router.get("/products/:id/variants", getProductVariants);
router.get("/products/group/:groupKey/sellers", getSellersByGroupKey);

// Protected Routes (Seller & Admin)
router.post("/products/add", verifyToken, isSeller, addProduct);
router.put("/products/update/:id", verifyToken, isSeller, updateProduct);
router.delete("/products/delete/:id", verifyToken, isSeller, deleteProduct);

export default router;
