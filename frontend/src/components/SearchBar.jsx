import React from 'react';
import { Search, Filter, X, SlidersHorizontal } from 'lucide-react';

const CATEGORIES = [
  'All Categories',
  'Electronics',
  'Fashion',
  'Books',
  'Home',
];

const SearchBar = ({
  searchTerm,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
}) => {
  return (
    <div className="search-filter-master-block">
      {/* ── Main Input & Dropdown Bar ─────────────────────── */}
      <div className="search-filter-container">
        {/* Search Input Box */}
        <div className="search-input-wrapper">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            id="product-search-input"
            className="search-input"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            aria-label="Search products by keyword"
          />
          {searchTerm && (
            <button
              type="button"
              className="search-clear-btn"
              onClick={() => onSearchChange('')}
              title="Clear search"
              aria-label="Clear search input"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Task 7: Category Dropdown */}
        <div className="category-select-wrapper">
          <Filter size={16} className="filter-icon" />
          <select
            id="category-filter-select"
            className="category-select"
            value={selectedCategory}
            onChange={(e) => onCategoryChange(e.target.value)}
            aria-label="Filter products by category"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ── Quick-Select Interactive Filter Chips ─────────── */}
      <div className="category-chips-row">
        <span className="chips-label">
          <SlidersHorizontal size={13} />
          <span>Filter:</span>
        </span>
        <div className="chips-list">
          {CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                className={`category-chip ${isActive ? 'active' : ''}`}
                onClick={() => onCategoryChange(cat)}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default SearchBar;
