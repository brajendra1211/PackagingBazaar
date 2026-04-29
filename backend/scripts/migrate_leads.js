import pool from "../config/db.js";

async function migrate() {
  try {
    console.log("Starting migration...");
    
    try {
        await pool.query("ALTER TABLE inquiries ADD COLUMN is_assigned TINYINT(1) DEFAULT 0");
        console.log("Added is_assigned column.");
    } catch (e) {
        console.log("is_assigned might already exist.");
    }

    try {
        await pool.query("ALTER TABLE inquiries ADD COLUMN assigned_at TIMESTAMP NULL");
        console.log("Added assigned_at column.");
    } catch (e) {
        console.log("assigned_at might already exist.");
    }

    console.log("✅ Migration step finished!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Migration failed:", error.message);
    process.exit(1);
  }
}

migrate();
