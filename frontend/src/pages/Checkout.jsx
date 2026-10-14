import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  MapPin,
  ShieldCheck,
  CreditCard,
  AlertCircle,
  Loader2,
  ArrowLeft,
  ShoppingBag,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { createPaymentOrder, verifyPayment } from '../services/api';

const Checkout = () => {
  const { cartItems, cartCount, subtotal, clearCart, loading: cartLoading } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Form State
  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    phone: user?.phone || '',
    addressLine1: '',
    city: '',
    state: '',
    pincode: '',
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState(null);

  // Sync user details if available
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        fullName: prev.fullName || user.fullName || '',
        phone: prev.phone || user.phone || '',
      }));
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear field error on change
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: null,
      }));
    }
    if (apiError) setApiError(null);
  };

  // Task 3: Client-side Validation Rules
  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName || !formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }

    if (!formData.phone || !formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else {
      const cleanPhone = formData.phone.trim();
      const phonePattern = /^[0-9+\-\s]{7,15}$/;
      if (!phonePattern.test(cleanPhone)) {
        newErrors.phone = 'Please enter a valid phone number (e.g. 9876543210)';
      }
    }

    if (!formData.addressLine1 || !formData.addressLine1.trim()) {
      newErrors.addressLine1 = 'Address line 1 is required';
    }

    if (!formData.city || !formData.city.trim()) {
      newErrors.city = 'City is required';
    }

    if (!formData.state || !formData.state.trim()) {
      newErrors.state = 'State is required';
    }

    if (!formData.pincode || !formData.pincode.trim()) {
      newErrors.pincode = 'Pincode is required';
    } else {
      const cleanPin = formData.pincode.trim();
      if (!/^\d{6}$/.test(cleanPin)) {
        newErrors.pincode = 'Pincode must be exactly 6 digits';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const formattedSubtotal = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(subtotal);

  // Task 4 & Razorpay Handler
  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setApiError(null);

    // Task 3: Stop if client validation fails — do NOT call backend
    if (!validateForm()) {
      return;
    }

    if (!cartItems.length) {
      setApiError('Your cart is empty. Add items before placing an order.');
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Create order on backend (Task 4)
      const orderPayload = {
        shippingAddress: {
          fullName: formData.fullName.trim(),
          phone: formData.phone.trim(),
          addressLine1: formData.addressLine1.trim(),
          city: formData.city.trim(),
          state: formData.state.trim(),
          pincode: formData.pincode.trim(),
        },
      };

      const orderData = await createPaymentOrder(orderPayload);
      const { orderId, razorpayOrderId, amount, currency, key } = orderData;

      // 2. Open Razorpay Checkout or test mode simulation
      const isPlaceholderTestKey =
        !key || key.startsWith('rzp_test_shopkart') || razorpayOrderId.startsWith('order_test_');

      if (typeof window.Razorpay === 'function' && !isPlaceholderTestKey) {
        const options = {
          key: key,
          amount: amount,
          currency: currency || 'INR',
          name: 'ShopKart',
          description: `Order #${orderId.slice(-6)}`,
          order_id: razorpayOrderId,
          prefill: {
            name: formData.fullName,
            contact: formData.phone,
            email: user?.email || '',
          },
          theme: {
            color: '#4f46e5',
          },
          handler: async function (response) {
            try {
              // Task 4b: Verify payment signature
              const verifyRes = await verifyPayment({
                orderId,
                razorpayOrderId: response.razorpay_order_id || razorpayOrderId,
                razorpayPaymentId: response.razorpay_payment_id,
                signature: response.razorpay_signature,
              });

              if (verifyRes.success) {
                // Task 5: Clear cart context after verified payment
                clearCart();
                navigate(`/order-success/${orderId}`);
              } else {
                setApiError(verifyRes.message || 'Payment verification failed');
                setIsSubmitting(false);
              }
            } catch (verErr) {
              setApiError(
                verErr.response?.data?.message || 'Payment verification failed. Please contact support.'
              );
              setIsSubmitting(false);
            }
          },
          modal: {
            ondismiss: function () {
              setIsSubmitting(false);
            },
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', function (resp) {
          setApiError(resp.error?.description || 'Payment was unsuccessful.');
          setIsSubmitting(false);
        });
        rzp.open();
      } else {
        // Seamless Razorpay Test Mode Simulation
        const simulatedPaymentId = `pay_sim_${Date.now()}`;
        const verifyRes = await verifyPayment({
          orderId,
          razorpayOrderId: razorpayOrderId,
          razorpayPaymentId: simulatedPaymentId,
          signature: 'simulated_success_signature',
        });

        if (verifyRes.success) {
          clearCart();
          navigate(`/order-success/${orderId}`);
        } else {
          setApiError(verifyRes.message || 'Payment verification failed');
          setIsSubmitting(false);
        }
      }
    } catch (err) {
      console.error('Checkout error:', err);
      setApiError(
        err.response?.data?.message || 'Unable to initialize order. Please check stock and try again.'
      );
      setIsSubmitting(false);
    }
  };

  if (cartLoading) {
    return (
      <div className="cart-page">
        <div className="cart-loading">
          <div className="cart-loading-spinner" />
          <p>Preparing checkout...</p>
        </div>
      </div>
    );
  }

  if (!cartItems.length) {
    return (
      <div className="cart-page">
        <div className="cart-empty-state">
          <ShoppingBag size={56} className="cart-empty-icon" />
          <h2>Your Cart is Empty</h2>
          <p>Please add products to your cart before proceeding to checkout.</p>
          <Link to="/products" className="cart-browse-btn" id="checkout-browse-btn">
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page" style={{ maxWidth: '1100px', margin: '0 auto', padding: '32px 16px' }}>
      <div style={{ marginBottom: '24px' }}>
        <Link
          to="/cart"
          id="checkout-back-link"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            color: 'var(--text-secondary, #64748b)',
            textDecoration: 'none',
            fontSize: '14px',
            fontWeight: 500,
            marginBottom: '12px',
          }}
        >
          <ArrowLeft size={16} /> Back to Cart
        </Link>
        <h1 style={{ fontSize: '28px', fontWeight: 800, margin: 0, color: 'var(--text-primary, #0f172a)' }}>
          Checkout
        </h1>
        <p style={{ color: 'var(--text-secondary, #64748b)', marginTop: '4px', fontSize: '15px' }}>
          Enter your delivery details and review your order before payment.
        </p>
      </div>

      {apiError && (
        <div
          id="checkout-error-banner"
          data-testid="checkout-error-banner"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '14px 18px',
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#b91c1c',
            borderRadius: '10px',
            marginBottom: '24px',
            fontSize: '14px',
            fontWeight: 500,
          }}
        >
          <AlertCircle size={20} style={{ flexShrink: 0 }} />
          <span>{apiError}</span>
        </div>
      )}

      <div
        className="checkout-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1.3fr) minmax(0, 1fr)',
          gap: '32px',
          alignItems: 'start',
        }}
      >
        {/* Left Column: Shipping Address Form */}
        <section
          className="checkout-form-section"
          style={{
            backgroundColor: 'var(--surface-card, #ffffff)',
            borderRadius: '16px',
            padding: '28px',
            boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
            border: '1px solid var(--border-color, #e2e8f0)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                backgroundColor: '#e0e7ff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#4f46e5',
              }}
            >
              <MapPin size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>Shipping Details</h2>
              <small style={{ color: 'var(--text-secondary, #64748b)' }}>
                Please provide accurate contact and address information.
              </small>
            </div>
          </div>

          <form id="shipping-form" onSubmit={handlePlaceOrder} noValidate>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Full Name */}
              <div>
                <label
                  htmlFor="fullName"
                  style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}
                >
                  Full Name <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  data-testid="input-fullName"
                  placeholder="e.g. Aarav Sharma"
                  value={formData.fullName}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: errors.fullName ? '1.5px solid #ef4444' : '1px solid #cbd5e1',
                    fontSize: '14px',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
                {errors.fullName && (
                  <p id="error-fullName" style={{ color: '#ef4444', fontSize: '12px', margin: '4px 0 0' }}>
                    {errors.fullName}
                  </p>
                )}
              </div>

              {/* Phone */}
              <div>
                <label
                  htmlFor="phone"
                  style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}
                >
                  Phone Number <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  data-testid="input-phone"
                  placeholder="e.g. 9876543210"
                  value={formData.phone}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: errors.phone ? '1.5px solid #ef4444' : '1px solid #cbd5e1',
                    fontSize: '14px',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
                {errors.phone && (
                  <p id="error-phone" style={{ color: '#ef4444', fontSize: '12px', margin: '4px 0 0' }}>
                    {errors.phone}
                  </p>
                )}
              </div>

              {/* Address Line 1 */}
              <div>
                <label
                  htmlFor="addressLine1"
                  style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}
                >
                  Address Line 1 <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="text"
                  id="addressLine1"
                  name="addressLine1"
                  data-testid="input-addressLine1"
                  placeholder="e.g. Flat 402, Sunshine Apartments, MG Road"
                  value={formData.addressLine1}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: errors.addressLine1 ? '1.5px solid #ef4444' : '1px solid #cbd5e1',
                    fontSize: '14px',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
                {errors.addressLine1 && (
                  <p id="error-addressLine1" style={{ color: '#ef4444', fontSize: '12px', margin: '4px 0 0' }}>
                    {errors.addressLine1}
                  </p>
                )}
              </div>

              {/* City and State grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <label
                    htmlFor="city"
                    style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}
                  >
                    City <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    data-testid="input-city"
                    placeholder="e.g. Bengaluru"
                    value={formData.city}
                    onChange={handleChange}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      border: errors.city ? '1.5px solid #ef4444' : '1px solid #cbd5e1',
                      fontSize: '14px',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                  {errors.city && (
                    <p id="error-city" style={{ color: '#ef4444', fontSize: '12px', margin: '4px 0 0' }}>
                      {errors.city}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="state"
                    style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}
                  >
                    State <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    type="text"
                    id="state"
                    name="state"
                    data-testid="input-state"
                    placeholder="e.g. Karnataka"
                    value={formData.state}
                    onChange={handleChange}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      border: errors.state ? '1.5px solid #ef4444' : '1px solid #cbd5e1',
                      fontSize: '14px',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                  {errors.state && (
                    <p id="error-state" style={{ color: '#ef4444', fontSize: '12px', margin: '4px 0 0' }}>
                      {errors.state}
                    </p>
                  )}
                </div>
              </div>

              {/* Pincode */}
              <div>
                <label
                  htmlFor="pincode"
                  style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}
                >
                  Pincode (6 digits) <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="text"
                  id="pincode"
                  name="pincode"
                  data-testid="input-pincode"
                  placeholder="e.g. 560001"
                  maxLength={6}
                  value={formData.pincode}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: errors.pincode ? '1.5px solid #ef4444' : '1px solid #cbd5e1',
                    fontSize: '14px',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
                {errors.pincode && (
                  <p id="error-pincode" style={{ color: '#ef4444', fontSize: '12px', margin: '4px 0 0' }}>
                    {errors.pincode}
                  </p>
                )}
              </div>
            </div>
          </form>
        </section>

        {/* Right Column: Order Summary & Place Order */}
        <aside
          className="checkout-summary-section"
          style={{
            backgroundColor: 'var(--surface-card, #ffffff)',
            borderRadius: '16px',
            padding: '28px',
            boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
            border: '1px solid var(--border-color, #e2e8f0)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>Order Summary</h2>
            <span
              style={{
                fontSize: '12px',
                fontWeight: 600,
                backgroundColor: '#f1f5f9',
                color: '#475569',
                padding: '4px 8px',
                borderRadius: '6px',
              }}
            >
              {cartCount} {cartCount === 1 ? 'item' : 'items'}
            </span>
          </div>

          {/* Cart items list */}
          <div
            style={{
              maxHeight: '260px',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              marginBottom: '20px',
              paddingRight: '4px',
            }}
          >
            {cartItems.map((item) => (
              <div
                key={item.product?._id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '10px',
                  backgroundColor: '#f8fafc',
                  borderRadius: '10px',
                  border: '1px solid #f1f5f9',
                }}
              >
                {item.product?.image ? (
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    style={{
                      width: '46px',
                      height: '46px',
                      objectFit: 'cover',
                      borderRadius: '6px',
                      backgroundColor: '#e2e8f0',
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: '46px',
                      height: '46px',
                      borderRadius: '6px',
                      backgroundColor: '#e2e8f0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#94a3b8',
                    }}
                  >
                    <ShoppingBag size={20} />
                  </div>
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p
                    style={{
                      margin: '0 0 2px',
                      fontSize: '13px',
                      fontWeight: 600,
                      color: '#1e293b',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {item.product?.name}
                  </p>
                  <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>
                    Qty: {item.quantity} × ₹{item.product?.price}
                  </p>
                </div>
                <div style={{ textAlign: 'right', fontWeight: 700, fontSize: '13px', color: '#0f172a' }}>
                  ₹{(item.product?.price || 0) * item.quantity}
                </div>
              </div>
            ))}
          </div>

          <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '16px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: '#64748b', marginBottom: '8px' }}>
              <span>Items Total</span>
              <span>{formattedSubtotal}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: '#64748b', marginBottom: '8px' }}>
              <span>Shipping Delivery</span>
              <span style={{ color: '#10b981', fontWeight: 600 }}>FREE</span>
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '18px',
                fontWeight: 800,
                color: '#0f172a',
                borderTop: '1px dashed #cbd5e1',
                paddingTop: '12px',
                marginTop: '10px',
              }}
            >
              <span>Total Payable</span>
              <span id="checkout-total-amount" data-testid="checkout-total-amount">
                {formattedSubtotal}
              </span>
            </div>
          </div>

          {/* Place Order CTA */}
          <button
            type="button"
            id="place-order-btn"
            data-testid="place-order-btn"
            onClick={handlePlaceOrder}
            disabled={isSubmitting}
            style={{
              width: '100%',
              padding: '14px',
              borderRadius: '10px',
              backgroundColor: '#4f46e5',
              color: '#ffffff',
              border: 'none',
              fontSize: '15px',
              fontWeight: 700,
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              opacity: isSubmitting ? 0.75 : 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'background-color 0.2s',
            }}
          >
            {isSubmitting ? (
              <>
                <Loader2 size={18} className="animate-spin" /> Processing Payment...
              </>
            ) : (
              <>
                <CreditCard size={18} /> Place Order & Pay {formattedSubtotal}
              </>
            )}
          </button>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              marginTop: '16px',
              color: '#64748b',
              fontSize: '12px',
            }}
          >
            <ShieldCheck size={14} style={{ color: '#10b981' }} />
            <span>Secure 256-bit Razorpay Checkout</span>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Checkout;
