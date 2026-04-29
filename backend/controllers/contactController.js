import pool from "../config/db.js";

// @desc    Submit a contact message
// @route   POST /api/contact
// @access  Public
export const submitContactMessage = async (req, res) => {
  try {
    const { name, company_name, email, phone, subject, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ success: false, message: "Please provide name, email and message." });
    }

    const query = `
      INSERT INTO contact_messages (name, company_name, email, phone, subject, message)
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    await pool.query(query, [name, company_name, email, phone, subject, message]);

    res.status(201).json({
      success: true,
      message: "Your message has been sent successfully. We will get back to you soon.",
    });
  } catch (error) {
    console.error("Error in submitContactMessage:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// @desc    Get all contact messages (Admin Only)
// @route   GET /api/admin/contacts
// @access  Private/Admin
export const getAllContactMessages = async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM contact_messages ORDER BY created_at DESC");

    res.status(200).json({
      success: true,
      count: rows.length,
      data: rows,
    });
  } catch (error) {
    console.error("Error in getAllContactMessages:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// @desc    Update contact message status
// @route   PUT /api/admin/contacts/:id
// @access  Private/Admin
export const updateContactStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    await pool.query("UPDATE contact_messages SET status = ? WHERE id = ?", [status, id]);

    res.status(200).json({
      success: true,
      message: "Status updated successfully.",
    });
  } catch (error) {
    console.error("Error in updateContactStatus:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
