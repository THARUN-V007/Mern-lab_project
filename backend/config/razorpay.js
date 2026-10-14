const Razorpay = require("razorpay");

let razorpayInstance = null;

try {
  razorpayInstance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || "rzp_test_shopkart1234",
    key_secret: process.env.RAZORPAY_KEY_SECRET || "shopkart_secret_5678",
  });
} catch (error) {
  console.warn("⚠️ Razorpay SDK initialization warning:", error.message);
}

module.exports = razorpayInstance;
