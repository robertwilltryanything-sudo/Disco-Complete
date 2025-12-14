import React from 'react';

export const CDIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="1.5" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    {...props}
  >
    <defs>
      <linearGradient id="cd-rainbow-sheen" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="rgba(255, 0, 255, 0.2)" />
        <stop offset="20%" stopColor="rgba(0, 0, 255, 0.2)" />
        <stop offset="40%" stopColor="rgba(0, 255, 255, 0.2)" />
        <stop offset="60%" stopColor="rgba(0, 255, 0, 0.2)" />
        <stop offset="80%" stopColor="rgba(255, 255, 0, 0.2)" />
        <stop offset="100%" stopColor="rgba(255, 0, 0, 0.2)" />
      </linearGradient>
    </defs>
    
    {/* Base grey disc */}
    <circle cx="12" cy="12" r="10" fill="#e4e4e7" stroke="none" />
    
    {/* Rainbow sheen overlay */}
    <circle cx="12" cy="12" r="10" fill="url(#cd-rainbow-sheen)" stroke="none" />
    
    {/* Outer border, using the stroke from props */}
    <circle cx="12" cy="12" r="10" fill="none" />
    
    {/* Center hole */}
    <circle cx="12" cy="12" r="3" fill="white" />
  </svg>
);