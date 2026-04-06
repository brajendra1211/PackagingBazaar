import jwt from "jsonwebtoken";

// 1. Verify Token (Sabhi logged-in users ke liye)
export const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ 
      success: false, 
      message: "Access Denied. No token provided." 
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Token se 'id' aur 'role' req.user mein aa jayega
    next();
  } catch (error) {
    res.status(403).json({ 
      success: false, 
      message: "Invalid or expired token." 
    });
  }
};

// 2. Is Admin? (Sirf Admin access ke liye)
export const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res.status(403).json({ 
      success: false, 
      message: "Access Denied. Admin resources only." 
    });
  }
};

// 3. Is Seller? (Sirf Seller ya Admin access ke liye)
export const isSeller = (req, res, next) => {
  if (req.user && (req.user.role === "seller" || req.user.role === "admin")) {
    next();
  } else {
    res.status(403).json({ 
      success: false, 
      message: "Access Denied. Seller resources only." 
    });
  }
};