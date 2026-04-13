import React from 'react';

export default function BrandLogo() {
  return (
    <div className="brand-logo">
      <svg width="42" height="42" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="100" height="100" rx="28" fill="#172554" />
        <path d="M 32 25 H 58 C 72 25 80 32 80 44 C 80 56 72 63 58 63 H 32 V 25 Z" fill="#ffffff" />
        <path d="M 46 38 H 56 C 62 38 65 41 65 44 C 65 47 62 50 56 50 H 46 V 38 Z" fill="#172554" />
        <rect x="32" y="25" width="14" height="50" rx="2" fill="#ffffff" />
        <path d="M 52 56 Q 65 56 72 75 H 86 Q 78 50 58 48 Z" fill="#dc2626" />
      </svg>
    </div>
  );
}
