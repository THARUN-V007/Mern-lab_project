const mongoose = require("mongoose");
const Customer = require("../models/customer.model");
const Product = require("../models/product.model");

/**
 * Task 2 — Add Product to Cart
 * POST /cart/:productId
 * - If not in cart: adds with quantity = 1
 * - If already in cart: increments quantity by 1
 * - Validates new quantity does not exceed stock
 */
const addToCart = async (req, res) => {
  try {
    const { productId } = req.params;

    // 1. Validate productId format
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    // 2. Check product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // 3. Load authenticated user
    const user = await Customer.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // 4. Find existing cart entry
    const existingIndex = user.cart.findIndex(
      (item) => item.product && item.product.toString() === productId.toString()
    );

    let newQuantity;

    if (existingIndex === -1) {
      // Not in cart — add with quantity 1
      newQuantity = 1;
      if (newQuantity > product.stock) {
        return res.status(400).json({
          success: false,
          message: `Only ${product.stock} unit(s) in stock`,
        });
      }
      user.cart.push({ product: productId, quantity: 1 });
    } else {
      // Already in cart — increment quantity
      newQuantity = user.cart[existingIndex].quantity + 1;
      if (newQuantity > product.stock) {
        return res.status(400).json({
          success: false,
          message: `Cannot add more — only ${product.stock} unit(s) in stock`,
        });
      }
      user.cart[existingIndex].quantity = newQuantity;
    }

    await user.save();

    // Reload with populated products for response
    const updated = await Customer.findById(req.user._id).populate({
      path: "cart.product",
      select: "name price image stock category",
    });

    return res.status(200).json({
      success: true,
      message: "Cart updated",
      cart: updated.cart,
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
 * Task 3 — Get Current User's Cart
 * GET /cart
 * Returns populated cart items with product details + quantity
 */
const getCart = async (req, res) => {
  try {
    const user = await Customer.findById(req.user._id).populate({
      path: "cart.product",
      select: "name price image stock category",
    });

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Filter out items whose product reference was deleted
    const validCart = user.cart.filter((item) => item.product !== null);

    return res.status(200).json({
      success: true,
      cart: validCart,
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
 * Task 4 — Update Quantity
 * PATCH /cart/:productId
 * Body: { quantity: Number }
 */
const updateCartQuantity = async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;

    // 1. Validate productId format
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    // 2. Validate quantity type and minimum
    const qty = Number(quantity);
    if (isNaN(qty) || qty < 1) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be a number and at least 1",
      });
    }

    // 3. Check product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    // 4. Validate against stock
    if (qty > product.stock) {
      return res.status(400).json({
        success: false,
        message: `Only ${product.stock} unit(s) in stock`,
      });
    }

    // 5. Load user
    const user = await Customer.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // 6. Find cart item
    const itemIndex = user.cart.findIndex(
      (item) => item.product && item.product.toString() === productId.toString()
    );
    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Product not in cart",
      });
    }

    // 7. Update quantity
    user.cart[itemIndex].quantity = qty;
    await user.save();

    const updated = await Customer.findById(req.user._id).populate({
      path: "cart.product",
      select: "name price image stock category",
    });

    return res.status(200).json({
      success: true,
      message: "Quantity updated",
      cart: updated.cart,
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
 * Task 5 — Remove Product from Cart
 * DELETE /cart/:productId
 */
const removeFromCart = async (req, res) => {
  try {
    const { productId } = req.params;

    // 1. Validate productId format
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    // 2. Load user
    const user = await Customer.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // 3. Check item exists in cart
    const itemExists = user.cart.some(
      (item) => item.product && item.product.toString() === productId.toString()
    );
    if (!itemExists) {
      return res.status(404).json({
        success: false,
        message: "Product not in cart",
      });
    }

    // 4. Remove item
    user.cart = user.cart.filter(
      (item) => item.product && item.product.toString() !== productId.toString()
    );
    await user.save();

    const updated = await Customer.findById(req.user._id).populate({
      path: "cart.product",
      select: "name price image stock category",
    });

    return res.status(200).json({
      success: true,
      message: "Product removed from cart",
      cart: updated.cart,
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
  addToCart,
  getCart,
  updateCartQuantity,
  removeFromCart,
};
