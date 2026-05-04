import pool from '../config/db.js';

const createTable = async () => {
    const query = `
        CREATE TABLE IF NOT EXISTS pincodes_geo (
            pincode VARCHAR(10) PRIMARY KEY,
            latitude DECIMAL(10, 8) NOT NULL,
            longitude DECIMAL(11, 8) NOT NULL,
            city VARCHAR(100),
            state VARCHAR(100),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;

    try {
        await pool.query(query);
        console.log("✅ Table 'pincodes_geo' created successfully.");
        process.exit(0);
    } catch (error) {
        console.error("❌ Error creating table:", error);
        process.exit(1);
    }
};

createTable();
