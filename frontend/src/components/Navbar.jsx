import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LogOut, LogIn, UserPlus, Compass, Heart, ShoppingCart, Package } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import ShopKartLogo from './ShopKartLogo';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { wishlistCount } = useWishlist();
  const { cartCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  return (
    <header className="navbar">
      <div className="nav-brand-group">
        <Link to="/products" id="nav-logo" className="navbar-brand-link" title="ShopKart Home">
          <ShopKartLogo size="sm" showText={true} />
        </Link>

        {/* Link to Product Discovery */}
        <Link
          to="/products"
          id="nav-products-link"
          className={`nav-link nav-link-browse ${
            location.pathname.startsWith('/products') ? 'active' : ''
          }`}
        >
          <Compass size={16} />
          <span>Explore Products</span>
        </Link>

        {/* Task 8 (Lab 04): Link to Wishlist */}
        <Link
          to="/wishlist"
          id="nav-wishlist-link"
          data-testid="nav-wishlist-link"
          className={`nav-link nav-link-wishlist ${
            location.pathname === '/wishlist' ? 'active' : ''
          }`}
          title="My Wishlist"
        >
          <Heart size={16} />
          <span>Wishlist</span>
          {isAuthenticated && wishlistCount > 0 && (
            <span className="nav-wishlist-badge" id="nav-wishlist-badge">
              {wishlistCount}
            </span>
          )}
        </Link>

        {/* Task 16 (Lab 05): Link to Cart */}
        <Link
          to="/cart"
          id="nav-cart-link"
          data-testid="nav-cart-link"
          className={`nav-link nav-link-cart ${
            location.pathname === '/cart' ? 'active' : ''
          }`}
          title="My Cart"
        >
          <ShoppingCart size={16} />
          <span>Cart</span>
          {isAuthenticated && cartCount > 0 && (
            <span className="nav-cart-badge" id="nav-cart-badge">
              {cartCount}
            </span>
          )}
        </Link>

        {/* Task 8 (Lab 06): Link to My Orders */}
        {isAuthenticated && (
          <Link
            to="/orders"
            id="nav-orders-link"
            data-testid="nav-orders-link"
            className={`nav-link nav-link-orders ${
              location.pathname === '/orders' ? 'active' : ''
            }`}
            title="My Orders"
          >
            <Package size={16} />
            <span>My Orders</span>
          </Link>
        )}
      </div>

      <nav className="nav-actions">
        {isAuthenticated ? (
          <>
            <Link
              to="/home"
              id="nav-home-link"
              className={`nav-link ${location.pathname === '/home' ? 'active' : ''}`}
            >
              Dashboard
            </Link>

            {user && (
              <div className="nav-user-pill" id="nav-user-pill">
                <div className="user-avatar-small" title={user.fullName}>
                  {getInitials(user.fullName)}
                </div>
                <span className="user-greeting" id="user-greeting">
                  {user.fullName}
                </span>
              </div>
            )}

            {/* Task 4: Logout Button */}
            <button
              id="logout-btn"
              data-testid="logout-button"
              onClick={handleLogout}
              className="btn-nav-logout logout-button"
              title="Sign out of your account"
              aria-label="Logout"
            >
              <LogOut size={15} />
              <span>Logout</span>
            </button>
          </>
        ) : (
          <>
            <Link
              to="/login"
              id="nav-login-link"
              className={`nav-link ${location.pathname === '/login' ? 'active' : ''}`}
            >
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <LogIn size={15} /> Login
              </span>
            </Link>
            <Link
              to="/register"
              id="nav-register-btn"
              className="btn-nav-primary"
            >
              <UserPlus size={15} />
              <span>Create Account</span>
            </Link>
          </>
        )}
      </nav>
    </header>
  );
};

export default Navbar;
