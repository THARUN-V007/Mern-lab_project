# 🛒 ShopKart — Modern Full-Stack MERN E-Commerce Platform

A production-ready, full-stack E-Commerce web application built using the **MERN** stack (MongoDB, Express.js, React, Node.js). Features customer authentication, dynamic catalog browsing, real-time search, cart and wishlist management, order processing, and payment gateway readiness.

---

## ✨ Features

- **🔐 Robust Authentication & Security**:
  - Secure registration and login with bcrypt password hashing.
  - JWT token-based authentication stored in `HTTP-only`, `SameSite` cookies to safeguard against XSS and CSRF attacks.
  - Protected customer routes and profile management.

- **🛍️ Product Catalog & Search**:
  - Dynamic product catalog with category badges, pricing, and live inventory status.
  - Real-time search with instant debounce and query matching across titles and descriptions.
  - Detailed product page with dynamic stock status, ratings, and image gallery.

- **🛒 Cart & Wishlist Management**:
  - Persistent shopping cart with quantity controls, subtotal/tax calculation, and instant updates.
  - Dedicated wishlist for saving favorite items with one-click migration to cart.

- **📦 Checkout & Order Processing**:
  - Streamlined checkout flow with multi-step address capture and order summaries.
  - Support for Cash on Delivery (COD) and Razorpay payment integration.
  - Order confirmation screen and persistent "My Orders" order history.

- **🎨 Premium Responsive UI**:
  - Modern CSS, smooth gradients, subtle micro-interactions, and accessible typography.
  - Fully responsive across desktop, tablet, and mobile displays.

---

## 🛠️ Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 19, Vite, React Router v7, Lucide Icons, Axios |
| **Backend** | Node.js, Express.js, JWT (`jsonwebtoken`), `bcrypt`, `cookie-parser`, `cors` |
| **Database** | MongoDB Atlas, Mongoose ODM |
| **Payments** | Razorpay SDK integration (mock / test-mode ready) |
| **Dev Tools** | Concurrently, Nodemon, Oxlint |

---

## 📁 Project Structure

```text
MERN project/
├── .gitignore                  # Root Git ignore rules (prevents .env & node_modules leakage)
├── package.json                # Root package with concurrent dev scripts
├── README.md                   # Complete documentation and setup guide
│
├── backend/
│   ├── .env.example            # Environment template with dummy values
│   ├── config/
│   │   └── razorpay.js         # Razorpay gateway configuration
│   ├── controllers/
│   │   ├── customer.controller.js  # Auth (register, login, profile, logout)
│   │   ├── product.controller.js   # Products fetch & search
│   │   ├── cart.controller.js      # Cart CRUD operations
│   │   ├── wishlist.controller.js  # Wishlist toggle & fetch
│   │   └── order.controller.js     # Order placement & payment verification
│   ├── middlewares/
│   │   └── auth.middleware.js  # JWT cookie verification middleware
│   ├── models/
│   │   ├── customer.model.js   # Customer schema with bcrypt hooks
│   │   ├── product.model.js    # Product schema & inventory
│   │   └── order.model.js      # Order schema & tracking
│   ├── routes/                 # Express REST API routes
│   └── index.js                # Express entrypoint & MongoDB connection
│
└── frontend/
    ├── src/
    │   ├── components/         # Navbar, ProductCard, CartItem, ProtectedRoute, etc.
    │   ├── context/            # AuthContext, CartContext, WishlistContext
    │   ├── pages/              # Home, Products, ProductDetails, Cart, Wishlist, Checkout, MyOrders
    │   ├── services/api.js     # Axios API client configured with credentials
    │   ├── App.jsx             # Route definitions
    │   └── index.css           # Design tokens and styling
    ├── index.html
    └── vite.config.js          # Vite config with backend proxy
```

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Node.js** (v18.x or v20.x recommended)
- **npm** (v9.x or higher)
- **MongoDB Atlas** database connection string (or local MongoDB daemon)

---

### 2. Installation

Clone the repository and install dependencies:

```bash
# Clone the repository
git clone <your-repository-url>
cd "MERN project"

# Install root dependencies (concurrently)
npm install

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install

# Return to root directory
cd ..
```

---

### 3. Environment Variables Setup

Create a `.env` file inside the `backend/` directory using the provided template:

```bash
cp backend/.env.example backend/.env
```

Configure your variables in `backend/.env`:

```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/shopkart?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_jwt_key_here
NODE_ENV=development
RAZORPAY_KEY_ID=rzp_test_your_key_id
RAZORPAY_KEY_SECRET=your_razorpay_secret
```

> **Security Note**: Never commit your `.env` file to version control. The repository includes `.gitignore` rules that prevent any `.env` files or credentials from being committed.

---

### 4. Running the Application

You can start both frontend and backend concurrently from the root directory:

```bash
# Starts backend (port 5000) and frontend (port 3000) simultaneously
npm run dev
```

Alternatively, you can run them in separate terminal windows:

**Terminal 1 — Backend:**
```bash
cd backend
npm run dev
# Server will run at http://localhost:5000
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm run dev
# Client will run at http://localhost:3000
```

Open your browser and visit: `http://localhost:3000`

---

## 📡 API Endpoints Reference

### Authentication (`/customers`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/customers/register` | Register new customer account (`fullName`, `email`, `password`, `phone`) | No |
| `POST` | `/customers/login` | Login and receive HTTP-only JWT cookie | No |
| `GET` | `/customers/me` | Retrieve authenticated customer profile | Yes |
| `POST` | `/customers/logout` | Clear auth cookie | Yes |
| `PATCH` | `/customers/change-password` | Update account password | Yes |

### Products (`/products`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/products` | Get products (supports optional `?search=term` and `?category=Name`) | No |
| `GET` | `/products/:id` | Get details for a single product by ID | No |
| `POST` | `/products` | Create a new product (admin/catalog) | No |

### Cart (`/cart`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/cart` | Get current customer's cart items | Yes |
| `POST` | `/cart/:productId` | Add product to cart (or increment quantity) | Yes |
| `PATCH` | `/cart/:productId` | Update item quantity in cart (`{ quantity }`) | Yes |
| `DELETE` | `/cart/:productId` | Remove product from cart | Yes |

### Wishlist (`/wishlist`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/wishlist` | Get current customer's populated wishlist | Yes |
| `POST` | `/wishlist/:productId` | Add product to wishlist | Yes |
| `DELETE` | `/wishlist/:productId` | Remove product from wishlist | Yes |

### Orders & Checkout (`/orders`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/orders/create-payment-order` | Create order & initiate payment session | Yes |
| `POST` | `/orders/verify-payment` | Verify payment signature and finalize order | Yes |
| `GET` | `/orders` | Fetch all orders for current authenticated user | Yes |
| `GET` | `/orders/:id` | Get single order details by ID | Yes |

---

## 🌐 Deployment Instructions

### Frontend (e.g., Vercel / Netlify)
1. Link your GitHub repository to Vercel or Netlify.
2. Set Root Directory to `frontend`.
3. Build Command: `npm run build`
4. Output Directory: `dist`
5. Configure Environment Variable:
   - `VITE_API_BASE_URL`: URL of your deployed backend (e.g., `https://your-backend.onrender.com`)

### Backend (e.g., Render / Railway)
1. Link your GitHub repository.
2. Set Root Directory to `backend`.
3. Build Command: `npm install`
4. Start Command: `npm start`
5. Add Environment Variables:
   - `PORT`: `5000`
   - `MONGO_URI`: Your MongoDB Atlas connection URI
   - `JWT_SECRET`: Random secure string
   - `NODE_ENV`: `production`

---

## 🔒 Security Compliance Checklist
- [x] No `.env` or sensitive secret files committed or tracked by Git.
- [x] Passwords salted and hashed with `bcrypt`.
- [x] JWT tokens securely transferred via `HTTP-only` and `SameSite` cookie flags.
- [x] CORS configured for authorized frontend origin with credentials enabled.
- [x] Frontend input validation and sanitized backend parameters.

---

## 📄 License
This project is open-source and available under the [MIT License](LICENSE).
