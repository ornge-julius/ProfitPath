import React from 'react';

/**
 * "Staircase Ascent" brand mark. Geometry must stay in sync with the
 * master source file: app/src/assets/logo-mark.svg
 *
 * The staircase body uses currentColor so it inherits whatever text-color
 * classes are passed in (matching the wordmark's hover-to-gold behavior).
 * The summit dot is always brand gold, same rule as "Path" in the wordmark.
 */
const LogoMark = ({ className = 'w-6 h-6', title = 'ProfitPath logo' }) => (
  <svg viewBox="0 0 256 256" className={className} role="img" aria-label={title}>
    <title>{title}</title>
    <path
      fill="currentColor"
      d="M 48 224 L 48 168 L 104 168 L 104 128 L 160 128 L 160 88 L 208 88 L 208 224 Z"
    />
    <circle cx="192" cy="72" r="16" className="fill-gold" />
  </svg>
);

export default LogoMark;
