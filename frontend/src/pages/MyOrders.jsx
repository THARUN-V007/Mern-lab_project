import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Package,
  Calendar,
  CreditCard,
  ShoppingBag,
  ArrowRight,
  AlertCircle,
  Loader2,
  RefreshCw,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { getMyOrders } from '../services/api';

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedOrderId, setExpandedOrderId] = useState(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getMyOrders();
      setOrders(data.orders || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load your orders.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const toggleOrderDetails = (orderId) => {
    setExpandedOrderId((prev) => (prev === orderId ? null : orderId));
  };

  const getStatusBadgeStyle = (status) => {
    switch (status) {
      case 'PLACED':
      case 'CONFIRMED':
        return { bg: '#dcfce7', text: '#15803d', border: '#bbf7d0' };
      case 'SHIPPED':
        return { bg: '#e0e7ff', text: '#4338ca', border: '#c7d2fe' };
      case 'DELIVERED':
        return { bg: '#f0fdf4', text: '#166534', border: '#86efac' };
      case 'PENDING_PAYMENT':
        return { bg: '#fef3c7', text: '#b45309', border: '#fde68a' };
      default:
        return { bg: '#f1f5f9', text: '#475569', border: '#e2e8f0' };
    }
  };

  // ── Loading state ──────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div style={{ maxWidth: '850px', margin: '40px auto', padding: '24px 16px' }}>
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <Loader2 size={40} className="animate-spin" style={{ color: '#4f46e5', margin: '0 auto 16px' }} />
          <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#1e293b' }}>Loading your orders...</h2>
          <p style={{ color: '#64748b', fontSize: '14px' }}>Please wait while we retrieve your order history.</p>
        </div>
      </div>
    );
  }

  // ── Error state ────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div style={{ maxWidth: '850px', margin: '40px auto', padding: '24px 16px' }}>
        <div
          style={{
            textAlign: 'center',
            padding: '48px 24px',
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            border: '1px solid #fee2e2',
            boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
          }}
        >
          <AlertCircle size={44} style={{ color: '#ef4444', margin: '0 auto 16px' }} />
          <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#1e293b', margin: '0 0 8px' }}>
            Unable to load orders
          </h2>
          <p style={{ color: '#64748b', fontSize: '14px', margin: '0 0 20px' }}>{error}</p>
          <button
            onClick={fetchOrders}
            id="orders-retry-btn"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 20px',
              backgroundColor: '#4f46e5',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 600,
              fontSize: '14px',
              cursor: 'pointer',
            }}
          >
            <RefreshCw size={16} /> Try Again
          </button>
        </div>
      </div>
    );
  }

  // ── Empty state ────────────────────────────────────────────────────────────
  if (!orders.length) {
    return (
      <div style={{ maxWidth: '850px', margin: '40px auto', padding: '24px 16px' }}>
        <div
          id="orders-empty-state"
          data-testid="orders-empty-state"
          style={{
            textAlign: 'center',
            padding: '64px 24px',
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
          }}
        >
          <div
            style={{
              width: '72px',
              height: '72px',
              borderRadius: '50%',
              backgroundColor: '#f1f5f9',
              color: '#94a3b8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
            }}
          >
            <Package size={36} />
          </div>
          <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#0f172a', margin: '0 0 8px' }}>
            You have not placed any orders yet.
          </h2>
          <p style={{ color: '#64748b', fontSize: '15px', margin: '0 0 24px' }}>
            When you purchase items from ShopKart, your orders will appear here.
          </p>
          <Link
            to="/products"
            id="start-shopping-btn"
            data-testid="start-shopping-btn"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 24px',
              backgroundColor: '#4f46e5',
              color: '#ffffff',
              borderRadius: '10px',
              textDecoration: 'none',
              fontWeight: 700,
              fontSize: '14px',
              boxShadow: '0 2px 8px rgba(79, 70, 229, 0.25)',
            }}
          >
            <ShoppingBag size={16} /> Start Shopping <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    );
  }

  // ── Orders List ────────────────────────────────────────────────────────────
  return (
    <div style={{ maxWidth: '900px', margin: '32px auto', padding: '0 16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: 800, margin: 0, color: '#0f172a' }}>
            My Orders
          </h1>
          <p style={{ color: '#64748b', fontSize: '14px', margin: '4px 0 0' }}>
            Track and review your previous purchases.
          </p>
        </div>
        <span
          style={{
            fontSize: '13px',
            fontWeight: 600,
            backgroundColor: '#e0e7ff',
            color: '#4338ca',
            padding: '6px 14px',
            borderRadius: '20px',
          }}
        >
          {orders.length} {orders.length === 1 ? 'Order' : 'Orders'}
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {orders.map((order) => {
          const badge = getStatusBadgeStyle(order.status);
          const isExpanded = expandedOrderId === order._id;
          const formattedDate = new Date(order.createdAt).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          });
          const formattedAmount = new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0,
          }).format(order.totalAmount);

          return (
            <div
              key={order._id}
              className="order-card"
              data-testid={`order-card-${order._id}`}
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '14px',
                border: '1px solid #e2e8f0',
                boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
                overflow: 'hidden',
              }}
            >
              {/* Order Header */}
              <div
                style={{
                  padding: '18px 22px',
                  backgroundColor: '#f8fafc',
                  borderBottom: '1px solid #e2e8f0',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '12px',
                }}
              >
                <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', alignItems: 'center' }}>
                  <div>
                    <span style={{ fontSize: '11px', color: '#64748b', display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Order ID
                    </span>
                    <strong style={{ fontSize: '14px', color: '#0f172a' }}>
                      #{order._id.substring(order._id.length - 8).toUpperCase()}
                    </strong>
                  </div>

                  <div>
                    <span style={{ fontSize: '11px', color: '#64748b', display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Date
                    </span>
                    <span style={{ fontSize: '14px', color: '#334155' }}>
                      {formattedDate}
                    </span>
                  </div>

                  <div>
                    <span style={{ fontSize: '11px', color: '#64748b', display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Total Amount
                    </span>
                    <strong style={{ fontSize: '15px', color: '#0f172a' }}>
                      {formattedAmount}
                    </strong>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span
                    style={{
                      fontSize: '12px',
                      fontWeight: 700,
                      backgroundColor: badge.bg,
                      color: badge.text,
                      border: `1px solid ${badge.border}`,
                      padding: '4px 12px',
                      borderRadius: '20px',
                    }}
                  >
                    {order.status}
                  </span>

                  <button
                    onClick={() => toggleOrderDetails(order._id)}
                    className="view-details-btn"
                    id={`view-details-${order._id}`}
                    data-testid={`view-details-${order._id}`}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '6px 12px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      backgroundColor: '#ffffff',
                      color: '#334155',
                      fontSize: '13px',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    {isExpanded ? 'Hide Details' : 'View Details'}
                    {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </button>
                </div>
              </div>

              {/* Order Items Preview */}
              <div style={{ padding: '20px 22px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {order.items.map((item, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '12px',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.name}
                            style={{
                              width: '42px',
                              height: '42px',
                              objectFit: 'cover',
                              borderRadius: '6px',
                              backgroundColor: '#f1f5f9',
                            }}
                          />
                        ) : (
                          <div
                            style={{
                              width: '42px',
                              height: '42px',
                              borderRadius: '6px',
                              backgroundColor: '#f1f5f9',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: '#94a3b8',
                            }}
                          >
                            <Package size={20} />
                          </div>
                        )}
                        <div style={{ minWidth: 0 }}>
                          <p
                            style={{
                              margin: 0,
                              fontSize: '14px',
                              fontWeight: 600,
                              color: '#1e293b',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                            }}
                          >
                            {item.name}
                          </p>
                          <small style={{ color: '#64748b' }}>
                            Quantity: {item.quantity} × ₹{item.price}
                          </small>
                        </div>
                      </div>
                      <div style={{ fontWeight: 700, fontSize: '14px', color: '#0f172a' }}>
                        ₹{item.price * item.quantity}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Expanded Details section */}
                {isExpanded && (
                  <div
                    style={{
                      marginTop: '18px',
                      paddingTop: '16px',
                      borderTop: '1px dashed #cbd5e1',
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                      gap: '16px',
                      fontSize: '13px',
                      backgroundColor: '#f8fafc',
                      padding: '16px',
                      borderRadius: '10px',
                    }}
                  >
                    <div>
                      <strong style={{ display: 'block', color: '#0f172a', marginBottom: '4px' }}>
                        Delivery Address
                      </strong>
                      <p style={{ margin: 0, color: '#475569', lineHeight: 1.5 }}>
                        {order.shippingAddress?.fullName}
                        <br />
                        {order.shippingAddress?.addressLine1}
                        <br />
                        {order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.pincode}
                        <br />
                        Phone: {order.shippingAddress?.phone}
                      </p>
                    </div>

                    <div>
                      <strong style={{ display: 'block', color: '#0f172a', marginBottom: '4px' }}>
                        Payment Information
                      </strong>
                      <p style={{ margin: 0, color: '#475569', lineHeight: 1.5 }}>
                        Status: <strong style={{ color: '#16a34a' }}>{order.paymentStatus}</strong>
                        <br />
                        {order.razorpayPaymentId && (
                          <>
                            Payment ID: {order.razorpayPaymentId}
                            <br />
                          </>
                        )}
                        Full Order ID: {order._id}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MyOrders;
