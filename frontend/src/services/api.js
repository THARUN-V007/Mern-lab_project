import axios from 'axios';

// Create base Axios instance with cookies enabled
const client = axios.create({
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

/* ═══════════════════════════════════════════════
   Customer Authentication & Profile APIs
   ═══════════════════════════════════════════════ */

export const registerCustomer = async (data) => {
  const response = await client.post('/customers/register', data);
  return response.data;
};

export const loginCustomer = async (data) => {
  const response = await client.post('/customers/login', data);
  return response.data;
};

export const getProfile = async () => {
  const response = await client.get('/customers/me');
  return response.data;
};

export const logoutCustomer = async () => {
  const response = await client.post('/customers/logout');
  return response.data;
};

export const changePassword = async (data) => {
  const response = await client.patch('/customers/change-password', data);
  return response.data;
};

/* ═══════════════════════════════════════════════
   Product APIs (Tasks 6, 7 & 8)
   ═══════════════════════════════════════════════ */

/**
 * Task 6 & 7: Fetch products with optional search and category filters
 * @param {Object} params - { search, category }
 */
export const getProducts = async (params = {}) => {
  const cleanParams = {};
  if (params.search && params.search.trim()) {
    cleanParams.search = params.search.trim();
  }
  if (params.category && params.category !== 'All Categories' && params.category.toLowerCase() !== 'all') {
    cleanParams.category = params.category.trim();
  }

  const response = await client.get('/products', { params: cleanParams });
  return response.data;
};

/**
 * Task 8: Fetch single product by MongoDB _id
 * @param {string} id - Product _id
 */
export const getProductById = async (id) => {
  const response = await client.get(`/products/${id}`);
  return response.data;
};

/**
 * Create a new product (Task 2)
 * @param {Object} data - Product details
 */
export const createProduct = async (data) => {
  const response = await client.post('/products', data);
  return response.data;
};

/* ═══════════════════════════════════════════════
   Wishlist APIs (Tasks 2, 3 & 4)
   ═══════════════════════════════════════════════ */

/**
 * Task 2: Add product to wishlist
 * POST /wishlist/:productId
 */
export const addToWishlist = async (productId) => {
  const response = await client.post(`/wishlist/${productId}`);
  return response.data;
};

/**
 * Task 3: Get current authenticated user's wishlist
 * GET /wishlist
 */
export const getWishlist = async () => {
  const response = await client.get('/wishlist');
  return response.data;
};

/**
 * Task 4: Remove product from wishlist
 * DELETE /wishlist/:productId
 */
export const removeFromWishlist = async (productId) => {
  const response = await client.delete(`/wishlist/${productId}`);
  return response.data;
};

/* ═══════════════════════════════════════════════
   Cart APIs (Lab 05 — Tasks 2–5)
   ═══════════════════════════════════════════════ */

/**
 * Task 2: Add product to cart (or increment quantity)
 * POST /cart/:productId
 */
export const addToCart = async (productId) => {
  const response = await client.post(`/cart/${productId}`);
  return response.data;
};

/**
 * Task 3: Get current authenticated user's cart
 * GET /cart
 */
export const getCart = async () => {
  const response = await client.get('/cart');
  return response.data;
};

/**
 * Task 4: Update quantity for a cart item
 * PATCH /cart/:productId
 */
export const updateCartQuantity = async (productId, quantity) => {
  const response = await client.patch(`/cart/${productId}`, { quantity });
  return response.data;
};

/**
 * Task 5: Remove product from cart
 * DELETE /cart/:productId
 */
export const removeFromCart = async (productId) => {
  const response = await client.delete(`/cart/${productId}`);
  return response.data;
};

/* ═══════════════════════════════════════════════
   Order & Payment APIs (Lab 06)
   ═══════════════════════════════════════════════ */

/**
 * Task 4: Create pending ShopKart order and Razorpay order
 * POST /orders/create-payment-order
 * @param {Object} data - { shippingAddress: { fullName, phone, addressLine1, city, state, pincode } }
 */
export const createPaymentOrder = async (data) => {
  const response = await client.post('/orders/create-payment-order', data);
  return response.data;
};

/**
 * Task 4b & 5: Verify Razorpay payment signature and clear cart
 * POST /orders/verify-payment
 * @param {Object} data - { razorpayOrderId, razorpayPaymentId, signature }
 */
export const verifyPayment = async (data) => {
  const response = await client.post('/orders/verify-payment', data);
  return response.data;
};

/**
 * Task 7: Fetch all orders for current authenticated user
 * GET /orders
 */
export const getMyOrders = async () => {
  const response = await client.get('/orders');
  return response.data;
};

/**
 * Task 7: Fetch single order by ID
 * GET /orders/:id
 * @param {string} id - Order _id
 */
export const getOrderById = async (id) => {
  const response = await client.get(`/orders/${id}`);
  return response.data;
};

export default client;
