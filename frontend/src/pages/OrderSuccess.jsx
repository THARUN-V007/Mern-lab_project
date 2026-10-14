import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  CheckCircle2,
  Package,
  ArrowRight,
  ShoppingBag,
  Calendar,
  CreditCard,
  MapPin,
  Loader2,
} from 'lucide-react';
import { getOrderById } from '../services/api';

const OrderSuccess = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        const data = await getOrderById(id);
        setOrder(data.order);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to retrieve order confirmation.');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchOrder();
    }
  }, [id]);

  if (loading) {
    return (
      <div style={{ maxWidth: '640px', margin: '60px auto', textAlign: 'center', padding: '32px' }}>
        <Loader2 size={36} className="animate-spin" style={{ color: '#4f46e5', margin: '0 auto 16px' }} />
        <p style={{ color: '#64748b', fontSize: '15px' }}>Loading order confirmation...</p>
      </div>
    );
  }

  const formattedTotal = order
    ? new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0,
      }).format(order.totalAmount)
    : '';

  return (
    <div
      className="order-success-page"
      style={{
        maxWidth: '680px',
        margin: '40px auto',
        padding: '24px 16px',
      }}
    >
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '20px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 10px 30px -5px rgba(0, 0, 0, 0.06)',
          padding: '40px 32px',
          textAlign: 'center',
        }}
      >
        {/* Success Icon */}
        <div
          style={{
            width: '72px',
            height: '72px',
            borderRadius: '50%',
            backgroundColor: '#dcfce7',
            color: '#16a34a',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px',
          }}
        >
          <CheckCircle2 size={44} />
        </div>

        <h1
          id="order-success-title"
          data-testid="order-success-title"
          style={{
            fontSize: '26px',
            fontWeight: 800,
            color: '#0f172a',
            margin: '0 0 8px',
          }}
        >
          Order Placed Successfully!
        </h1>
        <p style={{ color: '#64748b', fontSize: '15px', margin: '0 0 28px' }}>
          Thank you for your purchase. We have received your order and are preparing it for delivery.
        </p>

        {/* Order Details Summary Card */}
        <div
          style={{
            backgroundColor: '#f8fafc',
            border: '1px solid #f1f5f9',
            borderRadius: '14px',
            padding: '20px',
            textAlign: 'left',
            marginBottom: '28px',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderBottom: '1px solid #e2e8f0',
              paddingBottom: '12px',
              marginBottom: '14px',
            }}
          >
            <div>
              <span style={{ fontSize: '12px', color: '#64748b', display: 'block' }}>Order Reference</span>
              <strong id="order-id-display" data-testid="order-id-display" style={{ fontSize: '15px', color: '#0f172a' }}>
                #{order?._id || id}
              </strong>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '12px', color: '#64748b', display: 'block' }}>Status</span>
              <span
                id="order-status-badge"
                data-testid="order-status-badge"
                style={{
                  display: 'inline-block',
                  backgroundColor: '#dcfce7',
                  color: '#15803d',
                  fontSize: '12px',
                  fontWeight: 700,
                  padding: '3px 10px',
                  borderRadius: '20px',
                }}
              >
                {order?.status || 'PLACED'}
              </span>
            </div>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
              gap: '12px',
              fontSize: '13px',
              marginBottom: '16px',
            }}
          >
            <div>
              <span style={{ color: '#64748b', display: 'block', marginBottom: '2px' }}>Total Amount</span>
              <strong id="order-total-display" data-testid="order-total-display" style={{ fontSize: '16px', color: '#0f172a' }}>
                {formattedTotal}
              </strong>
            </div>
            <div>
              <span style={{ color: '#64748b', display: 'block', marginBottom: '2px' }}>Payment Status</span>
              <strong style={{ color: '#16a34a' }}>{order?.paymentStatus || 'PAID'}</strong>
            </div>
            {order?.shippingAddress && (
              <div>
                <span style={{ color: '#64748b', display: 'block', marginBottom: '2px' }}>Deliver To</span>
                <span style={{ color: '#334155' }}>
                  {order.shippingAddress.fullName} ({order.shippingAddress.city})
                </span>
              </div>
            )}
          </div>

          {/* Purchased Items List */}
          {order?.items && order.items.length > 0 && (
            <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '12px' }}>
              <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', display: 'block', marginBottom: '8px' }}>
                Items in this order:
              </span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {order.items.map((item, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: '13px',
                      color: '#334155',
                    }}
                  >
                    <span>
                      {item.name} × {item.quantity}
                    </span>
                    <strong>₹{item.price * item.quantity}</strong>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Action CTAs */}
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link
            to="/orders"
            id="view-orders-btn"
            data-testid="view-orders-btn"
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
            <Package size={16} /> View My Orders
          </Link>

          <Link
            to="/products"
            id="continue-shopping-btn"
            data-testid="continue-shopping-btn"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 24px',
              backgroundColor: '#f1f5f9',
              color: '#334155',
              borderRadius: '10px',
              textDecoration: 'none',
              fontWeight: 600,
              fontSize: '14px',
            }}
          >
            <ShoppingBag size={16} /> Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;
