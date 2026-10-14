import React from 'react';

/**
 * ShopKartLogo
 * An iconic, professional brand logo featuring a stylized supersonic "S"
 * flying gracefully over a modern, aerodynamic shopping cart.
 *
 * @param {string} size - 'sm' | 'md' | 'lg' | 'xl'
 * @param {boolean} showText - Whether to show the "ShopKart" brand typography
 * @param {string} theme - 'dark' | 'light' (affects typography contrast)
 */
const ShopKartLogo = ({ size = 'md', showText = true, theme = 'light' }) => {
  // Scale emblem based on size prop
  const iconDimensions = {
    sm: { width: 34, height: 34, fontSize: '1.15rem' },
    md: { width: 44, height: 44, fontSize: '1.4rem' },
    lg: { width: 56, height: 56, fontSize: '1.8rem' },
    xl: { width: 68, height: 68, fontSize: '2.2rem' },
  }[size] || { width: 44, height: 44, fontSize: '1.4rem' };

  return (
    <div className={`shopkart-brand-logo size-${size} theme-${theme}`}>
      {/* ── Brand Icon Emblem ──────────────────────── */}
      <div
        className="brand-emblem-wrapper"
        style={{ width: iconDimensions.width, height: iconDimensions.height }}
      >
        <svg
          viewBox="0 0 64 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="brand-emblem-svg"
        >
          <defs>
            {/* Background container gradient */}
            <linearGradient id="badgeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0f172a" />
              <stop offset="100%" stopColor="#1e293b" />
            </linearGradient>

            {/* Shopping Cart Body Gradient */}
            <linearGradient id="cartBodyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#94a3b8" />
              <stop offset="100%" stopColor="#cbd5e1" />
            </linearGradient>

            {/* Flying "S" Dynamic Flame / Speed Gradient */}
            <linearGradient id="sGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ff4d5a" />
              <stop offset="45%" stopColor="#e63946" />
              <stop offset="100%" stopColor="#c1121f" />
            </linearGradient>

            {/* Speed trails gradient */}
            <linearGradient id="trailGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#e63946" stopOpacity="0" />
              <stop offset="60%" stopColor="#ff6b6b" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#fbbf24" stopOpacity="0.9" />
            </linearGradient>

            {/* Subtle drop shadow */}
            <filter id="glowS" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2" stdDeviation="2.5" floodColor="#e63946" floodOpacity="0.5" />
            </filter>
          </defs>

          {/* Emblem Rounded Hex / Squircle Background */}
          <rect
            x="2"
            y="2"
            width="60"
            height="60"
            rx="16"
            fill="url(#badgeGrad)"
            stroke="rgba(255, 255, 255, 0.12)"
            strokeWidth="1.5"
          />

          {/* Aerodynamic Speed Wind Trails behind the flying "S" */}
          <path
            d="M 12 21 Q 20 19 28 22"
            stroke="url(#trailGrad)"
            strokeWidth="2"
            strokeLinecap="round"
            className="trail-line-1"
          />
          <path
            d="M 10 26 Q 19 24 26 27"
            stroke="url(#trailGrad)"
            strokeWidth="1.5"
            strokeLinecap="round"
            className="trail-line-2"
          />
          <path
            d="M 15 16 Q 22 15 30 18"
            stroke="url(#trailGrad)"
            strokeWidth="1.2"
            strokeLinecap="round"
            className="trail-line-3"
          />

          {/* ── Modern Shopping Cart Base ────────────────────── */}
          {/* Handle + Base Chassis */}
          <path
            d="M 11 18 L 16 18 L 22 41 L 49 41 L 53 26 L 20 26"
            stroke="url(#cartBodyGrad)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Basket Grid Accent Lines */}
          <path
            d="M 28 26 L 30 40"
            stroke="rgba(255, 255, 255, 0.25)"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <path
            d="M 37 26 L 38 40"
            stroke="rgba(255, 255, 255, 0.25)"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <path
            d="M 45 26 L 44 40"
            stroke="rgba(255, 255, 255, 0.25)"
            strokeWidth="1.8"
            strokeLinecap="round"
          />

          {/* Cart Wheels with Gold Hubs */}
          <circle cx="26" cy="49" r="4" fill="#0f172a" stroke="#cbd5e1" strokeWidth="2" />
          <circle cx="26" cy="49" r="1.5" fill="#e63946" />
          <circle cx="45" cy="49" r="4" fill="#0f172a" stroke="#cbd5e1" strokeWidth="2" />
          <circle cx="45" cy="49" r="1.5" fill="#e63946" />

          {/* ── The Dynamic Flying "S" (Hover & Flight Animated) ── */}
          <g className="flying-s-symbol" filter="url(#glowS)">
            {/* Aerodynamic wing / speed wedge */}
            <path
              d="M 46 8 
                 C 46 8, 38 7, 33 11 
                 C 28 15, 30 20, 36 21 
                 C 42 22, 45 26, 41 30 
                 C 36 34, 28 32, 26 29
                 C 27.5 28.5, 29.5 28, 31 29
                 C 34 31, 38 30.5, 39.5 28
                 C 41 25.5, 37.5 23.5, 33 22.5
                 C 26 21, 25 15, 29 11
                 C 34 7, 43 6, 46 8 Z"
              fill="url(#sGrad)"
            />
            {/* Speed Sparkle Tip */}
            <circle cx="46" cy="8" r="1.8" fill="#fbbf24" />
          </g>
        </svg>
      </div>

      {/* ── Brand Typography ───────────────────────── */}
      {showText && (
        <div className="brand-text-container" style={{ fontSize: iconDimensions.fontSize }}>
          <span className="brand-text-shop">Shop</span>
          <span className="brand-text-kart">Kart</span>
          <span className="brand-text-dot">.</span>
        </div>
      )}
    </div>
  );
};

export default ShopKartLogo;
