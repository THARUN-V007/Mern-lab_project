import React, { useState } from 'react';
import { Trash2, Plus, Minus } from 'lucide-react';
import { useCart } from '../context/CartContext';

const CartItem = ({ item }) => {
  const { product, quantity } = item;
  const { updateQuantity, removeFromCart, isUpdating } = useCart();

  const [removing, setRemoving] = useState(false);
  const [error, setError] = useState(null);

  const updating = isUpdating(product._id);

  const formattedPrice = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(product.price);

  const lineTotal = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(product.price * quantity);

  const handleIncrease = async () => {
    setError(null);
    try {
      await updateQuantity(product._id, quantity + 1);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDecrease = async () => {
    if (quantity <= 1) return; // minimum 1 — use Remove for deletion
    setError(null);
    try {
      await updateQuantity(product._id, quantity - 1);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleRemove = async () => {
    setRemoving(true);
    setError(null);
    try {
      await removeFromCart(product._id);
    } catch (err) {
      setError(err.message);
      setRemoving(false);
    }
  };

  return (
    <div
      className={`cart-item ${removing ? 'cart-item-removing' : ''}`}
      data-testid={`cart-item-${product._id}`}
    >
      {/* Product image */}
      <div className="cart-item-image-wrap">
        <img
          src={product.image}
          alt={product.name}
          className="cart-item-image"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src =
              'https://images.unsplash.com/photo-1560343090-f0409e92791a?auto=format&fit=crop&w=200&q=80';
          }}
        />
      </div>

      {/* Product info */}
      <div className="cart-item-info">
        <h3 className="cart-item-name">{product.name}</h3>
        <p className="cart-item-unit-price">{formattedPrice} each</p>

        {/* Quantity controls */}
        <div className="cart-item-qty-controls">
          <button
            className="cart-qty-btn"
            onClick={handleDecrease}
            disabled={updating || quantity <= 1}
            aria-label="Decrease quantity"
            id={`decrease-qty-${product._id}`}
          >
            <Minus size={14} />
          </button>

          <span
            className="cart-qty-display"
            id={`qty-display-${product._id}`}
            aria-label={`Quantity: ${quantity}`}
          >
            {updating ? '...' : quantity}
          </span>

          <button
            className="cart-qty-btn"
            onClick={handleIncrease}
            disabled={updating || quantity >= product.stock}
            aria-label="Increase quantity"
            id={`increase-qty-${product._id}`}
          >
            <Plus size={14} />
          </button>

          <button
            className="cart-remove-btn"
            onClick={handleRemove}
            disabled={removing}
            aria-label={`Remove ${product.name} from cart`}
            id={`remove-cart-${product._id}`}
            data-testid={`remove-cart-${product._id}`}
          >
            <Trash2 size={14} />
            {removing ? 'Removing...' : 'Remove'}
          </button>
        </div>

        {/* Stock warning */}
        {quantity >= product.stock && (
          <p className="cart-stock-warning">Max stock reached ({product.stock} units)</p>
        )}

        {error && (
          <p className="cart-item-error" role="alert">
            {error}
          </p>
        )}
      </div>

      {/* Line total */}
      <div className="cart-item-line-total">
        <span className="cart-line-price">{lineTotal}</span>
      </div>
    </div>
  );
};

export default CartItem;
