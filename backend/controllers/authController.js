import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import pool from "../config/db.js";

// 1. SIGN UP (Register)
export const register = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    // Password ko hash karna zaroori hai security ke liye
    const hashedPassword = await bcrypt.hash(password, 10);

    const query =
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, "user")';
    await pool.query(query, [name, email, hashedPassword]);

    res
      .status(201)
      .json({ success: true, message: "Account created successfully!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Email already exists or Database error.",
    });
  }
};

// 2. SIGN IN (Login)
export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const [rows] = await pool.query("SELECT * FROM users WHERE email = ?", [
      email,
    ]);
    const user = rows[0];

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found!" });
    }

    // Password check
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid password!" });
    }

    // JWT Token generate karna (Payload mein id aur role daal rahe hain)
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
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

///////////

export const registerSeller = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    // 1. Transaction Start
    await connection.beginTransaction();

    const {
      ownerName,
      email,
      phone,
      password,
      businessName,
      businessType,
      gstNumber,
      yearEstablished,
      city,
      state,
      address,
      filmTypes, // <--- Frontend se IDs ka array aayega: [1, 3, 4]
      monthlyCapacity,
      priceRange,
      description,
    } = req.body;

    // 2. Check Existing User/GST
    const [existingUser] = await connection.query(
      "SELECT id FROM users WHERE email = ?",
      [email],
    );
    if (existingUser.length > 0) {
      await connection.rollback(); // Rollback zaroori hai response se pehle
      return res
        .status(400)
        .json({ success: false, message: "Email already registered." });
    }

    const [existingGST] = await connection.query(
      "SELECT id FROM sellers WHERE gst_number = ?",
      [gstNumber],
    );
    if (existingGST.length > 0) {
      await connection.rollback();
      return res
        .status(400)
        .json({ success: false, message: "GST Number already registered." });
    }

    // 3. Password Hash
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4. USERS table mein entry (Role: 'seller')
    const [userResult] = await connection.query(
      "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, 'seller')",
      [ownerName, email, hashedPassword],
    );
    const userId = userResult.insertId;

    // 5. IDs ke Array ko String mein badlo (e.g., "1, 3, 4")
    // 🔥 Aman, yahan hum join use kar rahe hain taaki string DB mein jaye
    const productIdsString =
      filmTypes && filmTypes.length > 0 ? filmTypes.join(", ") : null;

    // 6. SELLERS table mein detail entry
    await connection.query(
      `INSERT INTO sellers 
      (user_id, company_name, business_type, gst_number, year_established, city, state, business_address, monthly_capacity, price_range, description, products_offered) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        businessName,
        businessType,
        gstNumber,
        yearEstablished || null,
        city,
        state,
        address,
        monthlyCapacity,
        priceRange,
        description,
        productIdsString,
      ],
    );

    // 7. Success! Commit Transaction
    await connection.commit();

    res.status(201).json({
      success: true,
      message:
        "Seller application submitted! Our team will verify your GST details.",
    });
  } catch (error) {
    // 8. Rollback on Error
    await connection.rollback();
    console.error("Seller Registration Error:", error);
    res.status(500).json({
      success: false,
      message: "Server Error. Please try again later.",
    });
  } finally {
    // 9. Connection release
    connection.release();
  }
};
