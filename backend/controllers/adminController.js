import pool from "../config/db.js";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import fs from "fs";
import path from "path";

// --- SELLER MANAGEMENT ---

// 1. Fetch all pending sellers
export const getPendingSellers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const query = `
      SELECT u.id as user_id, u.name as owner_name, u.email, u.mobile, u.is_verified, 
             COALESCE(s.seller_uid, 'N/A') as seller_uid,
             COALESCE(s.company_name, 'Incomplete Registration') as company_name, 
             COALESCE(s.business_type, 'N/A') as business_type, 
             COALESCE(s.gst_number, 'Not Provided') as gst_number, 
             s.gst_certificate,
             COALESCE(s.city, 'N/A') as city, 
             s.city, 
             s.state, 
             s.pincode,
             s.business_address,
             s.year_established,
             s.description,
             s.created_at,
             s.status
      FROM users u
      LEFT JOIN sellers s ON u.id = s.user_id
      WHERE u.role = 'seller' AND (u.is_verified = 0 OR s.status IN ('pending', 'hold'))
      ORDER BY s.created_at DESC
      LIMIT ? OFFSET ?
    `;
    const [rows] = await pool.query(query, [limit, offset]);
    
    // Total count for pagination
    const [[{ total }]] = await pool.query("SELECT COUNT(*) as total FROM users WHERE role = 'seller' AND is_verified = 0");

    res.status(200).json({ 
      success: true, 
      count: rows.length, 
      totalCount: total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      sellers: rows 
    });
  } catch (error) {
    console.error("Error fetching pending sellers:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// 2. Fetch all active sellers
export const getAllSellers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const query = `
      SELECT u.id as user_id, u.name as owner_name, u.email, u.mobile,
             u.is_verified,                        
             s.seller_uid, s.company_name, s.business_type, s.gst_number, s.gst_certificate,
             s.city, s.state, s.pincode, s.business_address, s.year_established, s.description,
             s.created_at, s.status
      FROM users u
      JOIN sellers s ON u.id = s.user_id
      WHERE u.role = 'seller' AND (u.is_verified = 1 OR s.status IN ('verified', 'approved', 'active'))
      ORDER BY s.created_at DESC
      LIMIT ? OFFSET ?
    `;
    const [rows] = await pool.query(query, [limit, offset]);

    // Total count
    const [[{ total }]] = await pool.query(`
      SELECT COUNT(*) as total FROM users u 
      JOIN sellers s ON u.id = s.user_id 
      WHERE u.role = 'seller' AND (u.is_verified = 1 OR s.status IN ('verified', 'approved', 'active'))
    `);

    res.status(200).json({ 
      success: true, 
      sellers: rows,
      totalCount: total,
      totalPages: Math.ceil(total / limit),
      currentPage: page 
    });
  } catch (error) {
    console.error("Error fetching all sellers:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// 3. Update Seller Status (Pending -> Hold -> Verified)
export const updateSellerStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // 1. Update seller status
    await connection.query("UPDATE sellers SET status = ? WHERE user_id = ?", [status, id]);

    // 2. If status is 'verified', update users table
    if (status === 'verified') {
      await connection.query("UPDATE users SET is_verified = 1 WHERE id = ?", [id]);
    } else {
      await connection.query("UPDATE users SET is_verified = 0 WHERE id = ?", [id]);
    }

    // 3. Fetch seller mobile for WhatsApp redirect
    const [rows] = await connection.query("SELECT mobile FROM users WHERE id = ?", [id]);
    const mobile = rows[0]?.mobile;

    await connection.commit();
    res.status(200).json({ 
      success: true, 
      message: `Seller status updated to ${status}.`,
      mobile: mobile
    });
  } catch (error) {
    await connection.rollback();
    console.error("Error updating seller status:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  } finally {
    connection.release();
  }
};

// 4. Reject Seller / Delete Seller
export const rejectSeller = async (req, res) => {
  const { id } = req.params;
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    await connection.query("DELETE FROM sellers WHERE user_id = ?", [id]);
    const [result] = await connection.query("DELETE FROM users WHERE id = ?", [id]);
    if (result.affectedRows === 0) {
      await connection.rollback();
      return res.status(404).json({ success: false, message: "User not found." });
    }
    await connection.commit();
    res.status(200).json({ success: true, message: "Seller deleted." });
  } catch (error) {
    await connection.rollback();
    res.status(500).json({ success: false, message: "Server Error" });
  } finally {
    connection.release();
  }
};

// --- USER MANAGEMENT ---

// 5. Get All Users
export const getAllUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const role = req.query.role || '';
    const offset = (page - 1) * limit;

    let query = `
      SELECT u.id, u.name, u.email, u.mobile, u.role, u.is_verified, u.created_at,
             s.company_name, s.seller_uid, s.city, s.state, s.business_type
      FROM users u
      LEFT JOIN sellers s ON u.id = s.user_id
      WHERE u.id != ?
    `;
    let countQuery = "SELECT COUNT(*) as total FROM users WHERE id != ?";
    const params = [req.user.id];
    const countParams = [req.user.id];

    if (role) {
      if (role === 'seller') {
        query += " AND u.role = ? AND u.is_verified = 1";
        countQuery += " AND role = ? AND is_verified = 1";
      } else {
        query += " AND u.role = ?";
        countQuery += " AND role = ?";
      }
      params.push(role);
      countParams.push(role);
    }

    query += " ORDER BY u.created_at DESC LIMIT ? OFFSET ?";
    params.push(limit, offset);

    const [rows] = await pool.query(query, params);
    const [[{ total }]] = await pool.query(countQuery, countParams);

    res.status(200).json({ 
      success: true, 
      users: rows,
      totalCount: total,
      totalPages: Math.ceil(total / limit),
      currentPage: page
    });
  } catch (error) {
    console.error("Error in getAllUsers:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// 6. Update User Role/Status
export const updateUser = async (req, res) => {
  const { id } = req.params;
  const { role, is_verified } = req.body;
  try {
    await pool.query("UPDATE users SET role = ?, is_verified = ? WHERE id = ?", [role, is_verified, id]);
    res.status(200).json({ success: true, message: "User updated." });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// 7. Delete User
export const deleteUser = async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM users WHERE id = ?", [id]);
    res.status(200).json({ success: true, message: "User deleted." });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// --- PRODUCT MANAGEMENT ---

// 8. Get All Products for Admin
export const getAllProductsAdmin = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const query = `
      SELECT 
        p.id as product_id, p.name, p.group_key, p.product_code, p.thickness, p.color, p.product_type, p.unit, p.image_url, p.is_hot_deal, p.is_trending,
        COALESCE(sp.price_min, p.min_price) as price_min, 
        COALESCE(sp.price_max, p.max_price) as price_max, 
        COALESCE(sp.moq, ps.min_order) as moq, 
        COALESCE(sp.stock_qty, ps.quantity) as stock_qty,
        s.company_name as seller_name, s.seller_uid,
        c.name as category_name
      FROM products p
      LEFT JOIN seller_products sp ON p.id = sp.product_id AND sp.status = 'active'
      LEFT JOIN sellers s ON p.seller_id = s.id
      LEFT JOIN product_stocks ps ON p.id = ps.product_id
      LEFT JOIN sub_categories sc ON p.sub_category_id = sc.id
      LEFT JOIN categories c ON sc.category_id = c.id
      ORDER BY p.id DESC
      LIMIT ? OFFSET ?
    `;
    const [rows] = await pool.query(query, [limit, offset]);

    const [[{ total }]] = await pool.query("SELECT COUNT(*) as total FROM products");

    res.status(200).json({ 
      success: true, 
      products: rows,
      totalCount: total,
      totalPages: Math.ceil(total / limit),
      currentPage: page
    });
  } catch (error) {
    console.error("getAllProductsAdmin Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// 9. Get Dashboard Summary Stats
export const getDashboardStats = async (req, res) => {
  try {
    const [users] = await pool.query("SELECT COUNT(*) as count FROM users WHERE role = 'user'");
    const [sellers] = await pool.query(`
      SELECT COUNT(*) as count FROM users u 
      JOIN sellers s ON u.id = s.user_id 
      WHERE u.role = 'seller' AND (u.is_verified = 1 OR s.status IN ('verified', 'approved', 'active'))
    `);
    const [pending] = await pool.query("SELECT COUNT(*) as count FROM users WHERE role='seller' AND is_verified=0");
    const [totalProducts] = await pool.query("SELECT COUNT(*) as count FROM products");
    const [uniqueProducts] = await pool.query("SELECT COUNT(DISTINCT group_key) as count FROM products WHERE group_key IS NOT NULL");
    const [orders] = await pool.query("SELECT COUNT(*) as count FROM orders");
    const [inquiries] = await pool.query("SELECT COUNT(*) as count FROM inquiries");
    
    res.status(200).json({
      success: true,
      stats: {
        totalUsers: users[0].count,
        totalSellers: sellers[0].count,
        pendingSellers: pending[0].count,
        totalProducts: totalProducts[0].count,
        uniqueProducts: uniqueProducts[0].count,
        totalOrders: orders[0].count,
        totalInquiries: inquiries[0].count
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// --- SALES MANAGEMENT ---

// 10. Get All Orders for Admin
export const getAllOrdersAdmin = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const query = `
      SELECT o.id, o.user_id, o.total_price, o.status, o.order_date, 
             u.name as customer_name, u.email as customer_email
      FROM orders o
      JOIN users u ON o.user_id = u.id
      ORDER BY o.order_date DESC
      LIMIT ? OFFSET ?
    `;
    const [rows] = await pool.query(query, [limit, offset]);

    const [[{ total }]] = await pool.query("SELECT COUNT(*) as total FROM orders");

    res.status(200).json({ 
      success: true, 
      orders: rows,
      totalCount: total,
      totalPages: Math.ceil(total / limit),
      currentPage: page
    });
  } catch (error) {
    console.error("Error fetching all orders for admin:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// 11. Get Orders for a Specific User (Customer)
export const getUserOrdersAdmin = async (req, res) => {
  try {
    const { userId } = req.params;
    const query = `
      SELECT o.id, o.user_id, o.total_price, o.status, o.order_date, 
             u.name as customer_name, u.email as customer_email
      FROM orders o
      JOIN users u ON o.user_id = u.id
      WHERE o.user_id = ?
      ORDER BY o.order_date DESC
    `;
    const [rows] = await pool.query(query, [userId]);
    res.status(200).json({ success: true, orders: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const getSellerProductsAdmin = async (req, res) => {
  try {
    const { sellerId } = req.params; // Frontend sends user_id
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const query = `
      SELECT p.*, s.company_name as seller_name, s.seller_uid, c.name as category_name
    FROM products p
    JOIN sellers s ON p.seller_id = s.id
      LEFT JOIN sub_categories sc ON p.sub_category_id = sc.id
      LEFT JOIN categories c ON sc.category_id = c.id
      WHERE s.user_id = ?
      ORDER BY p.id DESC
      LIMIT ? OFFSET ?
    `;
    const [rows] = await pool.query(query, [sellerId, limit, offset]);

    const [[{ total }]] = await pool.query("SELECT COUNT(*) as total FROM products p JOIN sellers s ON p.seller_id = s.id WHERE s.user_id = ?", [sellerId]);

    res.status(200).json({ 
      success: true, 
      products: rows,
      totalCount: total,
      totalPages: Math.ceil(total / limit),
      currentPage: page
    });
  } catch (error) {
    console.error("getSellerProductsAdmin Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const getSellerOrdersAdmin = async (req, res) => {
  try {
    const { sellerId } = req.params; // Frontend sends user_id
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const query = `
      SELECT o.id, o.user_id, o.total_price, o.status, o.order_date, 
             u.name as customer_name, u.email as customer_email,
             (SELECT JSON_ARRAYAGG(
                JSON_OBJECT(
                  'name', p.name, 
                  'qty', oi.quantity, 
                  'price', oi.price_at_time,
                  'thickness', oi.thickness,
                  'width', oi.width,
                  'brand', oi.brand
                )
              ) 
              FROM order_items oi 
              JOIN products p ON oi.product_id = p.id 
              WHERE oi.order_id = o.id AND p.seller_id = s.id) as items
      FROM orders o
      JOIN order_items oi ON o.id = oi.order_id
      JOIN products p ON oi.product_id = p.id
      JOIN sellers s ON p.seller_id = s.id
      JOIN users u ON o.user_id = u.id
      WHERE s.user_id = ?
      GROUP BY o.id, s.id, u.name, u.email
      ORDER BY o.order_date DESC
      LIMIT ? OFFSET ?
    `;
    const [rows] = await pool.query(query, [sellerId, limit, offset]);

    const [[{ total }]] = await pool.query(`
      SELECT COUNT(DISTINCT o.id) as total 
      FROM orders o
      JOIN order_items oi ON o.id = oi.order_id
      JOIN products p ON oi.product_id = p.id
      JOIN sellers s ON p.seller_id = s.id
      WHERE s.user_id = ?
    `, [sellerId]);

    res.status(200).json({ 
      success: true, 
      orders: rows,
      totalCount: total,
      totalPages: Math.ceil(total / limit),
      currentPage: page
    });
  } catch (error) {
    console.error("getSellerOrdersAdmin Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// 14. Get Sellers who have received orders (Seller Hub → Seller Orders tab)
export const getSellersWithOrdersAdmin = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const query = `
      SELECT 
        s.user_id,
        s.seller_uid,
        s.company_name,
        s.business_type,
        u.email,
        u.name AS owner_name,
        u.is_verified,
        COUNT(DISTINCT o.id) AS total_orders,
        COALESCE((
          SELECT SUM(o2.total_price)
          FROM orders o2
          JOIN order_items oi2 ON oi2.order_id = o2.id
          JOIN products p2 ON p2.id = oi2.product_id
          WHERE p2.seller_id = s.id
          GROUP BY p2.seller_id
        ), 0) AS total_revenue
      FROM sellers s
      JOIN users u ON s.user_id = u.id
      JOIN products p ON p.seller_id = s.id
      JOIN order_items oi ON oi.product_id = p.id
      JOIN orders o ON o.id = oi.order_id
      GROUP BY s.user_id, s.id, s.seller_uid, s.company_name, s.business_type, u.email, u.name, u.is_verified
      ORDER BY total_orders DESC
      LIMIT ? OFFSET ?
    `;
    const [rows] = await pool.query(query, [limit, offset]);

    const [[{ total }]] = await pool.query(`
      SELECT COUNT(DISTINCT s.user_id) as total
      FROM sellers s
      JOIN products p ON p.seller_id = s.id
      JOIN order_items oi ON oi.product_id = p.id
      JOIN orders o ON o.id = oi.order_id
    `);

    res.status(200).json({ 
      success: true, 
      sellers: rows,
      totalCount: total,
      totalPages: Math.ceil(total / limit),
      currentPage: page
    });
  } catch (error) {
    console.error("getSellersWithOrdersAdmin error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// --- INQUIRY MANAGEMENT (LEADS) ---

// 15. Get All Inquiries for Admin
export const getAllInquiriesAdmin = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const query = `
      SELECT i.*, 
             COALESCE(u.name, i.buyer_name) as buyer_display_name,
             COALESCE(u.mobile, i.phone) as buyer_display_mobile,
             COALESCE(u.email, i.buyer_email) as buyer_display_email,
             p.name as product_name, p.image_url,
             s.company_name as seller_name, s.city as seller_city, s.state as seller_state
      FROM inquiries i
      LEFT JOIN users u ON i.buyer_id = u.id
      JOIN products p ON i.product_id = p.id
      JOIN sellers s ON i.seller_id = s.id
      ORDER BY i.created_at DESC
      LIMIT ? OFFSET ?
    `;
    const [rows] = await pool.query(query, [limit, offset]);

    const [[{ total }]] = await pool.query("SELECT COUNT(*) as total FROM inquiries");

    res.status(200).json({ 
      success: true, 
      inquiries: rows,
      totalCount: total,
      totalPages: Math.ceil(total / limit),
      currentPage: page
    });
  } catch (error) {
    console.error("Error fetching all inquiries for admin:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const updateInquiryStatus = async (req, res) => {
  const { id } = req.params;
  const { status, admin_notes } = req.body;
  try {
    const updateFields = [];
    const updateValues = [];
    
    if (status !== undefined) {
      updateFields.push("status = ?");
      updateValues.push(status);
    }
    
    if (admin_notes !== undefined) {
      updateFields.push("admin_notes = ?");
      updateValues.push(admin_notes);
    }
    
    if (updateFields.length === 0) {
      return res.status(400).json({ success: false, message: "No fields to update." });
    }
    
    updateValues.push(id);
    const query = `UPDATE inquiries SET ${updateFields.join(", ")} WHERE id = ?`;
    
    const [result] = await pool.query(query, updateValues);
    if (result.affectedRows === 0) return res.status(404).json({ success: false, message: "Inquiry not found." });
    
    res.status(200).json({ success: true, message: "Inquiry updated successfully." });
  } catch (error) {
    console.error("Error updating inquiry:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};


// ── CATEGORY & SUBCATEGORY MANAGEMENT ──────────────────────────────────────

export const createCategory = async (req, res) => {
  const { name } = req.body;
  if (!name?.trim()) return res.status(400).json({ success: false, message: "Category name required" });
  try {
    const codePrefix = name.trim().substring(0, 3).toUpperCase();
    const [existing] = await pool.query("SELECT id FROM categories WHERE name = ?", [name.trim()]);
    if (existing.length > 0) return res.status(400).json({ success: false, message: "Category already exists" });
    const [result] = await pool.query("INSERT INTO categories (name, code_prefix) VALUES (?, ?)", [name.trim(), codePrefix]);
    res.status(201).json({ success: true, id: result.insertId, name: name.trim(), code_prefix: codePrefix });
  } catch (err) {
    console.error("createCategory error:", err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const deleteCategory = async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM sub_categories WHERE category_id = ?", [id]);
    await pool.query("DELETE FROM categories WHERE id = ?", [id]);
    res.json({ success: true, message: "Category deleted" });
  } catch (err) {
    console.error("deleteCategory error:", err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const createSubCategory = async (req, res) => {
  const { name, category_id } = req.body;
  if (!name?.trim() || !category_id) return res.status(400).json({ success: false, message: "Name and category required" });
  try {
    const [existing] = await pool.query("SELECT id FROM sub_categories WHERE name = ? AND category_id = ?", [name.trim(), category_id]);
    if (existing.length > 0) return res.status(400).json({ success: false, message: "Subcategory already exists in this category" });
    const [result] = await pool.query("INSERT INTO sub_categories (name, category_id) VALUES (?, ?)", [name.trim(), category_id]);
    res.status(201).json({ success: true, id: result.insertId, name: name.trim(), category_id });
  } catch (err) {
    console.error("createSubCategory error:", err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const deleteSubCategory = async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM sub_categories WHERE id = ?", [id]);
    res.json({ success: true, message: "Subcategory deleted" });
  } catch (err) {
    console.error("deleteSubCategory error:", err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
// 16. Toggle Product Hot Deal Status
export const toggleHotDeal = async (req, res) => {
  const { id } = req.params;
  const { is_hot_deal } = req.body;
  try {
    const [result] = await pool.query("UPDATE products SET is_hot_deal = ? WHERE id = ?", [is_hot_deal ? 1 : 0, id]);
    if (result.affectedRows === 0) return res.status(404).json({ success: false, message: "Product not found." });
    res.status(200).json({ success: true, message: `Product ${is_hot_deal ? 'added to' : 'removed from'} Hot Deals.` });
  } catch (error) {
    console.error("Error toggling hot deal:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const toggleTrending = async (req, res) => {
  const { id } = req.params;
  const { is_trending } = req.body;
  try {
    const [result] = await pool.query("UPDATE products SET is_trending = ? WHERE id = ?", [is_trending ? 1 : 0, id]);
    if (result.affectedRows === 0) return res.status(404).json({ success: false, message: "Product not found." });
    res.status(200).json({ success: true, message: `Product ${is_trending ? 'marked as' : 'removed from'} Trending.` });
  } catch (error) {
    console.error("Error toggling trending:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// 17. Get Recommended Sellers for a lead (Phase 2 - Smart Matching)
export const getRecommendedSellers = async (req, res) => {
  try {
    const { id } = req.params;
    
    // 1. Get lead details
    const [leadRows] = await pool.query(
      "SELECT i.*, p.sub_category_id FROM inquiries i JOIN products p ON i.product_id = p.id WHERE i.id = ?",
      [id]
    );

    if (leadRows.length === 0) {
      return res.status(404).json({ success: false, message: "Lead not found" });
    }

    const lead = leadRows[0];
    
    // Helper function to extract number from string (e.g., "500 kg" -> 500)
    const parseQty = (str) => {
      if (!str) return 0;
      const match = str.match(/(\d+)/);
      return match ? parseInt(match[1]) : 0;
    };

    const leadQty = parseQty(lead.quantity_required);
    const leadThickness = lead.thickness ? lead.thickness.toLowerCase() : null;
    const leadWidth = lead.width ? lead.width.toLowerCase() : null;

    // 2. Fetch all verified sellers with smart matching logic
    // Scoring logic (Phase 2):
    // - Location: Pincode (200), City (100), State (50)
    // - Sub-Category Match (30)
    // - Stock Sufficient (+50)
    // - MOQ Fits (+40)
    // - Thickness Match (+30)
    // - Width Match (+20)
    
    const query = `
      SELECT s.*, u.email, u.mobile as phone, u.name as owner_name,
      (
        -- Location Scores
        CASE 
          WHEN s.pincode = ? THEN 200
          WHEN LOWER(s.city) = LOWER(?) OR LOWER(?) LIKE CONCAT('%', LOWER(s.city), '%') THEN 100 
          WHEN LOWER(s.state) = LOWER(?) OR LOWER(?) LIKE CONCAT('%', LOWER(s.state), '%') THEN 50 
          ELSE 0 
        END + 
        -- Sub-Category Match
        CASE WHEN EXISTS (SELECT 1 FROM products p2 WHERE p2.seller_id = s.id AND p2.sub_category_id = ?) THEN 30 ELSE 0 END +
        -- Smart Matching Scores (from seller_products)
        COALESCE((
          SELECT MAX(
            CASE WHEN sp.stock_qty >= ? THEN 70 ELSE 0 END +
            CASE WHEN sp.moq <= ? THEN 50 ELSE 0 END +
            CASE WHEN LOWER(sp.width) = LOWER(?) THEN 30 ELSE 0 END +
            -- Price Match (Below Average = points)
            CASE WHEN sp.price_min <= (SELECT COALESCE(AVG(price_min), sp.price_min) FROM seller_products WHERE product_id = sp.product_id) THEN 40 ELSE 0 END +
            -- Thickness Match
            CASE WHEN EXISTS (SELECT 1 FROM products p3 WHERE p3.id = sp.product_id AND LOWER(p3.thickness) = LOWER(?)) THEN 50 ELSE 0 END
          )
          FROM seller_products sp
          WHERE sp.seller_id = s.id AND sp.status = 'active'
        ), 0)
      ) as match_score,
      -- Fetch match breakdown for UI
      (s.pincode = ?) as pincode_match,
      EXISTS (SELECT 1 FROM seller_products sp2 WHERE sp2.seller_id = s.id AND sp2.stock_qty >= ? ) as has_stock,
      EXISTS (SELECT 1 FROM seller_products sp3 WHERE sp3.seller_id = s.id AND sp3.moq <= ? ) as moq_fit,
      EXISTS (SELECT 1 FROM seller_products sp4 WHERE sp4.seller_id = s.id AND sp4.price_min <= (SELECT COALESCE(AVG(price_min), sp4.price_min) FROM seller_products WHERE product_id = sp4.product_id) ) as price_match
      FROM sellers s
      JOIN users u ON s.user_id = u.id
      WHERE u.role = 'seller' AND u.is_verified = 1
      ORDER BY match_score DESC, s.company_name ASC
    `;

    const [sellers] = await pool.query(query, [
      lead.pincode,
      lead.city, lead.address, 
      lead.state, lead.address, 
      lead.sub_category_id,
      leadQty, // for stock score
      leadQty, // for moq score
      leadWidth,
      leadThickness,
      lead.pincode, // pincode_match
      leadQty, // for breakdown has_stock
      leadQty, // for breakdown moq_fit
      // price_match subquery uses its own logic
    ]);

    res.status(200).json({ 
      success: true, 
      recommendations: sellers,
      leadLocation: { city: lead.city, state: lead.state },
      leadRequirements: { qty: leadQty, thickness: leadThickness, width: leadWidth }
    });
  } catch (error) {
    console.error("Error in getRecommendedSellers:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// 18. Add product for a seller (Admin - Phase 2 Dual Insert)
// Helper for dynamic entity resolution (Category, SubCategory, Tag)
const resolveEntityId = async (connection, table, nameField, value, parentField = null, parentValue = null) => {
  if (!value) return null;
  
  // Check if value is an existing ID (numeric)
  const isId = !isNaN(value) && value !== "";
  if (isId) {
    const [exists] = await connection.query(`SELECT id FROM ${table} WHERE id = ?`, [value]);
    if (exists.length > 0) return value;
  }

  // Search by name
  let sql = `SELECT id FROM ${table} WHERE ${nameField} = ?`;
  let params = [value];
  if (parentField && parentValue) {
    sql += ` AND ${parentField} = ?`;
    params.push(parentValue);
  }

  const [rows] = await connection.query(sql, params);
  if (rows.length > 0) return rows[0].id;

  // Create new record
  let insertSql, insertParams;
  if (table === 'categories') {
    const codePrefix = value.substring(0, 3).toUpperCase();
    insertSql = `INSERT INTO categories (name, code_prefix) VALUES (?, ?)`;
    insertParams = [value, codePrefix];
  } else if (parentField && parentValue) {
    insertSql = `INSERT INTO ${table} (${nameField}, ${parentField}) VALUES (?, ?)`;
    insertParams = [value, parentValue];
  } else {
    insertSql = `INSERT INTO ${table} (${nameField}) VALUES (?)`;
    insertParams = [value];
  }

  const [result] = await connection.query(insertSql, insertParams);
  return result.insertId;
};

// 18. Add product for a seller (Admin - Phase 2 Dual Insert)
export const addProductForSeller = async (req, res) => {
  const { sellerUserId } = req.params;
  const { 
    name, display_name, product_group_id, category, subcategory, tag, thickness, width, 
    minPrice, maxPrice, unit, description, img, stock, minOrder, applications,
    delivery_days, payment_terms, color, productType, productCode
  } = req.body;

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // 1. Get seller_id from user_id
    const [sellerRows] = await connection.query(
      "SELECT id FROM sellers WHERE user_id = ?",
      [sellerUserId]
    );

    if (sellerRows.length === 0) {
      await connection.rollback();
      return res.status(404).json({ success: false, message: "Seller profile not found" });
    }

    const sellerId = sellerRows[0].id;

    // 2. Resolve Category, SubCategory, and Tag (Dynamic Creation if needed)
    const resolvedCategoryId = await resolveEntityId(connection, 'categories', 'name', category);
    const subCategoryId = await resolveEntityId(connection, 'sub_categories', 'name', subcategory, 'category_id', resolvedCategoryId);
    const resolvedTagId = await resolveEntityId(connection, 'tags', 'tag_name', tag);

    if (!subCategoryId) {
      await connection.rollback();
      return res.status(400).json({ success: false, message: "Could not resolve or create category/subcategory" });
    }

    const [catRows] = await connection.query("SELECT code_prefix FROM categories WHERE id = ?", [resolvedCategoryId]);
    const catPrefix = catRows[0]?.code_prefix || "PRD";

    // --- AUTO GEN group_key if missing (Matches Excel Pattern: CAT_COLOR_THICK_TYPE) ---
    let finalGroupKey = req.body.group_key;
    if (!finalGroupKey) {
      const catPart = category ? category.toString().toUpperCase().replace(/\s+/g, '_') : 'PRD';
      const colorPart = color ? color.toString().toUpperCase().replace(/\s+/g, '_') : 'NA';
      const thickPart = (thickness || "X").toString().replace(/\s+/g, '');
      const typePart = (productType || color || "NA").toString().substring(0, 3).toUpperCase();
      finalGroupKey = `${catPart}_${colorPart}_${thickPart}_${typePart}`;
    }

    // 3. Create new Master Product (Always create new for unique specs/images)
    console.log(`🚀 Creating New Product Record for Seller: ${sellerId}`);
    const [productResult] = await connection.query(
      `INSERT INTO products 
       (product_group_id, sub_category_id, tag_id, seller_id, name, display_name, group_key, product_code, thickness, width, color, product_type, unit, description, image_url, applications) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        product_group_id || null, subCategoryId, resolvedTagId || null, sellerId, name, display_name, finalGroupKey, productCode, thickness, width, color, productType,
        unit || 'kg', description, img, JSON.stringify(applications || [])
      ]
    );
    let productId = productResult.insertId;

    // 4. Insert into seller_products (Seller Listing)
    await connection.query(
      `INSERT INTO seller_products 
       (product_id, seller_id, price_min, price_max, moq, stock_qty, stock, width, delivery_days, payment_terms) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE 
       price_min = VALUES(price_min), price_max = VALUES(price_max), moq = VALUES(moq), 
       stock_qty = VALUES(stock_qty), stock = VALUES(stock), delivery_days = VALUES(delivery_days)`,
      [
        productId, sellerId, minPrice, maxPrice, minOrder || 100, stock || 0,
        (stock > 0 ? 'Available' : 'Out of Stock'), width, delivery_days || 48, payment_terms
      ]
    );

    // 5. Keep product_stocks in sync for legacy compatibility (Optional)
    await connection.query(
      `INSERT INTO product_stocks (product_id, quantity, min_order) 
       VALUES (?, ?, ?) 
       ON DUPLICATE KEY UPDATE quantity = VALUES(quantity), min_order = VALUES(min_order)`,
      [productId, stock, minOrder]
    );

    await connection.commit();

    res.status(201).json({
      success: true,
      message: "Product added to Seller successfully",
      productId: productId
    });
  } catch (error) {
    if (connection) await connection.rollback();
    console.error("Error in addProductForSeller:", error);
    res.status(500).json({ success: false, message: "Server Error", error: error.message });
  } finally {
    if (connection) connection.release();
  }
};

export const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }

    const imageUrl = `/uploads/product_images/${req.file.filename}`;
    
    res.status(200).json({
      success: true,
      message: "Image uploaded successfully",
      imageUrl: imageUrl
    });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ success: false, message: "Failed to upload image" });
  }
};

// 20. Add Seller by Admin (Auto-Verified)
export const addSellerAdmin = async (req, res) => {
  const { 
    ownerName, email, password, mobile, companyName, businessType,
    gstNumber, city, state, pincode, businessAddress, yearEstablished, description
  } = req.body;

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // 1. Validation
    if (!ownerName || !email || !password || !companyName) {
      return res.status(400).json({ success: false, message: "Missing required fields." });
    }

    // 2. Check if user already exists
    const [existing] = await connection.query("SELECT id FROM users WHERE email = ?", [email]);
    if (existing.length > 0) {
      await connection.rollback();
      return res.status(400).json({ success: false, message: "Email already registered." });
    }

    // 3. Create User (Verified)
    const hashedPassword = await bcrypt.hash(password, 10);
    const [userResult] = await connection.query(
      "INSERT INTO users (name, email, mobile, password, role, is_verified) VALUES (?, ?, ?, ?, 'seller', 1)",
      [ownerName, email, mobile, hashedPassword]
    );
    const userId = userResult.insertId;

    // 4. Create Seller Profile
    const sellerUID = `PB-S-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
    const gstCertificate = req.file ? `/uploads/gst_certificates/${req.file.filename}` : null;
    
    // Handle businessType if it's an array
    const businessTypeString = Array.isArray(businessType) 
      ? businessType.join(", ") 
      : (typeof businessType === 'string' && businessType.startsWith('[') 
          ? JSON.parse(businessType).join(", ") 
          : businessType);

    await connection.query(
      `INSERT INTO sellers 
      (user_id, mobile, status, seller_uid, company_name, business_type, gst_number, gst_certificate, city, state, pincode, business_address, year_established, description, is_verified) 
      VALUES (?, ?, 'verified', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
      [userId, mobile, sellerUID, companyName, businessTypeString, gstNumber, gstCertificate, city, state, pincode, businessAddress, yearEstablished || null, description || null]
    );

    await connection.commit();
    res.status(201).json({ 
      success: true, 
      message: "Seller account created and verified successfully!",
      sellerUID
    });
  } catch (error) {
    if (connection) await connection.rollback();
    console.error("Error in addSellerAdmin:", error);
    res.status(500).json({ success: false, message: "Server Error", error: error.message });
  } finally {
    if (connection) connection.release();
  }
};

// 21. Update Seller Details by Admin
export const updateSellerDetailsAdmin = async (req, res) => {
  const { id } = req.params; // Expecting seller user_id
  const { 
    ownerName, email, mobile, companyName, businessType,
    gstNumber, city, state, pincode, businessAddress, yearEstablished, description
  } = req.body;

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // 1. Update User Table
    if (ownerName || email || mobile) {
      await connection.query(
        "UPDATE users SET name = ?, email = ?, mobile = ? WHERE id = ?",
        [ownerName, email, mobile, id]
      );
    }

    // 2. Handle GST Certificate if uploaded
    let gstCertificate = req.body.existingGstCertificate || null;
    if (req.file) {
      // NEW: Delete old file if it exists and a new one is uploaded
      if (req.body.existingGstCertificate) {
        try {
          const oldPath = path.join(process.cwd(), req.body.existingGstCertificate);
          if (fs.existsSync(oldPath)) {
            fs.unlinkSync(oldPath);
          }
        } catch (fsErr) {
          console.error("Failed to delete old GST certificate:", fsErr);
          // We continue anyway so the update isn't blocked by a file system error
        }
      }
      gstCertificate = `/uploads/gst_certificates/${req.file.filename}`;
    }

    // 3. Update Seller Table
    await connection.query(
      `UPDATE sellers SET 
        company_name = ?, 
        business_type = ?, 
        gst_number = ?, 
        gst_certificate = ?,
        city = ?, 
        state = ?, 
        pincode = ?, 
        business_address = ?,
        mobile = ?,
        year_established = ?,
        description = ?
      WHERE user_id = ?`,
      [companyName, businessType, gstNumber, gstCertificate, city, state, pincode, businessAddress, mobile, yearEstablished || null, description || null, id]
    );

    await connection.commit();
    res.status(200).json({ success: true, message: "Seller details updated successfully!" });
  } catch (error) {
    if (connection) await connection.rollback();
    console.error("Error in updateSellerDetailsAdmin:", error);
    res.status(500).json({ success: false, message: "Server Error", error: error.message });
  } finally {
    if (connection) connection.release();
  }
};

