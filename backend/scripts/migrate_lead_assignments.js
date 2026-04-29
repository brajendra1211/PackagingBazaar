import pool from "../config/db.js";

async function migrate() {
  try {
    console.log("Starting migration: Creating lead_assignments table...");
    
    await pool.query(`
      CREATE TABLE IF NOT EXISTS lead_assignments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        inquiry_id INT NOT NULL,
        seller_id INT NOT NULL,
        assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY unique_assignment (inquiry_id, seller_id)
      );
    `);

    console.log("✅ lead_assignments table created!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Migration failed:", error.message);
    process.exit(1);
  }
}

migrate();
