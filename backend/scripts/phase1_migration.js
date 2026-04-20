/**
 * Phase 1 Migration Script — PackagingBazaar
 * 
 * Kya karta hai:
 * 1. products table mein 4 new columns add karta hai (display_name, group_key, color, type)
 * 2. seller_products table create karta hai
 * 3. Existing products ka data seller_products mein migrate karta hai
 * 
 * Run: node scripts/phase1_migration.js
 */

import pool from '../config/db.js';
import dotenv from 'dotenv';
dotenv.config();

async function runMigration() {
  const connection = await pool.getConnection();
  console.log('✅ Database connected. Starting Phase 1 Migration...\n');

  try {
    await connection.beginTransaction();

    // ==========================================================
    // STEP 1: products table mein new columns add karo
    // ==========================================================
    console.log('📌 Step 1: Adding columns to products table...');

    // Pehle check karo ki columns already exist karte hain ya nahi
    const [existingCols] = await connection.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'products'
      AND COLUMN_NAME IN ('display_name', 'group_key', 'color', 'type')
    `);

    const existingColNames = existingCols.map(c => c.COLUMN_NAME);

    if (!existingColNames.includes('display_name')) {
      await connection.query(`ALTER TABLE products ADD COLUMN display_name VARCHAR(255) AFTER name`);
      console.log('  ✅ display_name column added');
    } else {
      console.log('  ⏭️  display_name already exists, skipping');
    }

    if (!existingColNames.includes('group_key')) {
      await connection.query(`ALTER TABLE products ADD COLUMN group_key VARCHAR(100) AFTER display_name`);
      console.log('  ✅ group_key column added');
    } else {
      console.log('  ⏭️  group_key already exists, skipping');
    }

    if (!existingColNames.includes('color')) {
      await connection.query(`ALTER TABLE products ADD COLUMN color VARCHAR(50) AFTER thickness`);
      console.log('  ✅ color column added');
    } else {
      console.log('  ⏭️  color already exists, skipping');
    }

    if (!existingColNames.includes('type')) {
      await connection.query(`ALTER TABLE products ADD COLUMN type VARCHAR(50) AFTER color`);
      console.log('  ✅ type column added');
    } else {
      console.log('  ⏭️  type already exists, skipping');
    }

    // ==========================================================
    // STEP 2: seller_products table create karo
    // ==========================================================
    console.log('\n📌 Step 2: Creating seller_products table...');

    const [tables] = await connection.query(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'seller_products'
    `);

    if (tables.length > 0) {
      console.log('  🗑️  Dropping existing seller_products table to fix schema...');
      await connection.query(`DROP TABLE seller_products`);
    }

    await connection.query(`
      CREATE TABLE seller_products (
        id              INT AUTO_INCREMENT PRIMARY KEY,
        product_id      BIGINT UNSIGNED NOT NULL,
        seller_id       INT NOT NULL,
        price_min       DECIMAL(10,2),
        price_max       DECIMAL(10,2),
        moq             INT DEFAULT 100,
        stock           VARCHAR(20) DEFAULT 'Available',
        stock_qty       INT DEFAULT 0,
        width           VARCHAR(50),
        delivery_days   INT DEFAULT 48,
        payment_terms   VARCHAR(100),
        status          ENUM('active','inactive') DEFAULT 'active',
        created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
        FOREIGN KEY (seller_id) REFERENCES sellers(id) ON DELETE CASCADE
      )
    `);
    console.log('  ✅ seller_products table created');

    // ==========================================================
    // STEP 3: Existing data migrate karo products → seller_products
    // ==========================================================
    console.log('\n📌 Step 3: Migrating existing data to seller_products...');

    // Sirf woh products jinka seller_id hai aur jo already migrate nahi hue
    const [productsToMigrate] = await connection.query(`
      SELECT p.id as product_id, p.seller_id, p.min_price, p.max_price, p.width,
             COALESCE(ps.min_order, 100) as moq,
             COALESCE(ps.quantity, 0) as stock_qty
      FROM products p
      LEFT JOIN product_stocks ps ON p.id = ps.product_id
      WHERE p.seller_id IS NOT NULL
      AND p.id NOT IN (SELECT product_id FROM seller_products)
    `);

    if (productsToMigrate.length === 0) {
      console.log('  ⏭️  No products to migrate (already done or no seller products exist)');
    } else {
      const values = productsToMigrate.map(p => [
        p.product_id,
        p.seller_id,
        p.min_price,
        p.max_price,
        p.moq,
        p.stock_qty > 0 ? 'Available' : 'Out of Stock',
        p.stock_qty,
        p.width,
      ]);

      await connection.query(`
        INSERT INTO seller_products 
          (product_id, seller_id, price_min, price_max, moq, stock, stock_qty, width)
        VALUES ?
      `, [values]);

      console.log(`  ✅ ${productsToMigrate.length} products migrated to seller_products`);
    }

    // Commit all changes
    await connection.commit();

    console.log('\n🎉 Phase 1 Migration COMPLETE!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ products table: 4 new columns added');
    console.log('✅ seller_products table: created');
    console.log('✅ Existing data: migrated');
    console.log('\nNext step: Phase 2 — Backend changes (Smart Matching + APIs)');

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
