import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  ShoppingCart, 
  Check, 
  Tag, 
  Package, 
  ShieldCheck, 
  Truck, 
  RefreshCw,
  AlertCircle,
  Star,
  CheckCircle2,
  Clock,
  RotateCcw,
  Heart
} from 'lucide-react';
import { getProductById } from '../services/api';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const ProductDetails = () => {
  const { id } = useParams();
  const { isAuthenticated } = useAuth();
  const { isInWishlist, addToWishlist, removeFromWishlist, isSaving: isContextSaving } = useWishlist();
  const { addToCart, isInCart, isAdding: isCartAdding } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [addedToCart, setAddedToCart] = useState(false);
  const [cartError, setCartError] = useState(null);
  const [wishlistSaving, setWishlistSaving] = useState(false);
  const [wishlistError, setWishlistError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const fetchDetail = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getProductById(id);
        if (isMounted) {
          setProduct(data);
        }
      } catch (err) {
        if (isMounted) {
          if (err.response?.status === 404) {
            setError('Product not found.');
          } else {
            setError('Something went wrong while loading the product.');
          }
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchDetail();

    return () => {
      isMounted = false;
    };
  }, [id]);

  const inWishlist = isInWishlist(id);
  const isSavingWishlist = wishlistSaving || isContextSaving(id);

  const handleWishlistToggle = async () => {
    if (isSavingWishlist) return;
    setWishlistError(null);

    if (!isAuthenticated) {
      setWishlistError('Please log in to add to wishlist');
      return;
    }

    setWishlistSaving(true);
    try {
      if (inWishlist) {
        await removeFromWishlist(id);
      } else {
        await addToWishlist(id);
      }
    } catch (err) {
      setWishlistError(err.message || 'Failed to update wishlist');
    } finally {
      setWishlistSaving(false);
    }
  };

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      setCartError('Please log in to add items to your cart');
      return;
    }
    setCartError(null);
    try {
      await addToCart(id);
      setAddedToCart(true);
      setTimeout(() => {
        setAddedToCart(false);
      }, 2800);
    } catch (err) {
      setCartError(err.message || 'Failed to add to cart');
    }
  };

  if (loading) {
    return (
      <div className="product-details-container">
        <div className="product-state-container loading-state" id="product-details-loading">
          <div className="spinner spinner-dark"></div>
          <p className="state-message">Loading product details...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="product-details-container">
        <div className="product-state-container error-state" id="product-details-error">
          <AlertCircle size={48} className="state-icon error-icon" />
          <h2 className="state-heading">{error || 'Product not found.'}</h2>
          <p className="state-message">
            The product you are looking for may have been removed or does not exist.
          </p>
          <Link to="/products" className="btn-back-products">
            <ArrowLeft size={16} />
            <span>Back to Products</span>
          </Link>
        </div>
      </div>
    );
  }

  const { name, description, price, category, image, stock } = product;

  const formattedPrice = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(price);

  const originalPrice = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(Math.round(price * 1.25));

  const isOutOfStock = stock <= 0;

  return (
    <div className="product-details-container">
      {/* ── Breadcrumb Navigation ────────────────────────── */}
      <nav className="details-breadcrumb" aria-label="Breadcrumb">
        <Link to="/products" className="breadcrumb-back-link" id="back-to-products-link">
          <ArrowLeft size={15} />
          <span>All Products</span>
        </Link>
        <span className="breadcrumb-separator">/</span>
        <span className="breadcrumb-category">{category}</span>
        <span className="breadcrumb-separator">/</span>
        <span className="breadcrumb-current">{name}</span>
      </nav>

      {/* ── Main Product Display Card ────────────────────── */}
      <div className="product-details-layout">
        {/* Left: Large Product Image Gallery */}
        <div className="details-image-card">
          <div className="image-zoom-wrapper">
            <img
              src={image}
              alt={name}
              className="details-large-image"
              id="product-details-image"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://images.unsplash.com/photo-1560343090-f0409e92791a?auto=format&fit=crop&w=800&q=80';
              }}
            />
          </div>
          <div className="details-badge-overlay">
            <Tag size={12} />
            <span>{category}</span>
          </div>
        </div>

        {/* Right: Product Information & CTAs */}
        <div className="details-info-card">
          {/* Category & Rating */}
          <div className="details-header-meta">
            <span className="details-category-pill" id="product-details-category">
              {category}
            </span>
            <div className="details-rating-badge">
              <Star size={14} fill="#f59e0b" color="#f59e0b" />
              <strong>4.9</strong>
              <span>(284 customer reviews)</span>
            </div>
          </div>

          {/* Product Title */}
          <h1 className="details-product-title" id="product-details-name">
            {name}
          </h1>

          {/* Pricing Box */}
          <div className="details-pricing-panel">
            <div className="details-price-tag" id="product-details-price">
              {formattedPrice}
            </div>
            <div className="details-mrp-group">
              <span className="mrp-strikethrough">{originalPrice}</span>
              <span className="mrp-save-tag">SAVE 20%</span>
            </div>
            <p className="tax-inclusive-note">Inclusive of all local taxes</p>
          </div>

          {/* Stock Availability */}
          <div className="details-stock-status">
            <span className={`live-stock-indicator ${isOutOfStock ? 'out' : 'available'}`} />
            <span
              className={isOutOfStock ? 'stock-out-badge' : 'stock-in-badge'}
              id="product-details-stock"
            >
              {isOutOfStock ? 'Currently Out of Stock' : `In Stock (${stock} units left)`}
            </span>
          </div>

          {/* Product Description */}
          <div className="details-description-box">
            <h3 className="section-title">Product Overview</h3>
            <p className="details-description-text" id="product-details-description">
              {description}
            </p>
          </div>

          {/* Action CTAs: Add to Cart & Wishlist */}
          <div className="details-actions">
            <button
              type="button"
              className={`btn-add-to-cart ${addedToCart ? 'btn-added' : ''}`}
              id="btn-add-to-cart"
              disabled={isOutOfStock || isCartAdding(id)}
              onClick={handleAddToCart}
            >
              {isCartAdding(id) ? (
                <>
                  <div className="spinner" style={{ width: '18px', height: '18px' }}></div>
                  <span>Adding...</span>
                </>
              ) : addedToCart ? (
                <>
                  <CheckCircle2 size={20} />
                  <span>Added to Cart!</span>
                </>
              ) : isOutOfStock ? (
                <span>Sold Out</span>
              ) : (
                <>
                  <ShoppingCart size={20} />
                  <span>{isInCart(id) ? 'Add Another' : 'Add to Cart'}</span>
                </>
              )}
            </button>

            <button
              type="button"
              className={`btn-details-wishlist ${inWishlist ? 'btn-wishlist-added' : ''}`}
              id="btn-details-wishlist"
              disabled={isSavingWishlist}
              onClick={handleWishlistToggle}
              title={inWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
            >
              {isSavingWishlist ? (
                <>⏳ Saving...</>
              ) : inWishlist ? (
                <>♥ Added to Wishlist</>
              ) : (
                <>♡ Add to Wishlist</>
              )}
            </button>
          </div>

          {(wishlistError || cartError) && (
            <div className="product-wishlist-error" role="alert" style={{ marginBottom: '16px' }}>
              <span>{wishlistError || cartError}</span>
              {!isAuthenticated && (
                <Link to="/login" className="wishlist-error-login-link" style={{ marginLeft: '8px' }}>
                  Log in
                </Link>
              )}
            </div>
          )}

          {/* Retail Trust Highlights */}
          <div className="details-trust-grid">
            <div className="trust-item">
              <div className="trust-icon-box">
                <Truck size={18} />
              </div>
              <div>
                <strong>Free Express Shipping</strong>
                <p>Delivery in 2–4 business days</p>
              </div>
            </div>

            <div className="trust-item">
              <div className="trust-icon-box">
                <RotateCcw size={18} />
              </div>
              <div>
                <strong>7-Day Easy Returns</strong>
                <p>Hassle-free return policy</p>
              </div>
            </div>

            <div className="trust-item">
              <div className="trust-icon-box">
                <ShieldCheck size={18} />
              </div>
              <div>
                <strong>100% Genuine Guarantee</strong>
                <p>Direct from verified distributors</p>
              </div>
            </div>

            <div className="trust-item">
              <div className="trust-icon-box">
                <Clock size={18} />
              </div>
              <div>
                <strong>24/7 Customer Support</strong>
                <p>Always here to help you</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
