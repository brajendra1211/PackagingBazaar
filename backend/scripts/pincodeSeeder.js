import pool from '../config/db.js';

const pincodes = [
    { pincode: '110006', lat: 28.650, lon: 77.231, city: 'Sadar Bazar', state: 'Delhi' },
    { pincode: '110053', lat: 28.680, lon: 77.260, city: 'Bhajanpura', state: 'Delhi' },
    { pincode: '110019', lat: 28.535, lon: 77.264, city: 'Kalkaji', state: 'Delhi' },
    { pincode: '110015', lat: 28.660, lon: 77.151, city: 'Ramesh Nagar', state: 'Delhi' },
    { pincode: '110001', lat: 28.630, lon: 77.218, city: 'Connaught Place', state: 'Delhi' },
    { pincode: '122001', lat: 28.459, lon: 77.026, city: 'Gurgaon', state: 'Haryana' },
    { pincode: '201301', lat: 28.535, lon: 77.391, city: 'Noida', state: 'Uttar Pradesh' },
    { pincode: '201001', lat: 28.669, lon: 77.423, city: 'Ghaziabad', state: 'Uttar Pradesh' },
    { pincode: '110092', lat: 28.641, lon: 77.300, city: 'Shakarpur', state: 'Delhi' },
    { pincode: '110085', lat: 28.710, lon: 77.120, city: 'Rohini', state: 'Delhi' }
];

const seed = async () => {
    try {
        console.log("🚀 Seeding original pincode data...");
        for (const item of pincodes) {
            await pool.query(
                "INSERT INTO pincodes_geo (pincode, latitude, longitude, city, state) VALUES (?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE latitude=VALUES(latitude), longitude=VALUES(longitude)",
                [item.pincode, item.lat, item.lon, item.city, item.state]
            );
        }
        console.log("✅ Seeded initial pincode data successfully.");
        process.exit(0);
    } catch (error) {
        console.error("❌ Seeding failed:", error);
        process.exit(1);
    }
};

seed();
