const jwt = require("jsonwebtoken");
const Customer = require("../models/customer.model");

/**
 * Middleware to protect routes — verifies JWT from HttpOnly cookie
 * and attaches the customer document to req.user
 */
const protect = async (req, res, next) => {
  try {
    // Read JWT from cookie or Authorization Bearer header
    let token = req.cookies?.token;

    if (!token && req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized — no token provided",
      });
    }

    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find the customer and exclude the password field
    const customer = await Customer.findById(decoded.id).select("-password");

    if (!customer) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized — customer not found",
      });
    }

    // Attach customer to request object
    req.user = customer;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized — invalid token",
    });
  }
};

module.exports = protect;
