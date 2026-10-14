import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, LogIn, Eye, EyeOff, AlertCircle, CheckCircle2, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import ShopKartLogo from '../components/ShopKartLogo';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated } = useAuth();

  // Controlled component states
  const [formData, setFormData] = useState({
    email: location.state?.email || '',
    password: '',
  });

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [successBanner, setSuccessBanner] = useState(
    location.state?.successMessage || ''
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // If already authenticated, redirect to /home
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/home', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
    if (serverError) setServerError('');
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email.trim())) {
        newErrors.email = 'Please enter a valid email address';
      }
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    setSuccessBanner('');

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      await login({
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
      });

      // On success → Navigate to /home
      navigate('/home', { replace: true });
    } catch (err) {
      // Show "Invalid Credentials" on failure as required by Task 2
      setServerError('Invalid Credentials');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo-center">
            <ShopKartLogo size="md" showText={true} />
          </div>
          <div className="auth-badge">
            <ShieldCheck size={14} />
            <span>Secure Access</span>
          </div>
          <h1 className="auth-title">Welcome Back</h1>
          <p className="auth-subtitle">
            Sign in to access your ShopKart account, orders, and privileges.
          </p>
        </div>

        {/* Success Banner from Registration */}
        {successBanner && (
          <div className="alert-banner alert-success" role="status" id="login-success-banner">
            <CheckCircle2 size={18} className="alert-icon" />
            <div>{successBanner}</div>
          </div>
        )}

        {/* Failure Error Banner: Displays "Invalid Credentials" on failure */}
        {serverError && (
          <div className="alert-banner alert-error" role="alert" id="login-error-banner">
            <AlertCircle size={18} className="alert-icon" />
            <div id="login-error-message">{serverError}</div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          {/* Email */}
          <div className="form-group">
            <label htmlFor="login-email" className="form-label">
              Email
            </label>
            <div className="input-container">
              <span className="input-icon">
                <Mail size={18} />
              </span>
              <input
                type="email"
                id="login-email"
                name="email"
                placeholder="name@example.com"
                value={formData.email}
                onChange={handleChange}
                className={`form-input ${errors.email ? 'input-error' : ''}`}
                autoComplete="email"
              />
            </div>
            {errors.email && (
              <span className="field-error-text" id="login-email-error">
                <AlertCircle size={13} /> {errors.email}
              </span>
            )}
          </div>

          {/* Password */}
          <div className="form-group">
            <label htmlFor="login-password" className="form-label">
              Password
            </label>
            <div className="input-container">
              <span className="input-icon">
                <Lock size={18} />
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                id="login-password"
                name="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                className={`form-input ${errors.password ? 'input-error' : ''}`}
                autoComplete="current-password"
              />
              <button
                type="button"
                className="toggle-password-btn"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.password && (
              <span className="field-error-text" id="login-password-error">
                <AlertCircle size={13} /> {errors.password}
              </span>
            )}
          </div>

          {/* Login Button */}
          <button
            type="submit"
            id="login-submit-btn"
            className="btn-submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <div className="spinner"></div>
                <span>Logging in...</span>
              </>
            ) : (
              <>
                <LogIn size={18} />
                <span>Login</span>
              </>
            )}
          </button>
        </form>

        <div className="auth-footer">
          Don't have an account?{' '}
          <Link to="/register" id="link-to-register">
            Create an Account
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
