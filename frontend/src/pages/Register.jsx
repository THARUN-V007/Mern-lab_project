import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Phone, Eye, EyeOff, UserPlus, AlertCircle, CheckCircle2 } from 'lucide-react';
import { registerCustomer } from '../services/api';
import { useAuth } from '../context/AuthContext';
import ShopKartLogo from '../components/ShopKartLogo';

const Register = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  // Controlled component states
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    phone: '',
  });

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // If already logged in, redirect to home
  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/home', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear field-specific error as user types
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
    if (serverError) setServerError('');
  };

  // Client-side form validation
  const validateForm = () => {
    const newErrors = {};

    // Full Name validation
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    } else if (formData.fullName.trim().length < 2) {
      newErrors.fullName = 'Full name must be at least 2 characters';
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!emailRegex.test(formData.email.trim())) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Password validation (backend expects at least 6 characters)
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    // Phone validation
    const phoneRegex = /^[0-9+\-\s()]{7,15}$/;
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!phoneRegex.test(formData.phone.trim())) {
      newErrors.phone = 'Please enter a valid phone number (7-15 digits)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    setSuccessMessage('');

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await registerCustomer({
        fullName: formData.fullName.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        phone: formData.phone.trim(),
      });

      // On success → Redirect to Login page
      navigate('/login', {
        state: {
          successMessage: 'Account created successfully! Please sign in with your credentials.',
          email: formData.email.trim().toLowerCase(),
        },
      });
    } catch (err) {
      const errorMsg =
        err.response?.data?.message ||
        (err.response?.status === 409
          ? 'An account with this email already exists.'
          : 'Failed to create account. Please check your network connection.');
      setServerError(errorMsg);
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
            <UserPlus size={14} />
            <span>Join ShopKart</span>
          </div>
          <h1 className="auth-title">Create Account</h1>
          <p className="auth-subtitle">
            Sign up to unlock personalized deals, fast checkout, and track orders.
          </p>
        </div>

        {/* Global Server Error Banner */}
        {serverError && (
          <div className="alert-banner alert-error" role="alert" id="register-error-banner">
            <AlertCircle size={18} className="alert-icon" />
            <div>{serverError}</div>
          </div>
        )}

        {/* Global Success Banner */}
        {successMessage && (
          <div className="alert-banner alert-success" role="status" id="register-success-banner">
            <CheckCircle2 size={18} className="alert-icon" />
            <div>{successMessage}</div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          {/* Full Name */}
          <div className="form-group">
            <label htmlFor="register-fullName" className="form-label">
              Full Name
            </label>
            <div className="input-container">
              <span className="input-icon">
                <User size={18} />
              </span>
              <input
                type="text"
                id="register-fullName"
                name="fullName"
                placeholder="e.g. John Doe"
                value={formData.fullName}
                onChange={handleChange}
                className={`form-input ${errors.fullName ? 'input-error' : ''}`}
                autoComplete="name"
              />
            </div>
            {errors.fullName && (
              <span className="field-error-text" id="register-fullname-error">
                <AlertCircle size={13} /> {errors.fullName}
              </span>
            )}
          </div>

          {/* Email */}
          <div className="form-group">
            <label htmlFor="register-email" className="form-label">
              Email Address
            </label>
            <div className="input-container">
              <span className="input-icon">
                <Mail size={18} />
              </span>
              <input
                type="email"
                id="register-email"
                name="email"
                placeholder="name@example.com"
                value={formData.email}
                onChange={handleChange}
                className={`form-input ${errors.email ? 'input-error' : ''}`}
                autoComplete="email"
              />
            </div>
            {errors.email && (
              <span className="field-error-text" id="register-email-error">
                <AlertCircle size={13} /> {errors.email}
              </span>
            )}
          </div>

          {/* Password */}
          <div className="form-group">
            <label htmlFor="register-password" className="form-label">
              Password
            </label>
            <div className="input-container">
              <span className="input-icon">
                <Lock size={18} />
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                id="register-password"
                name="password"
                placeholder="At least 6 characters"
                value={formData.password}
                onChange={handleChange}
                className={`form-input ${errors.password ? 'input-error' : ''}`}
                autoComplete="new-password"
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
              <span className="field-error-text" id="register-password-error">
                <AlertCircle size={13} /> {errors.password}
              </span>
            )}
          </div>

          {/* Phone Number */}
          <div className="form-group">
            <label htmlFor="register-phone" className="form-label">
              Phone Number
            </label>
            <div className="input-container">
              <span className="input-icon">
                <Phone size={18} />
              </span>
              <input
                type="tel"
                id="register-phone"
                name="phone"
                placeholder="e.g. +1 555-123-4567"
                value={formData.phone}
                onChange={handleChange}
                className={`form-input ${errors.phone ? 'input-error' : ''}`}
                autoComplete="tel"
              />
            </div>
            {errors.phone && (
              <span className="field-error-text" id="register-phone-error">
                <AlertCircle size={13} /> {errors.phone}
              </span>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            id="register-submit-btn"
            className="btn-submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <div className="spinner"></div>
                <span>Creating Account...</span>
              </>
            ) : (
              <>
                <UserPlus size={18} />
                <span>Create Account</span>
              </>
            )}
          </button>
        </form>

        <div className="auth-footer">
          Already have an account?{' '}
          <Link to="/login" id="link-to-login">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
