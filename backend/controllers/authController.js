import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import pool from "../config/db.js";

// 1. SIGN UP (Normal User)
export const register = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    // 🔥 FIX: 'is_verified' explicitly 1 set kiya (Normal user auto-verified)
    const query =
      'INSERT INTO users (name, email, password, role, is_verified) VALUES (?, ?, ?, "user", 1)';
    await pool.query(query, [name, email, hashedPassword]);

    res.status(201).json({ success: true, message: "Account created successfully!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Email already exists or Database error." });
  }
};

// 2. SIGN IN (Login)
export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const [rows] = await pool.query("SELECT * FROM users WHERE email = ?", [email]);
    const user = rows[0];

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found!" });
    }

    // 🔥 FIX: Seller Verification Check
    // Agar user seller hai aur verified nahi hai (0 hai), toh login roko
    if (user.role === "seller" && user.is_verified === 0) {
      return res.status(403).json({ 
        success: false, 
        message: "Aapka account pending hai. Admin approval ke baad login karein." 
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid password!" });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(200).json({
      success: true,
      token,
      role: user.role,
      userName: user.name,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// 3. SELLER REGISTRATION
export const registerSeller = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const {
      ownerName, email, phone, password, businessName, businessType,
      gstNumber, yearEstablished, city, state, address, filmTypes,
      monthlyCapacity, priceRange, description,
    } = req.body;

    // Check Existing User
    const [existingUser] = await connection.query("SELECT id FROM users WHERE email = ?", [email]);
    if (existingUser.length > 0) {
      await connection.rollback();
      return res.status(400).json({ success: false, message: "Email already registered." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // 🔥 FIX: Seller ke liye 'is_verified' 0 set kiya (Admin approve karega)
    const [userResult] = await connection.query(
      "INSERT INTO users (name, email, password, role, is_verified) VALUES (?, ?, ?, 'seller', 0)",
      [ownerName, email, hashedPassword]
    );
    const userId = userResult.insertId;

    const productIdsString = filmTypes && filmTypes.length > 0 ? filmTypes.join(", ") : null;

    // Sellers table entry
    await connection.query(
      `INSERT INTO sellers 
      (user_id, company_name, business_type, gst_number, year_established, city, state, business_address, monthly_capacity, price_range, description, products_offered) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [userId, businessName, businessType, gstNumber, yearEstablished || null, city, state, address, monthlyCapacity, priceRange, description, productIdsString]
    );

    await connection.commit();
    res.status(201).json({
      success: true,
      message: "Application submitted! Admin will verify your account shortly.",
    });
  } catch (error) {
    await connection.rollback();
    console.error("Seller Registration Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  } finally {
    connection.release();
  }
};

// 4. GET CURRENT USER
export const getCurrentUser = async (req, res) => {
  try {
    const userId = req.user.id;
    // 🔥 FIX: Select mein 'is_verified' bhi mangwa lo taaki frontend ko pata rahe status
    const [rows] = await pool.query("SELECT id, name, email, role, is_verified FROM users WHERE id = ?", [userId]);
    
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: "User not found!" });
    }
    
    res.status(200).json({ success: true, user: rows[0] });
  } catch (err) {
    console.error("Error in getCurrentUser:", err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};