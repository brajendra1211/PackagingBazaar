import pool from "../backend/config/db.js";

async function checkData() {
  try {
    const [products] = await pool.query("SELECT COUNT(*) as count FROM products");
    const [categories] = await pool.query("SELECT COUNT(*) as count FROM categories");
    const [sellers] = await pool.query("SELECT COUNT(*) as count FROM sellers");
    const [tags] = await pool.query("SELECT COUNT(*) as count FROM tags");

    console.log("Products Count:", products[0].count);
    console.log("Categories Count:", categories[0].count);
    console.log("Sellers Count:", sellers[0].count);
    console.log("Tags Count:", tags[0].count);

    if (products[0].count > 0) {
      const [sample] = await pool.query("SELECT p.name, t.tag_name FROM products p LEFT JOIN tags t ON p.tag_id = t.id LIMIT 5");
      console.log("Sample Products:", sample);
    } else {
        console.log("Products table is empty!");
    }

    process.exit(0);
  } catch (error) {
    console.error("Error checking data:", error);
    process.exit(1);
  }
}

checkData();
