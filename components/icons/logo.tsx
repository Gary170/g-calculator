import React from 'react';

export function Logo({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="32"
      height="32"
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M6 25V7C6 6.44772 6.44772 6 7 6H25C25.5523 6 26 6.44772 26 7V25C26 25.5523 25.5523 26 25 26H7C6.44772 26 6 25.5523 6 25Z"
        className="stroke-primary"
        strokeWidth="2"
      />
      <path d="M12 11H20" className="stroke-primary" strokeWidth="2" strokeLinecap="round" />
      <path d="M16 11V21" className="stroke-accent" strokeWidth="2" strokeLinecap="round" />
      <path d="M12 21H20" className="stroke-primary" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
