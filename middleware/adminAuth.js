const jwt = require("jsonwebtoken");

const adminAuthentication = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
    } else if (req.cookies && req.cookies.adminJwt) {
      token = req.cookies.adminJwt;
    }

    if (!token) {
      return res.status(401).json({ success: false, message: "Not authorized as admin, no token" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // We can assume if token is valid and role is admin, they are good. 
    // Usually we check db, but keeping it simple for admin if role is embedded
    if (decoded.role !== "admin") {
       return res.status(403).json({ success: false, message: "Not authorized, requires admin role" });
    }

    req.admin = decoded;
    next();
  } catch (error) {
    console.error("Admin Auth Middleware Error:", error.message);
    res.status(401).json({ success: false, message: "Not authorized as admin, token failed" });
  }
};

module.exports = { adminAuthentication };