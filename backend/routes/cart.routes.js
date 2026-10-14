const express = require("express");
const router = express.Router();
const protect = require("../middlewares/auth.middleware");
const {
  addToCart,
  getCart,
  updateCartQuantity,
  removeFromCart,
} = require("../controllers/cart.controller");

// All cart routes require authentication
router.use(protect);

// Task 3: GET /cart — Get current user's cart
router.get("/", getCart);

// Task 2: POST /cart/:productId — Add product to cart
router.post("/:productId", addToCart);

// Task 4: PATCH /cart/:productId — Update quantity
router.patch("/:productId", updateCartQuantity);

// Task 5: DELETE /cart/:productId — Remove product
router.delete("/:productId", removeFromCart);

module.exports = router;
