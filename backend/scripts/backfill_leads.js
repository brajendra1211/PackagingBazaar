import pool from "../config/db.js";

async function backfill() {
  try {
    const [rows] = await pool.query("SELECT id, address FROM inquiries WHERE city IS NULL OR state IS NULL");
    console.log(`Found ${rows.length} inquiries to backfill.`);

    for (const row of rows) {
      if (!row.address) continue;
      
      // Format example: "Noida, Gautam Buddha Nagar, Uttar Pradesh - 201301"
      const parts = row.address.split(',').map(p => p.trim());
      
      // Many addresses follow: [Locality], [District/City], [State - Pincode]
      let city = null;
      let state = null;

      if (parts.length >= 3) {
        city = parts[1];
        state = parts[2].split('-')[0].trim();
      } else if (parts.length === 2) {
        city = parts[0];
        state = parts[1].split('-')[0].trim();
      }

      if (city || state) {
        await pool.query("UPDATE inquiries SET city = ?, state = ? WHERE id = ?", [city, state, row.id]);
        console.log(`Updated Inquiry ID ${row.id}: City=${city}, State=${state}`);
      }
    }
    console.log("Backfill complete.");
    process.exit(0);
  } catch (err) {
    console.error("Backfill Failed:", err);
    process.exit(1);
  }
}

backfill();
