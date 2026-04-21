import pool from "../backend/config/db.js";

async function test() {
  try {
    const query = `
      SELECT p.*, MAX(t.tag_name) as tag_name, MAX(sc.name) as subcategory_name, MAX(c.name) as category_name,
             COALESCE(MIN(sp.price_min), p.min_price) as min_price,
             COALESCE(MAX(sp.price_max), p.max_price) as max_price,
             COALESCE(SUM(sp.stock_qty), 0) as stock, 
             COALESCE(MIN(sp.moq), 100) as min_order,
             MAX(s.seller_uid) as seller_uid, MAX(s.company_name) as seller_name,
             MAX(s.city) as city, MAX(s.state) as state,
             (SELECT AVG(rating) FROM product_reviews WHERE product_id = p.id) as avg_rating,
             (SELECT COUNT(*) FROM product_reviews WHERE product_id = p.id) as review_count
      FROM products p
      LEFT JOIN tags t ON p.tag_id = t.id
      LEFT JOIN sub_categories sc ON p.sub_category_id = sc.id
      LEFT JOIN categories c ON sc.category_id = c.id
      LEFT JOIN seller_products sp ON p.id = sp.product_id AND sp.status = 'active'
      LEFT JOIN sellers s ON s.id = COALESCE(p.seller_id, sp.seller_id)
      WHERE 1=1
      GROUP BY p.id
      ORDER BY p.id ASC LIMIT 8 OFFSET 0
    `;
    const [rows] = await pool.query(query);
    console.log(rows);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

test();
