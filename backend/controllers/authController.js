import bcrypt from "bcryptjs";
import pool from "../config/db.js";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { validateEmail, validateMobile, validateGST, validatePassword } from "../utils/validation.js";

const generateSellerUID = () => `PB-S-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;

// 1. SIGN UP (Normal User)
export const register = async (req, res) => {
  const { name, email, password, mobile } = req.body;
  try {
    // Validation
    if (!name || !email || !password || !mobile) {
      return res.status(400).json({ success: false, message: "All fields are required." });
    }
    if (!validateEmail(email)) return res.status(400).json({ success: false, message: "Invalid email format." });
    if (!validateMobile(mobile)) return res.status(400).json({ success: false, message: "Mobile number must be exactly 10 digits." });
    if (!validatePassword(password)) return res.status(400).json({ success: false, message: "Password must be at least 6 characters." });

    const hashedPassword = await bcrypt.hash(password, 10);

    // FIX: 'is_verified' explicitly set to 1 (Normal user auto-verified)
    const query =
      'INSERT INTO users (name, email, mobile, password, role, is_verified) VALUES (?, ?, ?, ?, "user", 1)';
    await pool.query(query, [name, email, mobile, hashedPassword]);

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

    // FIX: Seller Verification Check
    // If the user is a seller and not verified (is_verified is 0), prevent login
    if (user.role === "seller" && user.is_verified === 0) {
      return res.status(403).json({ 
        success: false, 
        message: "Your account is pending. Please login after admin approval." 
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid password!" });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role, userName: user.name, is_verified: user.is_verified },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(200).json({
      success: true,
      token,
      role: user.role,
      userName: user.name,
      is_verified: user.is_verified,
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
      ownerName, email, password, mobile, businessName, businessType,
      gstNumber, yearEstablished, pincode, city, state, address, filmTypes,
      monthlyCapacity, priceRange, description,
    } = req.body;

    // GST Certificate validation
    if (!req.file) {
      return res.status(400).json({ success: false, message: "GST Certificate is mandatory." });
    }

    const gstCertificatePath = `uploads/gst_certificates/${req.file.filename}`;

    // Validation
    if (!ownerName || !email || !password || !businessName || !gstNumber) {
      if (req.file) fs.unlinkSync(req.file.path); // Delete uploaded file if validation fails
      return res.status(400).json({ success: false, message: "Missing required fields." });
    }
    if (!validateEmail(email)) return res.status(400).json({ success: false, message: "Invalid email format." });
    if (!validateGST(gstNumber)) return res.status(400).json({ success: false, message: "Invalid GST number format." });
    if (!validatePassword(password)) return res.status(400).json({ success: false, message: "Password must be at least 6 characters." });

    // Check Existing User
    const [existingUser] = await connection.query("SELECT id FROM users WHERE email = ?", [email]);
    if (existingUser.length > 0) {
      await connection.rollback();
      if (req.file) fs.unlinkSync(req.file.path);
      return res.status(400).json({ success: false, message: "Email already registered." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [userResult] = await connection.query(
      "INSERT INTO users (name, email, `mobile`, password, role, is_verified) VALUES (?, ?, ?, ?, 'seller', 0)",
      [ownerName, email, mobile ? String(mobile).trim() : null, hashedPassword]
    );
    const userId = userResult.insertId;

    // Film types handling (might come as a string or array depending on FormData)
    let productIdsString = null;
    if (filmTypes) {
      productIdsString = Array.isArray(filmTypes) ? filmTypes.join(", ") : filmTypes;
    }
    
    const businessTypeString = Array.isArray(businessType) ? businessType.join(", ") : businessType;

    const sellerUID = generateSellerUID();

    await connection.query(
      `INSERT INTO sellers 
      (user_id, \`mobile\`, status, seller_uid, company_name, business_type, gst_number, gst_certificate, year_established, city, state, pincode, business_address, monthly_capacity, price_range, description, products_offered) 
      VALUES (?, ?, 'pending', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId, 
        mobile ? String(mobile).trim() : null, 
        sellerUID, 
        businessName, 
        businessTypeString, 
        gstNumber, 
        gstCertificatePath,
        yearEstablished || null, 
        city, 
        state, 
        pincode || null, 
        address, 
        monthlyCapacity, 
        priceRange, 
        description, 
        productIdsString
      ]
    );

    await connection.commit();
    res.status(201).json({
      success: true,
      message: "Application submitted! Admin will verify your account shortly.",
    });
  } catch (error) {
    await connection.rollback();
    if (req.file) fs.unlinkSync(req.file.path);
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
    // FIX: Include 'is_verified' and 'mobile' to inform the frontend of the status
    const [rows] = await pool.query("SELECT id, name, email, mobile, role, is_verified FROM users WHERE id = ?", [userId]);
    
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: "User not found!" });
    }
    
    res.status(200).json({ success: true, user: rows[0] });
  } catch (err) {
    console.error("Error in getCurrentUser:", err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};