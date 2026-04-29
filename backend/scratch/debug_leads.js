import pool from "../config/db.js";

async function debugLeads() {
  try {
    console.log("--- Checking Sellers ---");
    const [sellers] = await pool.query("SELECT id, user_id, company_name FROM sellers LIMIT 5");
    console.table(sellers);

    console.log("--- Checking Inquiries ---");
    const [inquiries] = await pool.query("SELECT id, product_id, seller_id, buyer_name, is_assigned FROM inquiries LIMIT 5");
    console.table(inquiries);

    console.log("--- Checking Lead Assignments ---");
    const [assignments] = await pool.query("SELECT * FROM lead_assignments LIMIT 5");
    console.table(assignments);

    console.log("--- Checking Counts ---");
    const [[{ total_inquiries }]] = await pool.query("SELECT COUNT(*) as total_inquiries FROM inquiries");
    const [[{ total_assignments }]] = await pool.query("SELECT COUNT(*) as total_assignments FROM lead_assignments");
    console.log(`Total Inquiries: ${total_inquiries}`);
    console.log(`Total Assignments: ${total_assignments}`);

    process.exit(0);
  } catch (error) {
    console.error("Error debugging leads:", error);
    process.exit(1);
  }
}

debugLeads();
