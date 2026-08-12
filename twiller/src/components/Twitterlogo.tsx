"use client";

import React from "react";

interface TwitterLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
}

export default function TwitterLogo({ className = "", size = "md" }: TwitterLogoProps) {
  // Define default dimensions based on the optional size prop
  const sizeClasses = {
    sm: "h-6 w-6",
    md: "h-12 w-12",
    lg: "h-32 w-32",
    xl: "h-48 w-48",
  };

  // If a specific height/width class is already provided in the custom className, 
  // we let that take precedence; otherwise, we append the size utility mapping.
  const hasExplicitSize = className.includes("h-") || className.includes("w-");
  const computedDimensions = hasExplicitSize ? "" : sizeClasses[size];

  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={`fill-current text-white transition-all duration-200 ${computedDimensions} ${className}`}
    >
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}