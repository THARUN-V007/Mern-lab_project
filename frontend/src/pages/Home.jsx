import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  Mail, 
  Phone, 
  Shield, 
  Calendar, 
  LogOut, 
  ShoppingBag, 
  KeyRound, 
  Package, 
  Heart, 
  Sparkles,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getProfile, changePassword } from '../services/api';

const Home = () => {
  const { user: contextUser, setUser: setContextUser, logout } = useAuth();
  const navigate = useNavigate();

  // Task 3: Fetch the logged-in user via GET /customers/me
  const [customer, setCustomer] = useState(contextUser || null);
  const [isLoading, setIsLoading] = useState(!contextUser);
  const [fetchError, setFetchError] = useState('');

  // Password change state
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordStatus, setPasswordStatus] = useState({ type: '', message: '' });
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Fetch customer profile on mount via GET /customers/me
  useEffect(() => {
    let isMounted = true;

    const fetchLoggedInCustomer = async () => {
      try {
        setIsLoading(true);
        const data = await getProfile();
        if (isMounted) {
          setCustomer(data);
          setContextUser(data);
          setFetchError('');
        }
      } catch (err) {
        if (isMounted) {
          setFetchError(err.response?.data?.message || 'Failed to fetch customer profile.');
          // If Not Logged In → Automatically redirect to /login
          navigate('/login', { replace: true });
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchLoggedInCustomer();

    return () => {
      isMounted = false;
    };
  }, [setContextUser, navigate]);

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPasswordStatus({ type: '', message: '' });

    if (!passwordData.oldPassword || !passwordData.newPassword) {
      setPasswordStatus({
        type: 'error',
        message: 'Both current and new passwords are required.',
      });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setPasswordStatus({
        type: 'error',
        message: 'New password must be at least 6 characters.',
      });
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordStatus({
        type: 'error',
        message: 'New passwords do not match.',
      });
      return;
    }

    setIsChangingPassword(true);
    try {
      const res = await changePassword({
        oldPassword: passwordData.oldPassword,
        newPassword: passwordData.newPassword,
      });
      setPasswordStatus({
        type: 'success',
        message: res.message || 'Password updated successfully!',
      });
      setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => setShowPasswordModal(false), 2000);
    } catch (err) {
      setPasswordStatus({
        type: 'error',
        message: err.response?.data?.message || 'Failed to update password.',
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  if (isLoading) {
    return (
      <div className="auth-loading-card">
        <div className="spinner spinner-dark"></div>
        <p className="loading-text">Fetching customer profile...</p>
      </div>
    );
  }

  return (
    <div className="home-container">
      {/* Welcome Message Banner */}
      <section className="hero-welcome">
        <div className="hero-tag">
          <Sparkles size={14} />
          <span>ShopKart Customer Portal</span>
        </div>
        {/* Welcome message */}
        <h1 className="hero-title" id="welcome-message">
          Welcome, {customer?.fullName || 'Customer'}!
        </h1>
        <p className="hero-subtitle">
          Welcome to your authenticated account hub. Manage your profile, view orders, and enjoy tailored shopping privileges.
        </p>
      </section>

      {fetchError && (
        <div className="alert-banner alert-error" role="alert">
          <AlertCircle size={18} className="alert-icon" />
          <div>{fetchError}</div>
        </div>
      )}

      {/* Main Grid: Profile Info & Features */}
      <div className="dashboard-grid">
        {/* Customer Profile Card */}
        <div className="profile-card" id="customer-profile-card">
          <div className="profile-header">
            <div className="profile-avatar-large">
              {customer?.fullName?.charAt(0)?.toUpperCase() || 'C'}
            </div>
            <div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-light)', fontWeight: 600, textTransform: 'uppercase' }}>
                Customer Name
              </span>
              <h2 className="profile-name" id="customer-name">
                {customer?.fullName || 'N/A'}
              </h2>
              <span className="profile-role">
                <span className="status-badge"></span>
                <span>Active Customer</span>
              </span>
            </div>
          </div>

          <div className="profile-info-list">
            {/* Customer Name Item */}
            <div className="info-item">
              <div className="info-icon">
                <User size={18} />
              </div>
              <div className="info-details">
                <span className="info-label">Customer Name</span>
                <span className="info-value" id="profile-customer-name">
                  {customer?.fullName || 'N/A'}
                </span>
              </div>
            </div>

            {/* Email Item */}
            <div className="info-item">
              <div className="info-icon">
                <Mail size={18} />
              </div>
              <div className="info-details">
                <span className="info-label">Email</span>
                <span className="info-value" id="customer-email">
                  {customer?.email || 'N/A'}
                </span>
              </div>
            </div>

            {/* Phone Number Item */}
            <div className="info-item">
              <div className="info-icon">
                <Phone size={18} />
              </div>
              <div className="info-details">
                <span className="info-label">Phone Number</span>
                <span className="info-value" id="customer-phone">
                  {customer?.phone || 'Not provided'}
                </span>
              </div>
            </div>

            {/* Account ID */}
            <div className="info-item">
              <div className="info-icon">
                <Shield size={18} />
              </div>
              <div className="info-details">
                <span className="info-label">Customer ID</span>
                <span className="info-value" id="customer-id" style={{ fontSize: '0.82rem', fontFamily: 'monospace' }}>
                  {customer?._id || 'N/A'}
                </span>
              </div>
            </div>
          </div>

          <div className="profile-actions">
            <button
              id="btn-open-password-modal"
              className="btn-profile-action btn-action-outline"
              onClick={() => setShowPasswordModal(!showPasswordModal)}
            >
              <KeyRound size={16} />
              <span>{showPasswordModal ? 'Close Password Settings' : 'Change Password'}</span>
            </button>

            <button
              id="btn-customer-logout"
              onClick={handleLogout}
              className="btn-profile-action btn-action-danger"
            >
              <LogOut size={16} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* Right Section: Interactive Panels / Features */}
        <div className="features-card">
          {showPasswordModal ? (
            <div>
              <h3 className="section-title">
                <KeyRound size={20} color="var(--color-primary)" />
                <span>Update Account Password</span>
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', margin: '8px 0 20px 0' }}>
                Ensure your account is using a long, random password to stay secure.
              </p>

              {passwordStatus.message && (
                <div
                  className={`alert-banner ${passwordStatus.type === 'error' ? 'alert-error' : 'alert-success'}`}
                  role="alert"
                >
                  {passwordStatus.type === 'error' ? (
                    <AlertCircle size={18} className="alert-icon" />
                  ) : (
                    <CheckCircle2 size={18} className="alert-icon" />
                  )}
                  <div>{passwordStatus.message}</div>
                </div>
              )}

              <form onSubmit={handlePasswordChange} className="auth-form" style={{ gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Current Password</label>
                  <input
                    type="password"
                    value={passwordData.oldPassword}
                    onChange={(e) =>
                      setPasswordData({ ...passwordData, oldPassword: e.target.value })
                    }
                    className="form-input"
                    style={{ paddingLeft: '14px' }}
                    placeholder="Enter current password"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">New Password</label>
                  <input
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) =>
                      setPasswordData({ ...passwordData, newPassword: e.target.value })
                    }
                    className="form-input"
                    style={{ paddingLeft: '14px' }}
                    placeholder="At least 6 characters"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Confirm New Password</label>
                  <input
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) =>
                      setPasswordData({ ...passwordData, confirmPassword: e.target.value })
                    }
                    className="form-input"
                    style={{ paddingLeft: '14px' }}
                    placeholder="Re-type new password"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isChangingPassword}
                  className="btn-submit"
                  style={{ marginTop: '10px' }}
                >
                  {isChangingPassword ? 'Saving Changes...' : 'Update Password'}
                </button>
              </form>
            </div>
          ) : (
            <>
              <h3 className="section-title">
                <ShoppingBag size={20} color="var(--color-primary)" />
                <span>ShopKart Customer Services</span>
              </h3>

              <div className="features-grid">
                <div className="feature-box">
                  <div className="feature-icon-wrapper">
                    <Package size={20} />
                  </div>
                  <h4 className="feature-box-title">My Orders</h4>
                  <p className="feature-box-desc">
                    Track shipments, view purchase history, and download tax invoices.
                  </p>
                </div>

                <div className="feature-box">
                  <div className="feature-icon-wrapper">
                    <Heart size={20} />
                  </div>
                  <h4 className="feature-box-title">Saved Wishlist</h4>
                  <p className="feature-box-desc">
                    Curate your favourite gadgets, apparel, and seasonal discounts.
                  </p>
                </div>

                <div className="feature-box">
                  <div className="feature-icon-wrapper">
                    <Shield size={20} />
                  </div>
                  <h4 className="feature-box-title">HttpOnly Cookie Auth</h4>
                  <p className="feature-box-desc">
                    Session secured with JWT stored in an HttpOnly, SameSite cookie.
                  </p>
                </div>

                <div className="feature-box">
                  <div className="feature-icon-wrapper">
                    <Sparkles size={20} />
                  </div>
                  <h4 className="feature-box-title">VIP Rewards</h4>
                  <p className="feature-box-desc">
                    Earn 5% cashback on all orders placed with your verified account.
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
