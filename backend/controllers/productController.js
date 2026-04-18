import pool from "../config/db.js";

// Fetch Categories with their variant or product count
export const getCategories = async (req, res) => {
  try {
    const query = `
      SELECT c.id, c.name, COUNT(p.id) as variants
      FROM categories c
      LEFT JOIN sub_categories sc ON c.id = sc.category_id
      LEFT JOIN products p ON sc.id = p.sub_category_id
      GROUP BY c.id
    `;
    const [rows] = await pool.query(query);
    res.status(200).json({ success: true, data: rows });
  } catch (error) {
    console.error("Error in getCategories:", error);
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
      applications,
    } = req.body;

    const userId = req.user.id; // verifyToken middleware se mil raha hai
    const role = req.user.role;

    let seller_id = null;

    if (role !== "admin") {
      // Get seller_id from user_id
      const [sellerRows] = await connection.query(
        "SELECT id FROM sellers WHERE user_id = ?",
        [userId]
      );

      if (sellerRows.length === 0) {
        return res.status(404).json({ success: false, message: "Seller profile not found." });
      }
      
      seller_id = sellerRows[0].id;
    }

    // 1. Insert into products
    const [productResult] = await connection.query(
      `INSERT INTO products 
      (name, sub_category_id, tag_id, seller_id, thickness, width, min_price, max_price, unit, description, image_url) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name,
        sub_category_id,
        tag_id,
        seller_id,
        thickness,
        width,
        minPrice,
        maxPrice,
        unit,
        description,
        image_url,
      ],
    );

    const productId = productResult.insertId;

    // 2. Insert into product_stocks
    await connection.query(
      `INSERT INTO product_stocks (product_id, quantity, min_order) VALUES (?, ?, ?)`,
      [productId, stock, min_order],
    );

    // 3. Insert Applications (Bulk Mapping Support)
    if (applications && applications.length > 0) {
      // Direct ID mapping logic (Agar frontend ID bhej raha hai toh directly dalo, warna pehle fetch karo)
      const [appData] = await connection.query(
        "SELECT id FROM applications WHERE app_name IN (?)",
        [applications],
      );

      const mappingValues = appData.map((app) => [productId, app.id]);
      if (mappingValues.length > 0) {
        await connection.query(
          "INSERT INTO product_application_mapping (product_id, app_id) VALUES ?",
          [mappingValues],
        );
      }
    }

    await connection.commit();
    res.status(201).json({
      success: true,
      message: "Product added successfully!",
      productId,
    });
  } catch (error) {
    await connection.rollback();
    res.status(500).json({ success: false, message: "Failed to add product." });
  } finally {
    connection.release();
  }
};

/////////////////////////////////////

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
