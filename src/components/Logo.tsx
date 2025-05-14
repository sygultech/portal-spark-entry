
import React from "react";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  variant?: "primary" | "white";
}

const Logo = ({ size = "md", variant = "primary" }: LogoProps) => {
  const sizeClasses = {
    sm: "text-xl",
    md: "text-2xl",
    lg: "text-3xl",
  };

  const colorClass = variant === "white" ? "text-white" : "text-primary";

  return (
    <div className={`font-bold ${sizeClasses[size]} ${colorClass} flex items-center`}>
      <span className="mr-1">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className={`${size === "sm" ? "h-6 w-6" : size === "md" ? "h-7 w-7" : "h-8 w-8"}`}
        >
          <path
            fillRule="evenodd"
            d="M9.315 7.584C12.195 3.883 16.695 1.5 21.75 1.5a.75.75 0 0 1 .75.75c0 5.056-2.383 9.555-6.084 12.436A6.75 6.75 0 0 1 9.75 22.5a.75.75 0 0 1-.75-.75v-4.131A15.838 15.838 0 0 1 6.382 15H2.25a.75.75 0 0 1-.75-.75 6.75 6.75 0 0 1 7.815-6.666ZM15 6.75a2.25 2.25 0 1 0 0 4.5 2.25 2.25 0 0 0 0-4.5Z"
            clipRule="evenodd"
          />
        </svg>
      </span>
      SaasFlow
    </div>
  );
};

export default Logo;
