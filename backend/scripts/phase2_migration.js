/**
 * Phase 2 Migration Script — PackagingBazaar
 * 
 * Kya karta hai:
 * 1. product_groups table create karta hai
 * 2. products table mein missing columns add karta hai: group_id, product_type, delivery_time
 * 3. group_key col ko ensure karta hai
 * 
 * Run: node scripts/phase2_migration.js
 */

import pool from '../config/db.js';
import dotenv from 'dotenv';
dotenv.config();

async function runMigration() {
  const connection = await pool.getConnection();
  console.log('✅ Database connected. Starting Phase 2 Migration...\n');

  try {
    await connection.beginTransaction();

    // ==========================================================
    // STEP 1: product_groups table create karo
    // ==========================================================
    console.log('📌 Step 1: Creating product_groups table...');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS product_groups (
        id              INT AUTO_INCREMENT PRIMARY KEY,
        category_id     INT,
        master_id       VARCHAR(100) UNIQUE NOT NULL,
        name            VARCHAR(255),
        created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('  ✅ product_groups table ready');

    // ==========================================================
    // STEP 2: products table mein new columns add karo
    // ==========================================================
    console.log('\n📌 Step 2: Adding extended columns to products table...');

    const [existingCols] = await connection.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'products'
    `);
    const colNames = existingCols.map(c => c.COLUMN_NAME.toLowerCase());

    if (!colNames.includes('group_id')) {
      await connection.query(`ALTER TABLE products ADD COLUMN group_id INT AFTER tag_id`);
      console.log('  ✅ group_id column added');
    }

    if (!colNames.includes('product_code')) {
      await connection.query(`ALTER TABLE products ADD COLUMN product_code VARCHAR(50) AFTER group_id`);
      console.log('  ✅ product_code column added');
    }

    if (!colNames.includes('product_type')) {
       // 'type' column may exist from phase 1, we rename or add product_type
       if (colNames.includes('type')) {
          await connection.query(`ALTER TABLE products CHANGE COLUMN type product_type VARCHAR(100)`);
          console.log('  ✅ renamed "type" to "product_type"');
       } else {
          await connection.query(`ALTER TABLE products ADD COLUMN product_type VARCHAR(100) AFTER color`);
          console.log('  ✅ product_type column added');
       }
    }

    if (!colNames.includes('delivery_time')) {
      await connection.query(`ALTER TABLE products ADD COLUMN delivery_time VARCHAR(100) AFTER image_url`);
      console.log('  ✅ delivery_time column added');
    }

    // Ensure group_key exists for direct string storage if needed
    if (!colNames.includes('group_key')) {
      await connection.query(`ALTER TABLE products ADD COLUMN group_key VARCHAR(100) AFTER display_name`);
      console.log('  ✅ group_key column added');
    }

    // Commit all changes
    await connection.commit();
    console.log('\n🎉 Phase 2 Migration COMPLETE!');

  } catch (error) {
    await connection.rollback();
    console.error('\n❌ Migration FAILED! Changes rolled back.');
    console.error('Error:', error.message);
    process.exit(1);
  } finally {
    connection.release();
    process.exit(0);
  }
}

runMigration();
