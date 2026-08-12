import React from 'react';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'; // Added 'xl' for full-page loading
  className?: string;
}

export default function LoadingSpinner({ size = 'md', className }: LoadingSpinnerProps) {
  // Adjusted sizes slightly because an SVG visually appears a bit smaller than a circle border
  const sizeClasses = {
    sm: 'h-5 w-5',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16' // Perfect size for a full-screen initial page load
  };

  return (
    <div className={cn("flex items-center justify-center", className)}>
      <svg
        viewBox="0 0 24 24"
        aria-label="X"
        // "fill-foreground" ensures it automatically respects dark/light mode text colors
        // "animate-pulse" gives it that authentic Twitter fade-in/fade-out effect
        className={cn("fill-foreground animate-pulse", sizeClasses[size])}
      >
        <g>
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path>
        </g>
      </svg>
      <span className="sr-only">Loading...</span>
    </div>
  );
}