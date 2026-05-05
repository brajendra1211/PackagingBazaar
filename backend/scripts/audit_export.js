import pool from '../config/db.js';

async function auditExport() {
  const entities = ['leads', 'sellers', 'products', 'inventory'];
  
  for (const entity of entities) {
    try {
      console.log(`\nAudit for entity: ${entity.toUpperCase()}`);
      let query = "";
      
      if (entity === "leads") {
        query = `
          SELECT i.id, i.name as buyer_name, i.email, i.mobile, i.product_name, 
                 i.quantity_required, i.status, i.lost_reason, i.admin_note, i.created_at,
                 s.company_name as won_seller
          FROM inquiries i
          LEFT JOIN sellers s ON i.won_seller_id = s.id
        `;
      } else if (entity === "sellers") {
        query = `
          SELECT s.id, s.seller_uid, s.company_name, u.name as owner_name, u.email, u.mobile,
                 s.gst_number, s.city, s.state, s.status, s.created_at
          FROM sellers s
          JOIN users u ON s.user_id = u.id
        `;
      } else if (entity === "products") {
        query = `
          SELECT p.id, p.name, p.group_key, c.name as category, sc.name as sub_category, 
                 p.thickness, p.width, p.applications, p.min_price, p.max_price
          FROM products p
          LEFT JOIN sub_categories sc ON p.sub_category_id = sc.id
          LEFT JOIN categories c ON sc.category_id = c.id
        `;
      } else if (entity === "inventory") {
        query = `
          SELECT sp.id, s.company_name as seller, p.name as product, 
                 sp.price_min, sp.price_max, sp.moq, sp.stock_qty, sp.delivery_hours
          FROM seller_products sp
          JOIN sellers s ON sp.seller_id = s.id
          JOIN products p ON sp.product_id = p.id
        `;
      }

      const [rows] = await pool.query(query + " LIMIT 1");
      console.log(`✔ SQL Valid for ${entity}. Sample columns:`, Object.keys(rows[0] || {}).join(', '));
    } catch (err) {
      console.error(`✖ Error in ${entity}:`, err.message);
    }
  }
  process.exit(0);
}

auditExport();
