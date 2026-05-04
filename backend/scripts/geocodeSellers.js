import pool from '../config/db.js';
import { getCoordinates } from '../utils/geoUtils.js';

const geocodeAllSellers = async () => {
    try {
        console.log("🔍 Checking for sellers with missing geolocation data...");
        
        // Find all unique pincodes from sellers that are NOT in pincodes_geo
        const [sellers] = await pool.query(`
            SELECT DISTINCT pincode 
            FROM sellers 
            WHERE pincode NOT IN (SELECT pincode FROM pincodes_geo)
            AND pincode IS NOT NULL AND pincode != ''
        `);

        if (sellers.length === 0) {
            console.log("✅ All seller pincodes are already geocoded!");
            process.exit(0);
        }

        console.log(`🚀 Found ${sellers.length} missing pincodes. Starting geocoding...`);

        for (const seller of sellers) {
            console.log(`🌐 Geocoding pincode: ${seller.pincode}...`);
            const coords = await getCoordinates(seller.pincode);
            if (coords) {
                console.log(`   ✅ Success: ${coords.city}, ${coords.state} (${coords.latitude}, ${coords.longitude})`);
            } else {
                console.log(`   ❌ Failed to geocode: ${seller.pincode}`);
            }
            // Add a small delay to respect API rate limits
            await new Promise(resolve => setTimeout(resolve, 1000));
        }

        console.log("\n🏁 Geocoding maintenance finished!");
        process.exit(0);
    } catch (error) {
        console.error("❌ Geocoding script failed:", error);
        process.exit(1);
    }
};

geocodeAllSellers();
