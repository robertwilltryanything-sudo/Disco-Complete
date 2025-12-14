
import React from 'react';

export const VinylIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    {...props}
  >
    <circle cx="12" cy="12" r="10" fill="black" />
    <circle cx="12" cy="12" r="4" fill="#b94e3a" />
    <circle cx="12" cy="12" r="1" fill="black" />
  </svg>
);
