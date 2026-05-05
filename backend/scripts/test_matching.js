import pool from '../config/db.js';
import { getCoordinates } from '../utils/geoUtils.js';

async function testMatching() {
  try {
    const [leadRows] = await pool.query(
      `SELECT i.*, p.sub_category_id, sc.category_id 
       FROM inquiries i 
       JOIN products p ON i.product_id = p.id 
       LEFT JOIN sub_categories sc ON p.sub_category_id = sc.id
       WHERE i.id = 8`
    );

    if (leadRows.length === 0) {
      console.log('Lead ID 7 not found.');
      process.exit(0);
    }

    const lead = leadRows[0];
    const parseQty = (str) => {
      if (!str) return 0;
      const match = str.match(/(\d+)/);
      return match ? parseInt(match[1]) : 0;
    };

    const leadQty = parseQty(lead.quantity_required);
    const leadThickness = lead.thickness ? lead.thickness.toLowerCase() : null;
    const leadWidth = lead.width ? lead.width.toLowerCase() : null;

    let bLat = 0, bLng = 0;
    const leadCoords = await getCoordinates(lead.pincode);
    bLat = leadCoords?.latitude || 0;
    bLng = leadCoords?.longitude || 0;

    const locSql = `
        CASE 
          WHEN (6371 * acos(cos(radians(?)) * cos(radians(pg.latitude)) * cos(radians(pg.longitude) - radians(?)) + sin(radians(?)) * sin(radians(pg.latitude)))) <= 10 THEN 200
          WHEN (6371 * acos(cos(radians(?)) * cos(radians(pg.latitude)) * cos(radians(pg.longitude) - radians(?)) + sin(radians(?)) * sin(radians(pg.latitude)))) <= 50 THEN 150
          WHEN (6371 * acos(cos(radians(?)) * cos(radians(pg.latitude)) * cos(radians(pg.longitude) - radians(?)) + sin(radians(?)) * sin(radians(pg.latitude)))) <= 100 THEN 100
          WHEN (6371 * acos(cos(radians(?)) * cos(radians(pg.latitude)) * cos(radians(pg.longitude) - radians(?)) + sin(radians(?)) * sin(radians(pg.latitude)))) <= 300 THEN 50
          WHEN s.pincode = ? THEN 150
          WHEN LOWER(s.city) = LOWER(?) OR LOWER(?) LIKE CONCAT('%', LOWER(s.city), '%') THEN 50 
          WHEN LOWER(s.state) = LOWER(?) OR LOWER(?) LIKE CONCAT('%', LOWER(s.state), '%') THEN 20 
          WHEN (
            (LOWER(?) LIKE '%delhi%' OR LOWER(?) LIKE '%ncr%') AND 
            (LOWER(s.city) IN ('ghaziabad', 'noida', 'greater noida', 'gurgaon', 'gurugram', 'faridabad', 'sonepat', 'bahadurgarh'))
          ) THEN 150
          ELSE 0 
        END`;

    const prodSql = `
          COALESCE((
          SELECT MAX(
            CASE 
              WHEN sp.delivery_hours IS NULL THEN 0
              WHEN sp.delivery_hours <= 24 THEN 150
              WHEN sp.delivery_hours <= 48 THEN 100
              WHEN sp.delivery_hours <= 72 THEN 50
              ELSE 0 
            END +
            CASE 
              WHEN sp.price_min <= (SELECT COALESCE(MIN(price_min), sp.price_min) FROM seller_products WHERE product_id = sp.product_id) THEN 250
              WHEN sp.price_min <= (SELECT COALESCE(AVG(price_min), sp.price_min) FROM seller_products WHERE product_id = sp.product_id) THEN 150 
              ELSE 50 
            END +
            CASE WHEN sp.stock_qty >= ? THEN 100 ELSE 0 END +
            CASE 
              WHEN LOWER(sp.width) = LOWER(?) THEN 150 
              WHEN sp.width IS NULL OR LOWER(sp.width) IN ('all', 'custom', 'any') THEN 100
              ELSE 0 
            END +
            CASE 
              WHEN EXISTS (SELECT 1 FROM products p3 WHERE p3.id = sp.product_id AND LOWER(p3.thickness) = LOWER(?)) THEN 150 
              WHEN EXISTS (SELECT 1 FROM products p3 WHERE p3.id = sp.product_id AND (p3.thickness IS NULL OR LOWER(p3.thickness) IN ('all', 'custom', 'any'))) THEN 100
              ELSE 0 
            END
          )
          FROM seller_products sp
          JOIN products p_check ON sp.product_id = p_check.id
          JOIN sub_categories sc_check ON p_check.sub_category_id = sc_check.id
          WHERE sp.seller_id = s.id AND sp.status = 'active' AND sc_check.category_id = ?
      ), 0)`;

    const query = `
      SELECT s.id as seller_id, s.company_name, s.city, 
      (6371 * acos(cos(radians(?)) * cos(radians(pg.latitude)) * cos(radians(pg.longitude) - radians(?)) + sin(radians(?)) * sin(radians(pg.latitude)))) AS distance_km,
      (${locSql}) as location_score,
      (${prodSql}) as product_score,
      ((${locSql}) + (${prodSql})) as total_score,
      (SELECT MIN(delivery_hours) FROM seller_products sp5 JOIN products p5 ON sp5.product_id = p5.id JOIN sub_categories sc5 ON p5.sub_category_id = sc5.id WHERE sp5.seller_id = s.id AND sc5.category_id = ? AND sp5.status = 'active') as best_delivery_hours,
      (SELECT MIN(price_min) FROM seller_products sp_p JOIN products p_p ON sp_p.product_id = p_p.id JOIN sub_categories sc_p ON p_p.sub_category_id = sc_p.id WHERE sp_p.seller_id = s.id AND sc_p.category_id = ? AND sp_p.status = 'active') as best_price
      FROM sellers s
      JOIN users u ON s.user_id = u.id
      LEFT JOIN pincodes_geo pg ON s.pincode = pg.pincode
      WHERE u.role = 'seller' AND s.status IN ('verified', 'approved', 'active')
        AND EXISTS (
          SELECT 1 FROM seller_products sp_filter 
          JOIN products p_filter ON sp_filter.product_id = p_filter.id
          JOIN sub_categories sc_filter ON p_filter.sub_category_id = sc_filter.id
          WHERE sp_filter.seller_id = s.id 
            AND sp_filter.status = 'active'
            AND sc_filter.category_id = ?
            AND sp_filter.stock_qty >= ? 
            AND sp_filter.moq <= ? 
        )
      ORDER BY total_score DESC, distance_km ASC, best_price ASC
    `;

    const locParams = [bLat, bLng, bLat, bLat, bLng, bLat, bLat, bLng, bLat, bLat, bLng, bLat, lead.pincode, lead.city, lead.address, lead.state, lead.address, lead.state, lead.state];
    const prodParams = [leadQty, leadWidth, leadThickness, lead.category_id];
    
    const params = [
        bLat, bLng, bLat, // for distance_km
        ...locParams,
        ...prodParams,
        ...locParams,
        ...prodParams,
        lead.category_id, // for best_delivery_hours
        lead.category_id, // for best_price
        lead.category_id, leadQty, leadQty // for EXISTS
    ];

    const [sellers] = await pool.query(query, params);

    console.log('\n--- LEAD DETAILS ---');
    console.log(`Product: SILVER METALLIZED POLYESTER FILMS, Qty: ${leadQty}, City: ${lead.city}`);
    
    console.log('\n--- MATCHING RESULTS (Score Breakdown) ---');
    console.table(sellers);
    
    process.exit(0);
  } catch (error) {
    console.error("Test Error:", error);
    process.exit(1);
  }
}

testMatching();
