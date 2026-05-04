import pool from '../config/db.js';

const CSV_URL = 'https://raw.githubusercontent.com/sanand0/pincode/master/data/IN.csv';

const seedFromGovSource = async () => {
    try {
        console.log("🌐 Fetching Original Pincode Data from Official/Community Source...");
        
        const response = await fetch(CSV_URL);
        if (!response.ok) throw new Error('Failed to fetch CSV data');
        
        const csvData = await response.text();
        const lines = csvData.split('\n');
        
        // Find header index
        const headerIndex = lines.findIndex(line => line.startsWith('key,place_name'));
        if (headerIndex === -1) throw new Error('Invalid CSV format: Header not found');

        const dataRows = lines.slice(headerIndex + 1);
        
        console.log(`📊 Processing ~${dataRows.length} rows...`);
        
        let successCount = 0;
        let batch = [];
        const BATCH_SIZE = 1000;

        for (let row of dataRows) {
            if (!row.trim()) continue;
            
            // Format: key,place_name,admin_name1,latitude,longitude,accuracy
            const parts = row.split(',');
            if (parts.length < 5) continue;

            const key = parts[0];
            const city = parts[1];
            const state = parts[2];
            const lat = parts[3];
            const lon = parts[4];

            if (!key || !lat || !lon || isNaN(parseFloat(lat)) || isNaN(parseFloat(lon))) continue;
            
            // Convert "IN/110001" to "110001"
            const pincode = key.includes('/') ? key.split('/')[1] : key;
            if (!pincode || pincode.length < 6) continue;

            batch.push([pincode, parseFloat(lat), parseFloat(lon), city, state]);

            if (batch.length >= BATCH_SIZE) {
                await pool.query(
                    "INSERT IGNORE INTO pincodes_geo (pincode, latitude, longitude, city, state) VALUES ?",
                    [batch]
                );
                successCount += batch.length;
                console.log(`✅ Progress: ${successCount} pincodes imported...`);
                batch = [];
            }
        }

        // Final batch
        if (batch.length > 0) {
            await pool.query(
                "INSERT IGNORE INTO pincodes_geo (pincode, latitude, longitude, city, state) VALUES ?",
                [batch]
            );
            successCount += batch.length;
        }

        console.log(`\n🏁 FINISHED! Total original pincodes in database: ${successCount}`);
        console.log("🚀 Project is now ready with All-India original coordinates.");
        process.exit(0);
    } catch (error) {
        console.error("❌ Bulk Seeding Failed:", error);
        process.exit(1);
    }
};

seedFromGovSource();
