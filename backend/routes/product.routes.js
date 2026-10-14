




const express = require("express");
const router = express.Router();

const {
  createProduct,
  getAllProducts,
  getProductById,
} = require("../controllers/product.controller");

// Task 2: Create product (POST /products)
router.post("/", createProduct);

// Task 3 & Task 5: Get all products with dynamic search & category filter (GET /products)
router.get("/", getAllProducts);

// Task 4: Get single product by MongoDB _id (GET /products/:id)
router.get("/:id", getProductById);

module.exports = router;
