import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getWishlist, addToWishlist as apiAddToWishlist, removeFromWishlist as apiRemoveFromWishlist } from '../services/api';
import { useAuth } from './AuthContext';

const WishlistContext = createContext(null);

export const WishlistProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [savingIds, setSavingIds] = useState(new Set());

  // Fetch wishlist from GET /wishlist
  const fetchWishlist = useCallback(async () => {
    if (!isAuthenticated) {
      setWishlist([]);
      setLoading(false);
      setError(null);
      return [];
    }

    try {
      setLoading(true);
      setError(null);
      const data = await getWishlist();
      const list = data.wishlist || [];
      setWishlist(list);
      return list;
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to load wishlist.');
      return [];
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  // Sync wishlist on auth change
  useEffect(() => {
    if (isAuthenticated) {
      fetchWishlist();
    } else {
      setWishlist([]);
      setLoading(false);
      setError(null);
    }
  }, [isAuthenticated, fetchWishlist]);

  // Check if product is in wishlist
  const isInWishlist = useCallback(
    (productId) => {
      if (!productId || !wishlist) return false;
      return wishlist.some((item) => {
        const id = item._id || item;
        return id.toString() === productId.toString();
      });
    },
    [wishlist]
  );

  // Add product to wishlist (Task 2 & 5)
  const addItemToWishlist = async (productId) => {
    if (savingIds.has(productId)) {
      return; // Prevent duplicate clicks while saving
    }

    setSavingIds((prev) => new Set(prev).add(productId));

    try {
      const res = await apiAddToWishlist(productId);
      // Refresh or append to list
      await fetchWishlist();
      return { success: true, message: res.message || 'Product added to wishlist' };
    } catch (err) {
      const message =
        err.response?.data?.message ||
        (err.response?.status === 401
          ? 'Please log in to add items to your wishlist'
          : err.response?.status === 409
          ? 'Product already in wishlist'
          : 'Failed to add product to wishlist');
      throw new Error(message);
    } finally {
      setSavingIds((prev) => {
        const next = new Set(prev);
        next.delete(productId);
        return next;
      });
    }
  };

  // Remove product from wishlist (Task 4 & 6)
  const removeItemFromWishlist = async (productId) => {
    try {
      const res = await apiRemoveFromWishlist(productId);
      // Remove immediately from state (no page reload)
      setWishlist((prev) =>
        prev.filter((item) => (item._id || item).toString() !== productId.toString())
      );
      return { success: true, message: res.message || 'Product removed from wishlist' };
    } catch (err) {
      const message =
        err.response?.data?.message ||
        (err.response?.status === 401
          ? 'Please log in to manage your wishlist'
          : 'Failed to remove product from wishlist');
      throw new Error(message);
    }
  };

  const value = {
    wishlist,
    wishlistCount: wishlist.length,
    loading,
    error,
    savingIds,
    isSaving: (id) => savingIds.has(id),
    fetchWishlist,
    addToWishlist: addItemToWishlist,
    removeFromWishlist: removeItemFromWishlist,
    isInWishlist,
  };

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};

export default WishlistContext;
