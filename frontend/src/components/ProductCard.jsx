import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Tag, PackageCheck, AlertTriangle, ArrowRight, Star, ShoppingCart } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const ProductCard = ({ product }) => {
  const { _id, name, price, category, image, stock } = product;
  const { isAuthenticated } = useAuth();
  const { isInWishlist, addToWishlist, isSaving: isContextSaving } = useWishlist();
  const { isInCart, addToCart, isAdding } = useCart();

  const [localSaving, setLocalSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [cartError, setCartError] = useState(null);

  const inWishlist = isInWishlist(_id);
  const isSaving = localSaving || isContextSaving(_id);
  const inCart = isInCart(_id);
  const addingToCart = isAdding(_id);

  // Format currency in Indian Rupees
  const formattedPrice = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(price);

  // Simulated original MSRP price for retail feel
  const originalPrice = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(Math.round(price * 1.2));

  // Stock status text & indicators
  const isOutOfStock = stock <= 0;
  const isLowStock = stock > 0 && stock <= 5;

  // Task 5 (Lab 04): Handle Add to Wishlist click
  const handleWishlistClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (isSaving || inWishlist) return;
    setErrorMessage(null);

    if (!isAuthenticated) {
      setErrorMessage('Please log in to add to wishlist');
      return;
    }

    setLocalSaving(true);
    try {
      await addToWishlist(_id);
    } catch (err) {
      setErrorMessage(err.message || 'Failed to add to wishlist');
    } finally {
      setLocalSaving(false);
    }
  };

  // Task 7 (Lab 05): Handle Add to Cart click
  const handleCartClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (addingToCart) return;
    setCartError(null);

    if (!isAuthenticated) {
      setCartError('Please log in to add to cart');
      return;
    }

    try {
      await addToCart(_id);
    } catch (err) {
      setCartError(err.message || 'Failed to add to cart');
    }
  };

  return (
    <div className="product-card" data-testid={`product-card-${_id}`}>
      {/* ── Product Media Container ─────────────────────── */}
      <div className="product-image-container">
        <img
          src={image}
          alt={name}
          className="product-image"
          loading="lazy"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = 'https://images.unsplash.com/photo-1560343090-f0409e92791a?auto=format&fit=crop&w=600&q=80';
          }}
        />

        {/* Category Pill Tag */}
        <span className="product-category-pill">
          <Tag size={11} />
          {category}
        </span>

        {/* Top-right Discount / Deal Badge */}
        <span className="product-deal-badge">
          SAVE 20%
        </span>
      </div>

      {/* ── Product Info Section ────────────────────────── */}
      <div className="product-info">
        {/* Rating row */}
        <div className="product-rating-row">
          <div className="rating-stars" aria-label="Rating 4.8 out of 5 stars">
            <Star size={13} className="star-filled" fill="#f59e0b" color="#f59e0b" />
            <span className="rating-score">4.8</span>
          </div>
          <span className="rating-count">(120+ verified)</span>
        </div>

        {/* Product Title */}
        <h3 className="product-title" title={name}>
          {name}
        </h3>

        {/* Price & Stock Row */}
        <div className="product-pricing-block">
          <div className="price-stack">
            <span className="product-price">{formattedPrice}</span>
            <span className="product-mrp-strike">{originalPrice}</span>
          </div>

          {/* Stock Status Badge */}
          <span
            className={`product-stock ${
              isOutOfStock
                ? 'stock-out'
                : isLowStock
                ? 'stock-low'
                : 'stock-in'
            }`}
          >
            {isOutOfStock ? (
              <>
                <AlertTriangle size={12} /> Out of stock
              </>
            ) : isLowStock ? (
              <>
                <AlertTriangle size={12} /> Only {stock} left
              </>
            ) : (
              <>
                <PackageCheck size={12} /> {stock} in stock
              </>
            )}
          </span>
        </div>

        {/* Card Actions Block */}
        <div className="product-card-actions">
          {/* View Details Action Button */}
          <Link
            to={`/products/${_id}`}
            className="btn-view-details"
            id={`view-details-${_id}`}
            title={`View details for ${name}`}
          >
            <span>View Details</span>
            <ArrowRight size={15} className="arrow-icon" />
          </Link>

          {/* Task 7 (Lab 05): Add to Cart Button */}
          <button
            type="button"
            className={`btn-add-cart ${
              inCart ? 'btn-add-cart-in' : ''
            } ${addingToCart ? 'btn-add-cart-adding' : ''}`}
            onClick={handleCartClick}
            disabled={addingToCart || isOutOfStock}
            id={`cart-btn-${_id}`}
            data-testid={`cart-btn-${_id}`}
            aria-label={
              addingToCart ? 'Adding to cart' : inCart ? 'Add another to cart' : 'Add to cart'
            }
          >
            <ShoppingCart size={14} />
            {addingToCart ? 'Adding...' : inCart ? 'Add Another' : 'Add to Cart'}
          </button>

          {/* Task 5 (Lab 04): Wishlist Button */}
          <button
            type="button"
            className={`btn-wishlist ${inWishlist ? 'btn-wishlist-added' : ''} ${
              isSaving ? 'btn-wishlist-saving' : ''
            }`}
            onClick={handleWishlistClick}
            disabled={isSaving || inWishlist}
            id={`wishlist-btn-${_id}`}
            data-testid={`wishlist-btn-${_id}`}
            aria-label={
              isSaving
                ? 'Saving to wishlist'
                : inWishlist
                ? 'Added to wishlist'
                : 'Add to wishlist'
            }
          >
            {isSaving ? (
              <>⏳ Saving...</>
            ) : inWishlist ? (
              <>♥ Added to Wishlist</>
            ) : (
              <>♡ Add to Wishlist</>
            )}
          </button>
        </div>

        {/* Wishlist error */}
        {errorMessage && (
          <div
            className="product-wishlist-error"
            role="alert"
            id={`wishlist-error-${_id}`}
          >
            <span>{errorMessage}</span>
            {!isAuthenticated && (
              <Link to="/login" className="wishlist-error-login-link">
                Log in
              </Link>
            )}
          </div>
        )}

        {/* Cart error */}
        {cartError && (
          <div
            className="product-wishlist-error"
            role="alert"
            id={`cart-error-${_id}`}
          >
            <span>{cartError}</span>
            {!isAuthenticated && (
              <Link to="/login" className="wishlist-error-login-link">
                Log in
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductCard;
