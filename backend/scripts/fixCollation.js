import pool from '../config/db.js';

const fixCollation = async () => {
    try {
        console.log("🛠️ Fixing table collation mismatch...");
        
        // Change pincodes_geo table collation
        await pool.query(`
            ALTER TABLE pincodes_geo 
            CONVERT TO CHARACTER SET utf8mb4 
            COLLATE utf8mb4_0900_ai_ci
        `);

        // Also ensure specific columns are aligned
        await pool.query(`
            ALTER TABLE pincodes_geo 
            MODIFY pincode VARCHAR(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci
        `);

        console.log("✅ Collation mismatch fixed! Table 'pincodes_geo' now uses 'utf8mb4_0900_ai_ci'.");
        process.exit(0);
    } catch (error) {
        // Fallback for older MySQL versions where utf8mb4_0900_ai_ci doesn't exist
        if (error.message.includes('Unknown collation')) {
            console.log("⚠️ utf8mb4_0900_ai_ci not found, trying utf8mb4_general_ci...");
            try {
                await pool.query(`
                    ALTER TABLE pincodes_geo 
                    CONVERT TO CHARACTER SET utf8mb4 
                    COLLATE utf8mb4_general_ci
                `);
                console.log("✅ Collation fixed with utf8mb4_general_ci.");
                process.exit(0);
            } catch (e) {
                console.error("❌ Failed to fix collation:", e.message);
                process.exit(1);
            }
        } else {
            console.error("❌ Error fixing collation:", error.message);
            process.exit(1);
        }
    }
};

fixCollation();
