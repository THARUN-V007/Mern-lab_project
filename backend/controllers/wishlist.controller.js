const mongoose = require("mongoose");
const Customer = require("../models/customer.model");
const Product = require("../models/product.model");

/**
 * Task 2: Add Product to Wishlist API
 * POST /wishlist/:productId
 * Protected: Identifies user from req.user
 */
const addToWishlist = async (req, res) => {
  try {
    const { productId } = req.params;

    // 1. Validate productId format
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    // 2. Check if product exists in database
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // 3. Find current authenticated user
    const user = await Customer.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // 4. Check if already in wishlist (duplicate prevention)
    const alreadyInWishlist =
      user.wishlist &&
      user.wishlist.some((id) => id && id.toString() === productId.toString());

    if (alreadyInWishlist) {
      return res.status(409).json({
        success: false,
        message: "Product already in wishlist",
      });
    }

    // 5. Add product ObjectId reference & save user
    user.wishlist.push(productId);
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Product added to wishlist",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

/**
 * Task 3: Get Current User's Wishlist API
 * GET /wishlist
 * Protected: Populates product references
 */
const getWishlist = async (req, res) => {
  try {
    // Find current user and populate wishlist references
    const user = await Customer.findById(req.user._id).populate({
      path: "wishlist",
      select: "name price category image stock",
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Filter out any null entries (in case referenced product was deleted)
    const validWishlist = (user.wishlist || []).filter((item) => item !== null);

    return res.status(200).json({
      success: true,
      count: validWishlist.length,
      wishlist: validWishlist,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

/**
 * Task 4: Remove Product from Wishlist API
 * DELETE /wishlist/:productId
 * Protected: Removes product reference from user's wishlist
 */
const removeFromWishlist = async (req, res) => {
  try {
    const { productId } = req.params;

    // 1. Validate productId format
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    // 2. Find current authenticated user
    const user = await Customer.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // 3. Check if product is currently in wishlist
    const isInWishlist =
      user.wishlist &&
      user.wishlist.some((id) => id && id.toString() === productId.toString());

    if (!isInWishlist) {
      return res.status(404).json({
        success: false,
        message: "Product not in wishlist",
      });
    }

    // 4. Remove product reference & save user
    user.wishlist = user.wishlist.filter(
      (id) => id && id.toString() !== productId.toString()
    );
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Product removed from wishlist",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

module.exports = {
  addToWishlist,
  getWishlist,
  removeFromWishlist,
};
