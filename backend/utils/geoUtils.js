import pool from '../config/db.js';

/**
 * Calculate the distance between two points on Earth using the Haversine formula.
 * @param {number} lat1 - Latitude of point 1
 * @param {number} lon1 - Longitude of point 1
 * @param {number} lat2 - Latitude of point 2
 * @param {number} lon2 - Longitude of point 2
 * @returns {number} - Distance in kilometers
 */
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};

/**
 * Get coordinates (Lat/Long) for a given pincode.
 * Checks the database first, then falls back to OpenStreetMap API.
 * @param {string} pincode - Indian Pincode
 * @returns {Promise<{latitude: number, longitude: number, city: string, state: string} | null>}
 */
export const getCoordinates = async (pincode) => {
    if (!pincode) return null;

    try {
        // 1. Check Database
        const [rows] = await pool.query("SELECT * FROM pincodes_geo WHERE pincode = ?", [pincode]);
        if (rows.length > 0) {
            return {
                latitude: parseFloat(rows[0].latitude),
                longitude: parseFloat(rows[0].longitude),
                city: rows[0].city,
                state: rows[0].state
            };
        }

        // 2. Fallback to OpenStreetMap Nominatim API
        console.log(`🌐 Fetching coordinates for pincode ${pincode} from API...`);
        const response = await fetch(`https://nominatim.openstreetmap.org/search?postalcode=${pincode}&country=India&format=json&limit=1`, {
            headers: {
                'User-Agent': 'PackagingBazaar-App/1.0 (contact: manalvi2610singh@gmail.com)'
            }
        });

        if (!response.ok) throw new Error('API request failed');

        const data = await response.json();

        if (data && data.length > 0) {
            const result = {
                latitude: parseFloat(data[0].lat),
                longitude: parseFloat(data[0].lon),
                city: data[0].display_name.split(',')[0],
                state: data[0].display_name.split(',').slice(-3, -2)[0]?.trim() || ''
            };

            // 3. Cache the result in the database
            await pool.query(
                "INSERT INTO pincodes_geo (pincode, latitude, longitude, city, state) VALUES (?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE latitude=VALUES(latitude), longitude=VALUES(longitude)",
                [pincode, result.latitude, result.longitude, result.city, result.state]
            );

            return result;
        }

        return null;
    } catch (error) {
        console.error(`❌ Error fetching coordinates for ${pincode}:`, error.message);
        return null;
    }
};
