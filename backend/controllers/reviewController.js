import pool from '../config/db.js';

// 1. Get Review
export const getAllReviews = async (req, res) => {
    const { product_id } = req.query; 
    try {
        let sql = `
            SELECT 
                pr.id, 
                pr.rating, 
                pr.comment, 
                pr.created_at,
                u.name AS user_name,
                p.name AS product_name
            FROM product_reviews pr
            JOIN users u ON pr.user_id = u.id
            JOIN products p ON pr.product_id = p.id
        `;
        let params = [];

        if (product_id) {
            sql += ' WHERE pr.product_id = ?';
            params.push(product_id);
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
    const { product_id, user_id, rating, comment } = req.body;

    // Basic Validation
    if (!product_id || !user_id || !rating) {
        return res.status(400).json({ message: "Product, User aur Rating fields zaroori hain!" });
    }

    try {
        const sql = 'INSERT INTO product_reviews (product_id, user_id, rating, comment) VALUES (?, ?, ?, ?)';
        const [result] = await pool.query(sql, [product_id, user_id, rating, comment]);

        res.status(201).json({
            success: true,
            message: "Review successfully add ho gaya!",
            reviewId: result.insertId
        });
    } catch (error) {
    
        res.status(500).json({ success: false, message: "Invalid User ya Product ID." });
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