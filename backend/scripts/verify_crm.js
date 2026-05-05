import pool from '../config/db.js';

async function verifyCRM() {
  try {
    const leadId = 8;
    console.log(`\n--- Testing CRM Status Update for Lead ID: ${leadId} ---`);

    // 1. Simulate "Deal Closed" with a winner
    const wonSellerId = 5; // Aditya Polyfilms
    await pool.query(
      `UPDATE inquiries SET status = 'Deal Closed', won_seller_id = ?, lost_reason = NULL WHERE id = ?`,
      [wonSellerId, leadId]
    );
    console.log('✔ Simulated "Deal Closed" update.');

    // 2. Verify from Database
    const [rows] = await pool.query(
      `SELECT i.id, i.status, i.won_seller_id, i.lost_reason, s.company_name as winner_name 
       FROM inquiries i 
       LEFT JOIN sellers s ON i.won_seller_id = s.id 
       WHERE i.id = ?`,
      [leadId]
    );
    console.table(rows);

    // 3. Simulate "Lead Lost"
    await pool.query(
      `UPDATE inquiries SET status = 'Lead Lost', won_seller_id = NULL, lost_reason = 'High Price' WHERE id = ?`,
      [leadId]
    );
    console.log('✔ Simulated "Lead Lost" update.');

    // 4. Verify again
    const [rows2] = await pool.query(`SELECT id, status, won_seller_id, lost_reason FROM inquiries WHERE id = ?`, [leadId]);
    console.table(rows2);

    // Reset for safety
    await pool.query(`UPDATE inquiries SET status = 'pending', won_seller_id = NULL, lost_reason = NULL WHERE id = ?`, [leadId]);
    console.log('✔ Lead status reset to pending.');

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

verifyCRM();
