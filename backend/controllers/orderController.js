import pool from "../config/db.js";

// 1. Checkout (Create Order)
export const checkout = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const userId = req.user.id;
    const { addressId, paymentMethod, items, totalPrice } = req.body;

    if (!addressId || !items || items.length === 0) {
      await connection.rollback();
      return res.status(400).json({ success: false, message: "Incomplete checkout data" });
    }

    // Create Order
    const [orderResult] = await connection.query(
      "INSERT INTO orders (user_id, address_id, total_price, payment_method, status) VALUES (?, ?, ?, ?, 'Pending')",
      [userId, addressId, totalPrice, paymentMethod || "COD"]
    );
    const orderId = orderResult.insertId;

    // Create Order Items with Specifications
     for (const item of items) {
      await connection.query(
        "INSERT INTO order_items (order_id, product_id, seller_id, quantity, price_at_time, thickness, width, brand) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        [orderId, item.product_id, item.seller_id, item.quantity, item.price, item.thickness || null, item.width || null, item.brand || null]
      );
    }

    // Clear user cart after successful checkout
    await connection.query("DELETE FROM cart_items WHERE user_id = ?", [userId]);

    await connection.commit();
    res.status(201).json({ success: true, message: "Order placed successfully!", orderId });
  } catch (err) {
    await connection.rollback();
    console.error("Error in checkout:", err);
    res.status(500).json({ success: false, message: "Server Error" });
  } finally {
    connection.release();
  }
};

// 2. Get Order History (User)
export const getMyOrders = async (req, res) => {
  try {
    const userId = req.user.id;
    const [rows] = await pool.query(
      `SELECT o.*, 
       (SELECT JSON_ARRAYAGG(
          JSON_OBJECT(
            'name', p.name, 
            'qty', oi.quantity, 
            'price', oi.price_at_time,
            'thickness', oi.thickness,
            'width', oi.width,
            'brand', oi.brand,
            'seller_id', oi.seller_id
          )
        ) 
        FROM order_items oi 
        JOIN products p ON oi.product_id = p.id 
        WHERE oi.order_id = o.id) as items
       FROM orders o 
       WHERE o.user_id = ? 
       ORDER BY o.order_date DESC`,
      [userId]
    );
    res.status(200).json({ success: true, orders: rows });
  } catch (err) {
    console.error("Error in getMyOrders:", err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
