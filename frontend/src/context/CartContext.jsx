import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  getCart as apiGetCart,
  addToCart as apiAddToCart,
  updateCartQuantity as apiUpdateQty,
  removeFromCart as apiRemoveFromCart,
} from '../services/api';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();

  const [cartItems, setCartItems] = useState([]);   // array of { product, quantity }
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [addingIds, setAddingIds] = useState(new Set());   // productIds being added
  const [updatingIds, setUpdatingIds] = useState(new Set()); // productIds being updated

  // ─── Derived values (Task 15) ───────────────────────────────────────────────
  // Total units across all items (for Navbar badge)
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  // Subtotal — using latest product price from populated data
  const subtotal = cartItems.reduce(
    (sum, item) => sum + (item.product?.price || 0) * item.quantity,
    0
  );

  // ─── Fetch cart from backend ─────────────────────────────────────────────────
  const fetchCart = useCallback(async () => {
    if (!isAuthenticated) {
      setCartItems([]);
      setLoading(false);
      setError(null);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const data = await apiGetCart();
      setCartItems(data.cart || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to load your cart.');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  // Sync cart on auth change
  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
    } else {
      setCartItems([]);
      setLoading(false);
      setError(null);
    }
  }, [isAuthenticated, fetchCart]);

  // ─── Check if product is already in cart ─────────────────────────────────────
  const isInCart = useCallback(
    (productId) => {
      if (!productId) return false;
      return cartItems.some(
        (item) => item.product && item.product._id?.toString() === productId.toString()
      );
    },
    [cartItems]
  );

  // Get current quantity for a product
  const getQuantity = useCallback(
    (productId) => {
      const item = cartItems.find(
        (i) => i.product && i.product._id?.toString() === productId.toString()
      );
      return item ? item.quantity : 0;
    },
    [cartItems]
  );

  // ─── Add to cart ──────────────────────────────────────────────────────────────
  const addItem = async (productId) => {
    if (addingIds.has(productId)) return;
    setAddingIds((prev) => new Set(prev).add(productId));
    try {
      const data = await apiAddToCart(productId);
      setCartItems(data.cart || []);
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to add to cart';
      throw new Error(message);
    } finally {
      setAddingIds((prev) => {
        const next = new Set(prev);
        next.delete(productId);
        return next;
      });
    }
  };

  // ─── Update quantity ──────────────────────────────────────────────────────────
  const updateQuantity = async (productId, quantity) => {
    if (updatingIds.has(productId)) return;
    setUpdatingIds((prev) => new Set(prev).add(productId));
    try {
      const data = await apiUpdateQty(productId, quantity);
      setCartItems(data.cart || []);
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to update quantity';
      throw new Error(message);
    } finally {
      setUpdatingIds((prev) => {
        const next = new Set(prev);
        next.delete(productId);
        return next;
      });
    }
  };

  // ─── Remove from cart ─────────────────────────────────────────────────────────
  const removeItem = async (productId) => {
    try {
      const data = await apiRemoveFromCart(productId);
      setCartItems(data.cart || []);
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to remove item';
      throw new Error(message);
    }
  };

  // ─── Clear cart locally (Task 5) ───────────────────────────────────────────
  const clearCart = () => {
    setCartItems([]);
  };

  const value = {
    cartItems,
    cartCount,
    subtotal,
    loading,
    error,
    isInCart,
    getQuantity,
    isAdding: (id) => addingIds.has(id),
    isUpdating: (id) => updatingIds.has(id),
    fetchCart,
    addToCart: addItem,
    updateQuantity,
    removeFromCart: removeItem,
    clearCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export default CartContext;
