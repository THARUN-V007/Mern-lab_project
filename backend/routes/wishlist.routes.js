const express = require("express");
const router = express.Router();
const protect = require("../middlewares/auth.middleware");
const {
  addToWishlist,
  getWishlist,
  removeFromWishlist,
} = require("../controllers/wishlist.controller");

// All wishlist routes require authentication (protect middleware)
router.use(protect);

// Task 3: GET /wishlist (Get current authenticated user's wishlist)
router.get("/", getWishlist);

// Task 2: POST /wishlist/:productId (Add product to wishlist)
router.post("/:productId", addToWishlist);

// Task 4: DELETE /wishlist/:productId (Remove product from wishlist)
router.delete("/:productId", removeFromWishlist);

module.exports = router;
