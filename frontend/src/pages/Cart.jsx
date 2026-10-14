import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, ArrowRight, PackageOpen, RefreshCw } from 'lucide-react';
import { useCart } from '../context/CartContext';
import CartItem from '../components/CartItem';

const Cart = () => {
  const { cartItems, cartCount, subtotal, loading, error, fetchCart } = useCart();
  const navigate = useNavigate();

  // Re-fetch on mount to ensure latest prices/stock
  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const formattedSubtotal = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(subtotal);

  // ── Loading state ────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="cart-page">
        <div className="cart-loading">
          <div className="cart-loading-spinner" />
          <p>Loading your cart...</p>
        </div>
      </div>
    );
  }

  // ── Error state ──────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="cart-page">
        <div className="cart-error-state">
          <ShoppingCart size={48} className="cart-empty-icon" />
          <h2>Unable to load your cart</h2>
          <p>{error}</p>
          <button className="cart-retry-btn" onClick={fetchCart} id="cart-retry-btn">
            <RefreshCw size={16} /> Try Again
          </button>
        </div>
      </div>
    );
  }

  // ── Empty state ──────────────────────────────────────────────────────────────
  if (!cartItems.length) {
    return (
      <div className="cart-page">
        <div className="cart-empty-state">
          <PackageOpen size={64} className="cart-empty-icon" />
          <h2>Your cart is empty 🛒</h2>
          <p>Looks like you haven't added anything yet.</p>
          <Link to="/products" className="cart-browse-btn" id="cart-browse-btn">
            <ArrowRight size={16} /> Browse Products
          </Link>
        </div>
      </div>
    );
  }

  // ── Cart with items ──────────────────────────────────────────────────────────
  return (
    <div className="cart-page">
      <div className="cart-header">
        <h1 className="cart-title">
          <ShoppingCart size={28} /> My Cart
        </h1>
        <span className="cart-item-count">{cartCount} {cartCount === 1 ? 'item' : 'items'}</span>
      </div>

      <div className="cart-layout">
        {/* Left — Cart Items list */}
        <div className="cart-items-panel">
          {cartItems.map((item) => (
            <CartItem key={item.product._id} item={item} />
          ))}
        </div>

        {/* Right — Order Summary */}
        <aside className="cart-summary-panel">
          <div className="cart-summary-card">
            <h2 className="cart-summary-title">Order Summary</h2>

            <div className="cart-summary-rows">
              <div className="cart-summary-row">
                <span>Items</span>
                <span>{cartCount}</span>
              </div>

              {cartItems.map((item) => (
                <div className="cart-summary-row cart-summary-row-sm" key={item.product._id}>
                  <span className="cart-summary-product-name">
                    {item.product.name} × {item.quantity}
                  </span>
                  <span>
                    {new Intl.NumberFormat('en-IN', {
                      style: 'currency',
                      currency: 'INR',
                      maximumFractionDigits: 0,
                    }).format(item.product.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            <div className="cart-summary-divider" />

            <div className="cart-summary-total-row">
              <span>Subtotal</span>
              <span className="cart-summary-total-amount">{formattedSubtotal}</span>
            </div>

            <button
              className="cart-checkout-btn"
              id="proceed-checkout-btn"
              data-testid="proceed-checkout-btn"
              onClick={() => navigate('/checkout')}
            >
              Proceed to Checkout <ArrowRight size={16} />
            </button>

            <Link to="/products" className="cart-continue-link">
              ← Continue Shopping
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Cart;
