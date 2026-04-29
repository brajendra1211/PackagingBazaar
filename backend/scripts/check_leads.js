import pool from "../config/db.js";

async function check() {
  try {
    const [rows] = await pool.query("SELECT i.id, i.product_id, i.seller_id FROM inquiries i WHERE i.id = 6");
    console.log("Inquiry 6 details:", rows);
    
    if (rows.length > 0) {
      const [pRows] = await pool.query("SELECT id, name FROM products WHERE id = ?", [rows[0].product_id]);
      console.log("Product details for this inquiry:", pRows);
    }

    process.exit(0);
  } catch (error) {
    console.error("Error:", error.message);
    process.exit(1);
  }
}

check();
