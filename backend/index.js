const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const cors = require("cors");
require("dotenv").config();

const customerRoutes = require("./routes/customer.routes");
const productRoutes = require("./routes/product.routes");
const wishlistRoutes = require("./routes/wishlist.routes");
const cartRoutes = require("./routes/cart.routes");
const orderRoutes = require("./routes/order.routes");

const app = express();

// ─── Middleware ──────────────────────────────────────────────────────────────
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: ["http://localhost:3000", "http://localhost:5173"], // Frontend URLs
    credentials: true,              // Allow cookies to be sent
  })
);

// ─── API Routes ─────────────────────────────────────────────────────────────
app.use("/customers", customerRoutes);
app.use("/products", productRoutes);
app.use("/wishlist", wishlistRoutes);
app.use("/cart", cartRoutes);
app.use("/orders", orderRoutes);

// ─── API Root / Health Endpoint ─────────────────────────────────────────────
app.get("/api", (req, res) => {
  res.json({ success: true, message: "ShopKart Backend API is running" });
});

// ─── Serve Frontend (Single-Port Server & Production Mode) ───────────────────
const path = require("path");
const fs = require("fs");
const frontendDist = path.join(__dirname, "../frontend/dist");

if (fs.existsSync(frontendDist)) {
  // If API client explicitly requests JSON on root, return JSON status
  app.get("/", (req, res, next) => {
    const isJson = (req.headers.accept && req.headers.accept.includes("application/json")) ||
                   (req.headers["content-type"] && req.headers["content-type"].includes("application/json"));
    if (isJson) {
      return res.json({ success: true, message: "ShopKart Backend API is running" });
    }
    next();
  });

  app.use(express.static(frontendDist));

  // SPA fallback for all remaining client-side routes
  app.get("*", (req, res) => {
    res.sendFile(path.join(frontendDist, "index.html"));
  });
} else {
  app.get("/", (req, res) => {
    res.json({ success: true, message: "ShopKart Backend API is running" });
  });
}

// ─── Database Connection & Server Start ─────────────────────────────────────
const PORT = process.env.PORT || 5000;
let isServerRunning = false;

const connectDB = async () => {
  try {
    console.log("Connecting to MongoDB Atlas...");
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 3000,
    });
    console.log("✅ MongoDB Atlas connected successfully");
  } catch (error) {
    console.warn("⚠️ Atlas connection failed (IP not whitelisted). Initializing in-memory MongoDB fallback...");
    try {
      const { MongoMemoryServer } = require("mongodb-memory-server");
      const mongod = await MongoMemoryServer.create();
      const uri = mongod.getUri();
      await mongoose.connect(uri);
      console.log("✅ In-memory MongoDB connected successfully!");
    } catch (memErr) {
      console.error("❌ Failed to start in-memory MongoDB:", memErr.message);
      process.exit(1);
    }
  }

  try {
    console.log("Checking and seeding products if empty...");
    const Product = require("./models/product.model");
    const count = await Product.countDocuments();
    if (count === 0) {
      await Product.insertMany([
        {
          name: "Mechanical Keyboard",
          description: "RGB backlit mechanical gaming keyboard with responsive blue switches and durable aluminum frame.",
          price: 2999,
          category: "Electronics",
          image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=600&q=80",
          stock: 10,
        },
        {
          name: "Noise Cancelling Headphones",
          description: "Wireless over-ear headphones featuring hybrid active noise cancellation and 40-hour battery life.",
          price: 4999,
          category: "Electronics",
          image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80",
          stock: 25,
        },
        {
          name: "Smartphone Pro 5G",
          description: "Flagship smartphone with 120Hz AMOLED display, triple camera array, and all-day fast charging.",
          price: 34999,
          category: "Electronics",
          image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=600&q=80",
          stock: 8,
        },
        {
          name: "Cotton Casual T-Shirt",
          description: "100% combed organic cotton classic crewneck tee with a breathable, relaxed fit.",
          price: 799,
          category: "Fashion",
          image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=600&q=80",
          stock: 45,
        },
        {
          name: "Slim Fit Denim Jacket",
          description: "Timeless trucker denim jacket made from vintage washed cotton with metal button closures.",
          price: 2499,
          category: "Fashion",
          image: "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&w=600&q=80",
          stock: 15,
        },
        {
          name: "The Pragmatic Programmer",
          description: "Classic programming guide by David Thomas and Andrew Hunt on software craftsmanship and career growth.",
          price: 1299,
          category: "Books",
          image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80",
          stock: 20,
        },
        {
          name: "Clean Code Handbook",
          description: "Must-read guide by Robert C. Martin on writing elegant, readable, and maintainable software.",
          price: 1499,
          category: "Books",
          image: "https://images.unsplash.com/photo-1532012164546-f432f2e3777f?auto=format&fit=crop&w=600&q=80",
          stock: 18,
        },
        {
          name: "Ceramic Pour-Over Coffee Dripper",
          description: "Handcrafted matte ceramic coffee dripper for barista-quality manual drip brew extraction at home.",
          price: 899,
          category: "Home",
          image: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=600&q=80",
          stock: 30,
        },
        {
          name: "Minimalist Wooden Desk Lamp",
          description: "Warm LED dimmable desk lamp with solid beech wood arm and matte aluminum shade.",
          price: 1799,
          category: "Home",
          image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=600&q=80",
          stock: 10,
        },
      ]);
      console.log("🌱 Demo products seeded successfully!");
    }

    // Seed default demo user if not exists
    const Customer = require("./models/customer.model");
    const demoUser = await Customer.findOne({ email: "test@example.com" });
    if (!demoUser) {
      await Customer.create({
        fullName: "Demo Customer",
        email: "test@example.com",
        password: "password123",
        phone: "9876543210",
      });
      console.log("👤 Demo customer seeded: test@example.com / password123");
    }
  } catch (seedErr) {
    console.warn("⚠️ Seeding error:", seedErr.message);
  }

  if (!isServerRunning) {
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      isServerRunning = true;
    });
  }
};

connectDB();
