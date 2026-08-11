import React from "react";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <svg 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Snake Staff (Caduceus/Asclepius inspired) */}
      <path 
        d="M50 20 L50 80 M45 35 Q35 25 50 25 Q65 25 55 35 Q45 45 50 45 Q55 45 60 55 M40 65 Q30 55 50 55" 
        stroke="currentColor" 
        strokeWidth="3" 
        strokeLinecap="round" 
      />
      {/* Letter A */}
      <path 
        d="M25 80 L50 25 L65 55" 
        stroke="currentColor" 
        strokeWidth="4" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
      />
      <path d="M35 60 L60 60" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
      {/* Letter R */}
      <path 
        d="M60 80 L60 40 C60 40 75 40 75 50 C75 60 60 60 60 60 L75 80" 
        stroke="currentColor" 
        strokeWidth="4" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
      />
    </svg>
  );
}
