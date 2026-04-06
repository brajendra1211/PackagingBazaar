import pool from "../config/db.js";

// 1. Fetch all pending sellers
export const getPendingSellers = async (req, res) => {
  try {
    const query = `
      SELECT u.id as user_id, u.name as owner_name, u.email, u.is_verified, 
             COALESCE(s.company_name, 'Incomplete Registration') as company_name, 
             COALESCE(s.business_type, 'N/A') as business_type, 
             COALESCE(s.gst_number, 'Not Provided') as gst_number, 
             COALESCE(s.city, 'N/A') as city, 
             COALESCE(s.state, 'N/A') as state, 
             s.created_at
      FROM users u
      LEFT JOIN sellers s ON u.id = s.user_id
      WHERE u.role = 'seller' AND u.is_verified = 0
      ORDER BY s.created_at DESC
    `;
    const [rows] = await pool.query(query);
    
    res.status(200).json({ success: true, count: rows.length, sellers: rows });
  } catch (error) {
    console.error("Error fetching pending sellers:", error);
    res.status(500).json({ success: false, message: "Server Error while fetching sellers." });
  }
};

// 2. Approve Seller
export const approveSeller = async (req, res) => {
  const { id } = req.params; // this is user_id
  try {
    const [result] = await pool.query("UPDATE users SET is_verified = 1 WHERE id = ?", [id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Pending seller not found." });
    }

    res.status(200).json({ success: true, message: "Seller account has been approved and activated." });
  } catch (error) {
    console.error("Error approving seller:", error);
    res.status(500).json({ success: false, message: "Server Error while approving seller." });
  }
};

// 3. Reject Seller
export const rejectSeller = async (req, res) => {
  const { id } = req.params; // this is user_id
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // Pehle seller table se data udao taaki foreign key ki error na aaye
    await connection.query("DELETE FROM sellers WHERE user_id = ?", [id]);
    
    // Phir users table se udao
    const [result] = await connection.query("DELETE FROM users WHERE id = ?", [id]);

    if (result.affectedRows === 0) {
      await connection.rollback();
      return res.status(404).json({ success: false, message: "Pending seller not found." });
    }

    await connection.commit();
    res.status(200).json({ success: true, message: "Seller application has been rejected and removed." });
  } catch (error) {
    await connection.rollback();
    console.error("Error rejecting seller:", error);
    res.status(500).json({ success: false, message: "Server Error while rejecting seller." });
  } finally {
    connection.release();
  }
};
