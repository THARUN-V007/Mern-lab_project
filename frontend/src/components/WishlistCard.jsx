import React from 'react';
import { Link } from 'react-router-dom';
import { Trash2, ArrowRight, Tag, PackageCheck, AlertTriangle } from 'lucide-react';

const WishlistCard = ({ product, onRemove, isRemoving = false }) => {
  const { _id, name, price, category, image, stock } = product;

  // Format currency in Indian Rupees
  const formattedPrice = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(price || 0);

  const isOutOfStock = stock <= 0;

  return (
    <div className="wishlist-card" data-testid={`wishlist-card-${_id}`}>
      {/* Product Image */}
      <div className="wishlist-card-media">
        <img
          src={image}
          alt={name}
          className="wishlist-card-img"
          loading="lazy"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src =
              'https://images.unsplash.com/photo-1560343090-f0409e92791a?auto=format&fit=crop&w=600&q=80';
          }}
        />
        {category && (
          <span className="wishlist-card-category">
            <Tag size={11} />
            {category}
          </span>
        )}
      </div>

      {/* Card Content */}
      <div className="wishlist-card-content">
        <h3 className="wishlist-card-title" title={name}>
          {name}
        </h3>

        <div className="wishlist-card-meta">
          <span className="wishlist-card-price">{formattedPrice}</span>
          <span
            className={`wishlist-card-stock ${
              isOutOfStock ? 'stock-out' : 'stock-in'
            }`}
          >
            {isOutOfStock ? (
              <>
                <AlertTriangle size={12} /> Out of stock
              </>
            ) : (
              <>
                <PackageCheck size={12} /> In stock
              </>
            )}
          </span>
        </div>

        {/* Required Actions: [ View Details ] & [ Remove from Wishlist ] */}
        <div className="wishlist-card-actions">
          <Link
            to={`/products/${_id}`}
            className="btn-wishlist-view"
            id={`wishlist-view-${_id}`}
            data-testid={`wishlist-view-${_id}`}
            title={`View details for ${name}`}
          >
            <span>View Details</span>
            <ArrowRight size={14} />
          </Link>

          <button
            type="button"
            className="btn-wishlist-remove"
            id={`wishlist-remove-${_id}`}
            data-testid={`wishlist-remove-${_id}`}
            onClick={() => onRemove(_id)}
            disabled={isRemoving}
            title="Remove from Wishlist"
            aria-label={`Remove ${name} from Wishlist`}
          >
            <Trash2 size={14} />
            <span>{isRemoving ? 'Removing...' : 'Remove from Wishlist'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default WishlistCard;
