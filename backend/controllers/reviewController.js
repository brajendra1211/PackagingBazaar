import pool from '../config/db.js';

// 1. Get Review
export const getAllReviews = async (req, res) => {
    const { product_id, status } = req.query; 
    try {
        let sql = `
            SELECT 
                pr.id, 
                pr.rating, 
                pr.comment, 
                pr.status,
                pr.reviewer_name,
                pr.created_at,
                u.name AS user_name,
                p.name AS product_name
            FROM product_reviews pr
            LEFT JOIN users u ON pr.user_id = u.id
            JOIN products p ON pr.product_id = p.id
        `;
        let params = [];
        let conditions = [];

        if (product_id) {
            conditions.push('pr.product_id = ?');
            params.push(product_id);
        }

        if (status) {
            conditions.push('pr.status = ?');
            params.push(status);
        }

        if (conditions.length > 0) {
            sql += ' WHERE ' + conditions.join(' AND ');
        }

        sql += ' ORDER BY pr.created_at DESC';

        const [rows] = await pool.query(sql, params);
        res.status(200).json(rows);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 2. New Review POST 
export const addReview = async (req, res) => {
    const { product_id, user_id, rating, comment, reviewer_name, status } = req.body;

    // Basic Validation
    if (!product_id || !rating) {
        return res.status(400).json({ message: "Product aur Rating fields zaroori hain!" });
    }

    try {
        const sql = 'INSERT INTO product_reviews (product_id, user_id, reviewer_name, rating, comment, status) VALUES (?, ?, ?, ?, ?, ?)';
        const [result] = await pool.query(sql, [
            product_id, 
            user_id || null, 
            reviewer_name || null, 
            rating, 
            comment || '',
            status || 'approved'
        ]);

        res.status(201).json({
            success: true,
            message: "Review successfully add ho gaya!",
            reviewId: result.insertId
        });
    } catch (error) {
        console.error("Review Error:", error);
        res.status(500).json({ success: false, message: "Server error. Please try again." });
    }
};

// 3. Review DELETE 
export const deleteReview = async (req, res) => {
    const { id } = req.params;
    try {
        const [result] = await pool.query('DELETE FROM product_reviews WHERE id = ?', [id]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Review nahi mila!" });
        }

        res.status(200).json({ success: true, message: "Review delete kar diya gaya." });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 4. Update Review Status (Approve/Pending)
export const updateReviewStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    try {
        const [result] = await pool.query('UPDATE product_reviews SET status = ? WHERE id = ?', [status, id]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Review nahi mila!" });
        }

        res.status(200).json({ success: true, message: `Review status updated to ${status}.` });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};