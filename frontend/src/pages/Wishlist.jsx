import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, RefreshCw, ShoppingBag, AlertCircle, Sparkles } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import WishlistCard from '../components/WishlistCard';

const Wishlist = () => {
  const { wishlist, loading, error, fetchWishlist, removeFromWishlist } = useWishlist();
  const [removingId, setRemovingId] = useState(null);
  const [removeError, setRemoveError] = useState(null);

  // Handle remove item from wishlist (Task 4 & 6)
  const handleRemove = async (productId) => {
    try {
      setRemovingId(productId);
      setRemoveError(null);
      await removeFromWishlist(productId);
    } catch (err) {
      setRemoveError(err.message || 'Failed to remove product from wishlist');
    } finally {
      setRemovingId(null);
    }
  };

  return (
    <div className="wishlist-page-container" id="wishlist-page">
      {/* Page Header */}
      <div className="wishlist-hero-header">
        <div className="hero-tag">
          <Sparkles size={14} />
          <span>Saved Collection</span>
        </div>
        <h1 className="wishlist-main-title">My Wishlist</h1>
        <p className="wishlist-main-subtitle">
          Keep track of your favorite gadgets, accessories, and gear in one place.
        </p>
      </div>

      {/* Main Content Area */}
      <section className="wishlist-content-section" aria-live="polite">
        {/* Task 7: 1. Loading State */}
        {loading && (
          <div className="product-state-container loading-state" id="wishlist-loading-state">
            <div className="spinner spinner-dark"></div>
            <p className="state-message">Loading your wishlist...</p>
          </div>
        )}

        {/* Task 7: 3. Error State */}
        {!loading && error && (
          <div className="product-state-container error-state" id="wishlist-error-state">
            <AlertCircle size={44} className="state-icon error-icon" />
            <h2 className="state-heading">Unable to load wishlist.</h2>
            <p className="state-message">{error}</p>
            <button
              type="button"
              className="btn-retry btn-try-again"
              id="btn-try-again"
              onClick={fetchWishlist}
            >
              <RefreshCw size={15} />
              <span>Try Again</span>
            </button>
          </div>
        )}

        {/* Task 7: 2. Empty State */}
        {!loading && !error && wishlist.length === 0 && (
          <div className="product-state-container empty-state" id="wishlist-empty-state">
            <div className="empty-state-heart-badge">
              <Heart size={44} className="empty-heart-icon" />
            </div>
            <h2 className="state-heading">Your wishlist is empty ❤️</h2>
            <p className="state-message">Start saving products you love.</p>
            <Link
              to="/products"
              className="btn-browse-products"
              id="btn-browse-products"
            >
              <ShoppingBag size={16} />
              <span>Browse Products</span>
            </Link>
          </div>
        )}

        {/* Task 6: Dynamically Render Wishlist Cards */}
        {!loading && !error && wishlist.length > 0 && (
          <div className="wishlist-items-wrapper">
            <div className="wishlist-results-bar">
              <span className="results-count">
                You have <strong>{wishlist.length}</strong> {wishlist.length === 1 ? 'item' : 'items'} saved
              </span>
            </div>

            {removeError && (
              <div className="wishlist-banner-error" role="alert">
                <AlertCircle size={15} />
                <span>{removeError}</span>
              </div>
            )}

            <div className="wishlist-grid" id="wishlist-grid">
              {wishlist.map((product) => (
                <WishlistCard
                  key={product._id}
                  product={product}
                  onRemove={handleRemove}
                  isRemoving={removingId === product._id}
                />
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

export default Wishlist;
