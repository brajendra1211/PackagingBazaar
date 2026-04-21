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
