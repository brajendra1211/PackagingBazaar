import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../backend/.env') });

async function checkImages() {
  const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'packaging_bazaar',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  });

  try {
    const [rows] = await pool.query("SELECT id, name, image_url FROM products ORDER BY id DESC LIMIT 5");
    console.log("Recent Products and their Image URLs:");
    console.table(rows);
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await pool.end();
  }
}

checkImages();
