import React, { useState, useEffect, useCallback } from 'react';
import { ShoppingBag, AlertCircle, RefreshCw, Sparkles, Inbox } from 'lucide-react';
import SearchBar from '../components/SearchBar';
import ProductCard from '../components/ProductCard';
import { getProducts } from '../services/api';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');

  // Fetch products from backend GET /products?search=...&category=...
  const fetchProductsList = useCallback(async (searchQuery, categoryQuery) => {
    try {
      setLoading(true);
      setError(null);

      const params = {};
      if (searchQuery && searchQuery.trim()) {
        params.search = searchQuery.trim();
      }
      if (categoryQuery && categoryQuery !== 'All Categories' && categoryQuery.toLowerCase() !== 'all') {
        params.category = categoryQuery.trim();
      }

      const response = await getProducts(params);
      setProducts(response.products || []);
    } catch (err) {
      // Error state requirement: "Something went wrong while loading products."
      setError('Something went wrong while loading products.');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounced search & immediate category change
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProductsList(searchTerm, selectedCategory);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm, selectedCategory, fetchProductsList]);

  return (
    <div className="products-page-container">
      {/* Page Header */}
      <div className="products-hero-header">
        <div className="hero-tag">
          <Sparkles size={14} />
          <span>ShopKart Catalogue</span>
        </div>
        <h1 className="products-main-title">Explore Our Products</h1>
        <p className="products-main-subtitle">
          Discover handpicked tech gadgets, apparel, books, and lifestyle goods crafted for everyday excellence.
        </p>

        {/* Task 7: Search Bar and Category Filter */}
        <SearchBar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
        />
      </div>

      {/* Main Content Area: Loading, Error, Empty, or Product Grid */}
      <section className="products-content-section" aria-live="polite">
        {/* 1. Loading State */}
        {loading && (
          <div className="product-state-container loading-state" id="products-loading-state">
            <div className="spinner spinner-dark"></div>
            <p className="state-message">Loading products...</p>
          </div>
        )}

        {/* 2. Error State */}
        {!loading && error && (
          <div className="product-state-container error-state" id="products-error-state">
            <AlertCircle size={44} className="state-icon error-icon" />
            <h2 className="state-heading">Failed to Load Catalogue</h2>
            <p className="state-message" id="products-error-message">{error}</p>
            <button
              type="button"
              className="btn-retry"
              onClick={() => fetchProductsList(searchTerm, selectedCategory)}
            >
              <RefreshCw size={15} />
              <span>Retry</span>
            </button>
          </div>
        )}

        {/* 3. Empty State */}
        {!loading && !error && products.length === 0 && (
          <div className="product-state-container empty-state" id="products-empty-state">
            <Inbox size={48} className="state-icon empty-icon" />
            <h2 className="state-heading">No products found.</h2>
            <p className="state-message">
              We couldn't find any products matching{' '}
              {searchTerm && <strong>"{searchTerm}"</strong>}
              {searchTerm && selectedCategory !== 'All Categories' && ' in '}
              {selectedCategory !== 'All Categories' && <strong>{selectedCategory}</strong>}.
            </p>
            {(searchTerm || selectedCategory !== 'All Categories') && (
              <button
                type="button"
                className="btn-clear-filters"
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('All Categories');
                }}
              >
                Clear all filters
              </button>
            )}
          </div>
        )}

        {/* 4. Products Grid: Rendered dynamically via .map() */}
        {!loading && !error && products.length > 0 && (
          <>
            <div className="products-results-bar">
              <span className="results-count">
                Showing <strong>{products.length}</strong> {products.length === 1 ? 'product' : 'products'}
              </span>
            </div>

            <div className="products-grid" id="products-grid">
              {products.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          </>
        )}
      </section>
    </div>
  );
};

export default Products;
