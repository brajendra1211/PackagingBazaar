import pool from "../config/db.js";

// --- SELLER MANAGEMENT ---

// 1. Fetch all pending sellers
export const getPendingSellers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const query = `
      SELECT u.id as user_id, u.name as owner_name, u.email, u.is_verified, 
             COALESCE(s.seller_uid, 'N/A') as seller_uid,
             COALESCE(s.company_name, 'Incomplete Registration') as company_name, 
             COALESCE(s.business_type, 'N/A') as business_type, 
             COALESCE(s.gst_number, 'Not Provided') as gst_number, 
             s.gst_certificate,
             COALESCE(s.city, 'N/A') as city, 
             COALESCE(s.state, 'N/A') as state, 
             s.created_at
      FROM users u
      LEFT JOIN sellers s ON u.id = s.user_id
      WHERE u.role = 'seller' AND u.is_verified = 0
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
      SELECT u.id as user_id, u.name as owner_name, u.email, 
             u.is_verified,                        
             s.seller_uid, s.company_name, s.business_type, s.gst_number, s.gst_certificate,
             s.city, s.state, s.created_at
      FROM users u
      JOIN sellers s ON u.id = s.user_id
      WHERE u.role = 'seller' AND u.is_verified = 1
      ORDER BY s.created_at DESC
      LIMIT ? OFFSET ?
    `;
    const [rows] = await pool.query(query, [limit, offset]);

    // Total count
    const [[{ total }]] = await pool.query(`
      SELECT COUNT(*) as total FROM users u 
      JOIN sellers s ON u.id = s.user_id 
      WHERE u.role = 'seller' AND u.is_verified = 1
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

// 3. Approve Seller
export const approveSeller = async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await pool.query("UPDATE users SET is_verified = 1 WHERE id = ?", [id]);
    if (result.affectedRows === 0) return res.status(404).json({ success: false, message: "User not found." });
    res.status(200).json({ success: true, message: "Seller approved." });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
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
    const offset = (page - 1) * limit;

    const [rows] = await pool.query(
      "SELECT id, name, email, role, is_verified, created_at FROM users WHERE id != ? ORDER BY created_at DESC LIMIT ? OFFSET ?", 
      [req.user.id, limit, offset]
    );

    const [[{ total }]] = await pool.query("SELECT COUNT(*) as total FROM users WHERE id != ?", [req.user.id]);

    res.status(200).json({ 
      success: true, 
      users: rows,
      totalCount: total,
      totalPages: Math.ceil(total / limit),
      currentPage: page
    });
  } catch (error) {
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
      SELECT p.*, s.company_name as seller_name, s.seller_uid, c.name as category_name
      FROM products p
      LEFT JOIN sellers s ON p.seller_id = s.id
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
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// 9. Get Dashboard Summary Stats
export const getDashboardStats = async (req, res) => {
  try {
    const [users] = await pool.query("SELECT COUNT(*) as count FROM users");
    const [sellers] = await pool.query("SELECT COUNT(*) as count FROM sellers");
    const [pending] = await pool.query("SELECT COUNT(*) as count FROM users WHERE role='seller' AND is_verified=0");
    const [products] = await pool.query("SELECT COUNT(*) as count FROM products");
    const [orders] = await pool.query("SELECT COUNT(*) as count FROM orders");
    const [inquiries] = await pool.query("SELECT COUNT(*) as count FROM inquiries");
    
    res.status(200).json({
      success: true,
      stats: {
        totalUsers: users[0].count,
        totalSellers: sellers[0].count,
        pendingSellers: pending[0].count,
        totalProducts: products[0].count,
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
