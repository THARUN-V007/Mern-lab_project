const jwt = require("jsonwebtoken");

/**
 * Generates a JWT token and sets it as an HttpOnly cookie
 * @param {string} userId - The customer's MongoDB _id
 * @param {object} res - Express response object
 * @returns {string} The generated JWT token
 */
const generateToken = (userId, res) => {
  const token = jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

  // Set JWT as HttpOnly cookie
  res.cookie("token", token, {
    httpOnly: true,                                    // Prevents client-side JS access
    secure: process.env.NODE_ENV === "production",     // HTTPS only in production
    sameSite: "strict",                                // CSRF protection
    maxAge: 7 * 24 * 60 * 60 * 1000,                  // 7 days in milliseconds
  });

  return token;
};

module.exports = generateToken;
