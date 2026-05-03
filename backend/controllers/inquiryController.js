import pool from "../config/db.js";

// 1. Submit a Buyer Inquiry (Lead)
export const submitInquiry = async (req, res) => {
    //console.log("Submit Inquiry Request Body:", req.body);
    try {
        const { 
            product_id, 
            message, 
            quantity, 
            thickness, 
            width, 
            phone, 
            pincode, 
            city,
            state,
            address,
            buyer_name, 
            buyer_email 
        } = req.body;

        const buyer_id = req.user?.id || null;

        if (!product_id) {
            return res.status(400).json({ success: false, message: "Product ID is required." });
        }

        // First, get the seller_id for this product (check master table or seller_products listing)
        const [pRows] = await pool.query(`
            SELECT COALESCE(p.seller_id, sp.seller_id) as seller_id 
            FROM products p
            LEFT JOIN seller_products sp ON p.id = sp.product_id
            WHERE p.id = ?
            LIMIT 1
        `, [product_id]);

        if (pRows.length === 0) {
            return res.status(404).json({ success: false, message: `Product ID ${product_id} not found.` });
        }

        const seller_id = pRows[0].seller_id;
        if (!seller_id) {
            console.error("Seller ID missing for product:", product_id);
            return res.status(400).json({ success: false, message: "Error: No manufacturer linked to this product." });
        }

        const query = `
            INSERT INTO inquiries 
            (buyer_id, product_id, seller_id, message, quantity_required, thickness, width, phone, pincode, city, state, address, buyer_name, buyer_email) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const values = [
            buyer_id,
            product_id,
            seller_id,
            message  ,
            quantity ,
            thickness || null,
            width || null,
            phone || null,
            pincode || null,
            city || null,
            state || null,
            address || null,
            buyer_name || null,
            buyer_email || null
        ];

        try {
            const [result] = await pool.query(query, values);
            res.status(201).json({
                success: true,
                message: "Requirement sent successfully",
                leadId: result.insertId
            });
        } catch (dbError) {
            console.error("DATABASE ERROR during inquiry submission:", dbError);
            res.status(500).json({ success: false, message: "Database Error: Could not save inquiry." });
        }
    } catch (err) {
        console.error("CRITICAL ERROR in submitInquiry controller:", err);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};


// 3. Get Inquiries sent by a Buyer (User dashboard)
export const getBuyerInquiries = async (req, res) => {
    try {
        const buyer_id = req.user.id;

        const query = `
            SELECT i.*, p.name as product_name, p.image_url, s.company_name as seller_name
            FROM inquiries i
            JOIN products p ON i.product_id = p.id
            JOIN sellers s ON i.seller_id = s.id
            WHERE i.buyer_id = ?
            ORDER BY i.created_at DESC
        `;

        const [rows] = await pool.query(query, [buyer_id]);

        res.status(200).json({ success: true, inquiries: rows });
    } catch (err) {
        console.error("Error fetching buyer inquiries:", err);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

// 4. Share Lead to Seller (Admin Only)
export const shareLeadToSeller = async (req, res) => {
    try {
        const { id } = req.params; // inquiry_id
        const { seller_id: providedSellerId, assignment_note } = req.body;

        let seller_id = providedSellerId;

        // If seller_id is not provided, use the original one from the inquiry
        if (!seller_id) {
            const [rows] = await pool.query("SELECT seller_id FROM inquiries WHERE id = ?", [id]);
            if (rows.length === 0) return res.status(404).json({ success: false, message: "Inquiry not found" });
            seller_id = rows[0].seller_id;
        }

        // Insert into lead_assignments (using IGNORE or ON DUPLICATE to avoid duplicates)
        const query = `
            INSERT INTO lead_assignments (inquiry_id, seller_id, assignment_note) 
            VALUES (?, ?, ?) 
            ON DUPLICATE KEY UPDATE assignment_note = VALUES(assignment_note)
        `;
        await pool.query(query, [id, seller_id, assignment_note || null]);

        // Also mark the inquiry as assigned (legacy support)
        await pool.query("UPDATE inquiries SET is_assigned = 1, assigned_at = NOW() WHERE id = ?", [id]);

        res.status(200).json({ success: true, message: "Lead shared successfully!" });
    } catch (err) {
        console.error("Error sharing lead:", err);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

// 5. Get Leads Assigned to a Seller (Seller Dashboard)
export const getSellerLeads = async (req, res) => {
    try {
        const userId = req.user.id;

        // Get seller_id from user_id
        const [sellerRows] = await pool.query("SELECT id FROM sellers WHERE user_id = ?", [userId]);
        if (sellerRows.length === 0) {
            return res.status(404).json({ success: false, message: "Seller profile not found." });
        }
        const seller_id = sellerRows[0].id;
        //console.log("DEBUG: getSellerLeads - Fetching leads for seller_id:", seller_id);

        // Fetch from lead_assignments table
        const query = `
            SELECT i.*, p.name as product_name, p.image_url, p.color,
                   COALESCE(
                     sp.delivery_hours,
                     (SELECT MIN(sp2.delivery_hours) FROM seller_products sp2 WHERE sp2.product_id = i.product_id AND sp2.delivery_hours IS NOT NULL),
                     p.delivery_time
                   ) as delivery_hours,
                   la.assigned_at, la.assignment_note
            FROM lead_assignments la
            JOIN inquiries i ON la.inquiry_id = i.id
            JOIN products p ON i.product_id = p.id
            LEFT JOIN seller_products sp ON i.product_id = sp.product_id AND sp.seller_id = la.seller_id
            WHERE la.seller_id = ?
            ORDER BY la.assigned_at DESC
        `;

        const [rows] = await pool.query(query, [seller_id]);
        //console.log(`DEBUG: getSellerLeads - Found ${rows.length} leads.`);

        res.status(200).json({ success: true, data: rows });
    } catch (err) {
        console.error("Error fetching seller leads:", err);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};


