import pool from "../config/db.js";

// Fetch Categories
// 10. Get Product Groups (for variant grouping)
export const getProductGroups = async (req, res) => {
  try {
    const { categoryId } = req.query;
    let query = `
      SELECT pg.*, c.name as category_name, c.code_prefix
      FROM product_groups pg
      JOIN categories c ON pg.category_id = c.id
    `;
    const params = [];

    if (categoryId) {
      query += " WHERE pg.category_id = ?";
      params.push(categoryId);
    }

    query += " ORDER BY pg.name ASC";
    const [rows] = await pool.query(query, params);
    res.status(200).json({ success: true, data: rows });
  } catch (error) {
    console.error("Error in getProductGroups:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// 11. Create Product Group (Admin)
export const createProductGroup = async (req, res) => {
  try {
    const { name, categoryId, description } = req.body;

    if (!name || !categoryId) {
      return res.status(400).json({ success: false, message: "Name and Category are required" });
    }

    // 1. Get category prefix
    const [catRows] = await pool.query("SELECT code_prefix FROM categories WHERE id = ?", [categoryId]);
    if (catRows.length === 0) return res.status(404).json({ success: false, message: "Category not found" });
    const prefix = catRows[0].code_prefix || "GRP";

    // 2. Count existing groups for fallback
    const [[{ count }]] = await pool.query("SELECT COUNT(*) as count FROM product_groups WHERE category_id = ?", [categoryId]);
    const finalMasterId = req.body.masterId || `GP-${prefix}-${count + 1}`;

    const [result] = await pool.query(
      "INSERT INTO product_groups (category_id, master_id, name, description) VALUES (?, ?, ?, ?)",
      [categoryId, finalMasterId, name, description]
    );

    res.status(201).json({
      success: true,
      message: "Product Group created!",
      groupId: result.insertId,
      masterId: finalMasterId
    });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
       return res.status(400).json({ success: false, message: "A group with this name or ID already exists" });
    }
    console.error("Error creating product group:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const getCategories = async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT id, name FROM categories ORDER BY name ASC");
    res.status(200).json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// Fetch SubCategories (Optionally filtered by category)
export const getSubCategories = async (req, res) => {
  const { categoryId } = req.query;
  try {
    let query = "SELECT id, category_id, name FROM sub_categories";
    const params = [];
    if (categoryId) {
      query += " WHERE category_id = ?";
      params.push(categoryId);
    }
    query += " ORDER BY name ASC";
    const [rows] = await pool.query(query, params);
    res.status(200).json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// Fetch Tags
export const getTags = async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT id, tag_name FROM tags ORDER BY tag_name ASC");
    res.status(200).json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// Fetch Applications
export const getApplications = async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT id, app_name FROM applications ORDER BY app_name ASC");
    res.status(200).json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// 1. Get All Products (With Filters & Pagination)
export const getAllProducts = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 8,
      category = "All",
      sort = "default",
      search = "",
      tag = "",
      city = "",
    } = req.query;

    const offset = (page - 1) * limit;
    const queryParams = [];

    // Base WHERE clause
    let whereClause = " WHERE 1=1";

    if (category !== "All") {
      whereClause += ` AND c.name = ?`;
      queryParams.push(category);
    }

    if (search) {
      whereClause += ` AND p.name LIKE ?`;
      queryParams.push(`%${search}%`);
    }

    // Tag Filter logic
    if (tag && tag.toLowerCase() !== "none") {
      whereClause += ` AND t.tag_name = ?`;
      queryParams.push(tag.toLowerCase());
    }

    if (city && city.toLowerCase() !== "all") {
      whereClause += ` AND s.city = ?`;
      queryParams.push(city);
    }

    // Main Data Query
    let dataQuery = `
      SELECT p.*, t.tag_name, sc.name as subcategory_name, c.name as category_name,
             ps.quantity as stock, ps.min_order, s.seller_uid, s.company_name as seller_name,
             s.city, s.state,
             (SELECT AVG(rating) FROM product_reviews WHERE product_id = p.id) as avg_rating,
             (SELECT COUNT(*) FROM product_reviews WHERE product_id = p.id) as review_count
      FROM products p
      LEFT JOIN tags t ON p.tag_id = t.id
      LEFT JOIN sub_categories sc ON p.sub_category_id = sc.id
      LEFT JOIN categories c ON sc.category_id = c.id
      LEFT JOIN product_stocks ps ON p.id = ps.product_id
      LEFT JOIN sellers s ON p.seller_id = s.id
      ${whereClause}
    `;

    // Sorting
    if (sort === "price_low") dataQuery += ` ORDER BY p.min_price ASC`;
    else if (sort === "price_high") dataQuery += ` ORDER BY p.min_price DESC`;
    else if (sort === "highest_rated") dataQuery += ` ORDER BY avg_rating DESC`;
    else dataQuery += ` ORDER BY p.id ASC`;

    // Pagination
    dataQuery += ` LIMIT ? OFFSET ?`;

    // Count Query - same JOIN chain as dataQuery to correctly filter by category
    const countQuery = `
      SELECT COUNT(DISTINCT p.id) as total 
      FROM products p
      LEFT JOIN tags t ON p.tag_id = t.id
      LEFT JOIN sub_categories sc ON p.sub_category_id = sc.id
      LEFT JOIN categories c ON sc.category_id = c.id
      LEFT JOIN sellers s ON p.seller_id = s.id
      ${whereClause}
    `;

    // Execute queries
    const [rows] = await pool.query(dataQuery, [
      ...queryParams,
      parseInt(limit),
      parseInt(offset),
    ]);
    const [countRows] = await pool.query(countQuery, queryParams);

    const totalProducts = countRows[0].total;

    res.status(200).json({
      success: true,
      totalProducts,
      totalPages: Math.ceil(totalProducts / limit),
      currentPage: parseInt(page),
      data: rows,
    });
  } catch (error) {
    console.error("Error in getAllProducts:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// 2. Get Single Product by ID (Corrected Export)
export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    // controllers/productController.js me sirf query wali string badal lo
    const query = `
  SELECT p.*, t.tag_name, sc.name as subcategory_name, c.name as category_name,
         ps.quantity as stock, ps.min_order, s.seller_uid, s.company_name as seller_name,
         (SELECT AVG(rating) FROM product_reviews WHERE product_id = p.id) as avg_rating,
         (SELECT COUNT(*) FROM product_reviews WHERE product_id = p.id) as review_count,
         COALESCE(GROUP_CONCAT(a.app_name), '') as applications  -- Safe check
  FROM products p
  LEFT JOIN tags t ON p.tag_id = t.id
  LEFT JOIN sub_categories sc ON p.sub_category_id = sc.id
  LEFT JOIN categories c ON sc.category_id = c.id
  LEFT JOIN product_stocks ps ON p.id = ps.product_id
  LEFT JOIN product_application_mapping pam ON p.id = pam.product_id
  LEFT JOIN applications a ON pam.app_id = a.id
  LEFT JOIN sellers s ON p.seller_id = s.id
  WHERE p.id = ?
  GROUP BY p.id
`;

    const [rows] = await pool.query(query, [id]);

    if (rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    const product = rows[0];
    product.applications = product.applications
      ? product.applications.split(",")
      : [];

    res.status(200).json({ success: true, data: product });
  } catch (error) {
    console.error("Error in getProductById:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// 2. Fetch Sibling Variants (Used in Product Detail Page)
export const getProductVariants = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get subcategory of current product
    const [[current]] = await pool.query("SELECT sub_category_id FROM products WHERE id = ?", [id]);
    
    if (!current) return res.status(404).json({ success: false, message: "Product not found" });

    // Fetch other products in same subcategory
    const [variants] = await pool.query(
      `SELECT id, name, thickness, width, min_price, max_price, image_url 
       FROM products 
       WHERE sub_category_id = ? AND id != ?
       LIMIT 10`,
      [current.sub_category_id, id]
    );

    res.status(200).json({ success: true, variants });
  } catch (error) {
    console.error("Error in getProductVariants:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// Get Top Selling Products (Sorted by Review Count)
export const getTopSellingProducts = async (req, res) => {
  try {
    const query = `
      SELECT p.*, t.tag_name, c.name as category_name, s.seller_uid, s.company_name as seller_name,
             (SELECT AVG(rating) FROM product_reviews WHERE product_id = p.id) as avg_rating,
             (SELECT COUNT(*) FROM product_reviews WHERE product_id = p.id) as review_count
      FROM products p
      LEFT JOIN tags t ON p.tag_id = t.id
      LEFT JOIN sub_categories sc ON p.sub_category_id = sc.id
      LEFT JOIN categories c ON sc.category_id = c.id
      LEFT JOIN sellers s ON p.seller_id = s.id
      GROUP BY p.id
      ORDER BY review_count DESC
      LIMIT 8
    `;

    const [rows] = await pool.query(query);

    res.status(200).json({
      success: true,
      data: rows,
    });
  } catch (error) {
    console.error("Error in getTopSellingProducts:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const addProduct = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const {
      name,
      category_id, // Added to handle category resolution
      sub_category_id,
      tag_id,
      thickness,
      width,
      minPrice,
      maxPrice,
      unit,
      min_order,
      stock,
      image_url,
      description,
      applications, // Expecting array of app_names or app_ids
    } = req.body;

    const userId = req.user.id;
    const role = req.user.role;

    let seller_id = null;
    if (role !== "admin") {
      const [sellerRows] = await connection.query("SELECT id FROM sellers WHERE user_id = ?", [userId]);
      if (sellerRows.length === 0) return res.status(404).json({ success: false, message: "Seller profile not found." });
      seller_id = sellerRows[0].id;
    }

    // Helper: Dynamic Master Data Resolution
    const resolveId = async (table, nameField, value, parentField = null, parentValue = null) => {
      if (!value) return null;
      if (!isNaN(value)) return value; // If purely numeric, assume it's an ID

      // If string, search by name
      let sql = `SELECT id FROM ${table} WHERE ${nameField} = ?`;
      let params = [value];
      if (parentField && parentValue) {
        sql += ` AND ${parentField} = ?`;
        params.push(parentValue);
      }

      const [rows] = await connection.query(sql, params);
      if (rows.length > 0) return rows[0].id;

      // Create new record if not found
      const insertSql = parentField 
        ? `INSERT INTO ${table} (${nameField}, ${parentField}) VALUES (?, ?)` 
        : `INSERT INTO ${table} (${nameField}) VALUES (?)`;
      const insertParams = parentField ? [value, parentValue] : [value];
      
      const [result] = await connection.query(insertSql, insertParams);
      return result.insertId;
    };

    // Resolve Category, SubCategory, Tag
    const resolvedCategoryId = await resolveId('categories', 'name', category_id);
    const resolvedSubCategoryId = await resolveId('sub_categories', 'name', sub_category_id, 'category_id', resolvedCategoryId);
    const resolvedTagId = await resolveId('tags', 'tag_name', tag_id);

    // 1. Insert into products
    const [productResult] = await connection.query(
      `INSERT INTO products 
      (name, sub_category_id, tag_id, seller_id, thickness, width, min_price, max_price, unit, description, image_url) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, resolvedSubCategoryId, resolvedTagId, seller_id, thickness, width, minPrice, maxPrice, unit, description, image_url],
    );

    const productId = productResult.insertId;

    // 2. Insert into product_stocks
    await connection.query(
      `INSERT INTO product_stocks (product_id, quantity, min_order) VALUES (?, ?, ?)`,
      [productId, stock, min_order],
    );

    // 3. Resolve and Insert Applications
    if (applications && applications.length > 0) {
      const appIds = [];
      for (const app of applications) {
         const id = await resolveId('applications', 'app_name', app);
         if (id) appIds.push(id);
      }

      if (appIds.length > 0) {
        const mappingValues = appIds.map(aid => [productId, aid]);
        await connection.query("INSERT INTO product_application_mapping (product_id, app_id) VALUES ?", [mappingValues]);
      }
    }

    await connection.commit();
    res.status(201).json({ success: true, message: "Product added successfully!", productId });
  } catch (error) {
    await connection.rollback();
    console.error("Error in addProduct:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  } finally {
    connection.release();
  }
};

// 5. Update Product (Seller/Admin Only)
export const updateProduct = async (req, res) => {
  const { id } = req.params;
  const { name, minPrice, maxPrice, stock, description, image_url } = req.body;
  const userId = req.user.id;
  const role = req.user.role;

  try {
    // Check karo ki product usi seller ka hai ya user admin hai
    const [product] = await pool.query(
      "SELECT seller_id FROM products WHERE id = ?",
      [id],
    );

    if (product.length === 0)
      return res.status(404).json({ message: "Product not found" });

    if (role !== "admin") {
      const [sellerRows] = await pool.query("SELECT id FROM sellers WHERE user_id = ?", [userId]);
      if (sellerRows.length === 0 || product[0].seller_id !== sellerRows[0].id) {
        return res
          .status(403)
          .json({ message: "You can only update your own products" });
      }
    }

    await pool.query(
      "UPDATE products SET name=?, min_price=?, max_price=?, description=?, image_url=? WHERE id=?",
      [name, minPrice, maxPrice, description, image_url, id],
    );

    // Stock update (product_stocks table)
    if (stock !== undefined) {
      await pool.query(
        "UPDATE product_stocks SET quantity=? WHERE product_id=?",
        [stock, id],
      );
    }

    res.json({ success: true, message: "Product updated successfully!" });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// 6. Delete Product (Seller/Admin Only)
export const deleteProduct = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  const role = req.user.role;

  try {
    const [product] = await pool.query(
      "SELECT seller_id FROM products WHERE id = ?",
      [id],
    );

    if (product.length === 0)
      return res.status(404).json({ message: "Product not found" });

    if (role !== "admin") {
      const [sellerRows] = await pool.query("SELECT id FROM sellers WHERE user_id = ?", [userId]);
      if (sellerRows.length === 0 || product[0].seller_id !== sellerRows[0].id) {
        return res
          .status(403)
          .json({ message: "You can only delete your own products" });
      }
    }

    await pool.query("DELETE FROM products WHERE id = ?", [id]);
    res.json({ success: true, message: "Product deleted successfully!" });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

////////////////

// 7. Get Hot Deals (Featured Products)
export const getHotDeals = async (req, res) => {
  try {
    const query = `
      SELECT p.*, t.tag_name, c.name as category_name, s.seller_uid, s.company_name as seller_name,
             ps.quantity as stock, ps.min_order,
             (SELECT AVG(rating) FROM product_reviews WHERE product_id = p.id) as avg_rating,
             (SELECT COUNT(*) FROM product_reviews WHERE product_id = p.id) as review_count
      FROM products p
      LEFT JOIN tags t ON p.tag_id = t.id
      LEFT JOIN sub_categories sc ON p.sub_category_id = sc.id
      LEFT JOIN categories c ON sc.category_id = c.id
      LEFT JOIN product_stocks ps ON p.id = ps.product_id
      LEFT JOIN sellers s ON p.seller_id = s.id
      WHERE p.is_hot_deal = 1
      ORDER BY p.id DESC
      LIMIT 12
    `;

    const [rows] = await pool.query(query);

    res.status(200).json({
      success: true,
      data: rows,
    });
  } catch (error) {
    console.error("Error in getHotDeals:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// 8. Get Unique Product Names for Suggestions
export const getUniqueProductNames = async (req, res) => {
  try {
    const query = "SELECT DISTINCT name FROM products WHERE name IS NOT NULL AND name != '' ORDER BY name ASC";
    const [rows] = await pool.query(query);
    const names = rows.map(row => row.name);
    
    res.status(200).json({
      success: true,
      data: names,
    });
  } catch (error) {
    console.error("Error in getUniqueProductNames:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// 9. Get all sellers for a specific product group key (Phase 2)
export const getSellersByGroupKey = async (req, res) => {
  try {
    const { groupKey } = req.params;

    if (!groupKey) {
      return res.status(400).json({ success: false, message: "Group key is required" });
    }

    const query = `
      SELECT sp.*, s.company_name, s.city, s.state, s.pincode,
             u.name as owner_name, u.mobile as phone, u.email,
             p.display_name, p.name as master_product_name
      FROM seller_products sp
      JOIN sellers s ON sp.seller_id = s.id
      JOIN users u ON s.user_id = u.id
      JOIN products p ON sp.product_id = p.id
      WHERE p.group_key = ? AND sp.status = 'active'
      ORDER BY sp.price_min ASC
    `;

    const [sellers] = await pool.query(query, [groupKey]);

    res.status(200).json({
      success: true,
      totalSellers: sellers.length,
      data: sellers
    });
  } catch (error) {
    console.error("Error in getSellersByGroupKey:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
