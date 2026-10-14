const express = require("express");
const router = express.Router();
const protect = require("../middlewares/auth.middleware");
const {
  createPaymentOrder,
  verifyPayment,
  getMyOrders,
  getOrderById,
} = require("../controllers/order.controller");

// Task 4: Create pending ShopKart order and Razorpay order
router.post("/create-payment-order", protect, createPaymentOrder);

// Task 4b & 5: Verify payment signature and clear cart
router.post("/verify-payment", protect, verifyPayment);

// Task 7: Get all orders for the authenticated user
router.get("/", protect, getMyOrders);

// Task 7: Get single order by ID with ownership verification
router.get("/:id", protect, getOrderById);

module.exports = router;
