import pool from "../config/db.js";

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

    // Main Data Query
    let dataQuery = `
      SELECT p.*, t.tag_name, sc.name as subcategory_name, c.name as category_name,
             ps.quantity as stock, ps.min_order,
             (SELECT AVG(rating) FROM product_reviews WHERE product_id = p.id) as avg_rating,
             (SELECT COUNT(*) FROM product_reviews WHERE product_id = p.id) as review_count
      FROM products p
      LEFT JOIN tags t ON p.tag_id = t.id
      LEFT JOIN sub_categories sc ON p.sub_category_id = sc.id
      LEFT JOIN categories c ON sc.category_id = c.id
      LEFT JOIN product_stocks ps ON p.id = ps.product_id
      ${whereClause}
    `;

    // Sorting
    if (sort === "price_low") dataQuery += ` ORDER BY p.price ASC`;
    else if (sort === "price_high") dataQuery += ` ORDER BY p.price DESC`;
    else if (sort === "highest_rated") dataQuery += ` ORDER BY avg_rating DESC`;
    else dataQuery += ` ORDER BY p.id ASC`;

    // Pagination
    dataQuery += ` LIMIT ? OFFSET ?`;

    // 🔥 FIX: Count Query me 'tags' table join karni padegi kyunki WHERE me tag use ho raha hai
    const countQuery = `
      SELECT COUNT(p.id) as total 
      FROM products p
      LEFT JOIN categories c ON p.sub_category_id = c.id
      LEFT JOIN tags t ON p.tag_id = t.id
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
         ps.quantity as stock, ps.min_order,
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

// Get Top Selling Products (Sorted by Review Count)
export const getTopSellingProducts = async (req, res) => {
  try {
    const query = `
      SELECT p.*, t.tag_name, c.name as category_name,
             (SELECT AVG(rating) FROM product_reviews WHERE product_id = p.id) as avg_rating,
             (SELECT COUNT(*) FROM product_reviews WHERE product_id = p.id) as review_count
      FROM products p
      LEFT JOIN tags t ON p.tag_id = t.id
      LEFT JOIN sub_categories sc ON p.sub_category_id = sc.id
      LEFT JOIN categories c ON sc.category_id = c.id
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
      price,
      unit,
      min_order,
      stock,
      image_url,
      description,
      applications,
    } = req.body;

    const seller_id = req.user.id; // verifyToken middleware se mil raha hai

    // 1. Insert into products
    const [productResult] = await connection.query(
      `INSERT INTO products 
      (name, sub_category_id, tag_id, seller_id, thickness, width, price, unit, description, image_url) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name,
        sub_category_id,
        tag_id,
        seller_id,
        thickness,
        width,
        price,
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
  const { name, price, stock, description, image_url } = req.body;
  const seller_id = req.user.id;
  const role = req.user.role;

  try {
    // Check karo ki product usi seller ka hai ya user admin hai
    const [product] = await pool.query(
      "SELECT seller_id FROM products WHERE id = ?",
      [id],
    );

    if (product.length === 0)
      return res.status(404).json({ message: "Product not found" });

    if (role !== "admin" && product[0].seller_id !== seller_id) {
      return res
        .status(403)
        .json({ message: "You can only update your own products" });
    }

    await pool.query(
      "UPDATE products SET name=?, price=?, description=?, image_url=? WHERE id=?",
      [name, price, description, image_url, id],
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
  const seller_id = req.user.id;
  const role = req.user.role;

  try {
    const [product] = await pool.query(
      "SELECT seller_id FROM products WHERE id = ?",
      [id],
    );

    if (product.length === 0)
      return res.status(404).json({ message: "Product not found" });

    if (role !== "admin" && product[0].seller_id !== seller_id) {
      return res
        .status(403)
        .json({ message: "You can only delete your own products" });
    }

    await pool.query("DELETE FROM products WHERE id = ?", [id]);
    res.json({ success: true, message: "Product deleted successfully!" });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

////////////////
