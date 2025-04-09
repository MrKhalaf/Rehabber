import * as React from "react";
import { cn } from "@/lib/utils";

interface CircularProgressProps {
  value: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
  backgroundStroke?: string;
  progressStroke?: string;
  showValue?: boolean;
  label?: React.ReactNode;
  valueClassName?: string;
  children?: React.ReactNode;
}

export const CircularProgress = React.forwardRef<HTMLDivElement, CircularProgressProps>(
  ({ 
    value, 
    max = 100, 
    size = 256, 
    strokeWidth = 10, 
    className,
    backgroundStroke = "currentColor",
    progressStroke = "currentColor",
    showValue = false,
    label,
    valueClassName,
    children
  }, ref) => {
    const normalizedValue = Math.min(Math.max(value, 0), max);
    const percentage = (normalizedValue / max) * 100;
    
    const radius = (size / 2) - (strokeWidth / 2);
    const circumference = 2 * Math.PI * radius;
    const dashOffset = circumference - (percentage / 100) * circumference;
    
    return (
      <div 
        ref={ref} 
        className={cn("relative inline-flex items-center justify-center", className)}
        style={{ width: size, height: size }}
      >
        <svg 
          width={size} 
          height={size} 
          className="transform -rotate-90"
        >
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke={backgroundStroke}
            strokeWidth={strokeWidth}
            className="text-gray-200"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke={progressStroke}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            strokeLinecap="round"
            className="text-primary transition-all duration-500 ease-in-out"
          />
        </svg>
        
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {showValue && (
            <span className={cn("text-6xl font-bold", valueClassName)}>
              {normalizedValue}
            </span>
          )}
          {label && <div>{label}</div>}
          {children}
        </div>
      </div>
    );
  }
);

CircularProgress.displayName = "CircularProgress";
