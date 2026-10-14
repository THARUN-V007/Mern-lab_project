const mongoose = require("mongoose");
const Product = require("../models/product.model");

/**
 * Helper to escape regex special characters
 */
function escapeRegex(text) {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
}

/**
 * Task 2: Create Product API
 * POST /products
 */
const createProduct = async (req, res) => {
  try {
    const { name, description, price, category, image, stock } = req.body;

    // 1. Check for missing required fields
    if (
      !name ||
      !description ||
      price === undefined ||
      price === null ||
      !category ||
      !image ||
      stock === undefined ||
      stock === null
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields (name, description, price, category, image, stock) are required",
      });
    }

    // 2. Validate price (must be a number and greater than 0)
    const numPrice = Number(price);
    if (isNaN(numPrice) || numPrice <= 0) {
      return res.status(400).json({
        success: false,
        message: "Price must be a number greater than 0",
      });
    }

    // 3. Validate stock (must be a number and minimum 0)
    const numStock = Number(stock);
    if (isNaN(numStock) || numStock < 0) {
      return res.status(400).json({
        success: false,
        message: "Stock must be a non-negative number",
      });
    }

    // 4. Create and save new product
    const product = await Product.create({
      name: String(name).trim(),
      description: String(description).trim(),
      price: numPrice,
      category: String(category).trim(),
      image: String(image).trim(),
      stock: numStock,
    });

    // Return status 201 with the created product
    return res.status(201).json(product);
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

/**
 * Task 3 & Task 5: Get All Products API with Search & Category Filtering
 * GET /products
 * Supports:
 *   ?search=keyboard       (case-insensitive match on name)
 *   ?category=Electronics  (category filter)
 *   ?search=keyboard&category=Electronics (combined)
 */
const getAllProducts = async (req, res) => {
  try {
    const { search, category } = req.query;
    const filter = {};

    // Task 5: Search - case-insensitive on product name
    if (search && search.trim()) {
      filter.name = { $regex: escapeRegex(search.trim()), $options: "i" };
    }

    // Task 5: Category - filter by category (ignoring "All" placeholder)
    if (category && category.trim() && category.trim().toLowerCase() !== "all") {
      filter.category = { $regex: new RegExp(`^${escapeRegex(category.trim())}$`, "i") };
    }

    // Task 3: Fetch matching products, selecting only fields needed by listing UI
    // Exclude internal Mongoose fields and unneeded listing fields
    const products = await Product.find(filter).select("name price category image stock");

    return res.status(200).json({
      success: true,
      count: products.length,
      products,
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
 * Task 4: Get Single Product API
 * GET /products/:id
 */
const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    // Failure Case 1: Invalid product ID -> status 400
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    // Fetch product by MongoDB _id (excludes __v)
    const product = await Product.findById(id).select("-__v");

    // Failure Case 2: Product not found -> status 404
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Success -> status 200 with the product
    return res.status(200).json(product);
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

module.exports = {
  createProduct,
  getAllProducts,
  getProductById,
};
