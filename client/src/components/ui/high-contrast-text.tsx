import React from 'react';
import { cn } from '@/lib/utils';

interface HighContrastTextProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  asChild?: boolean;
  element?: keyof JSX.IntrinsicElements;
}

/**
 * A component that ensures text has high contrast against its background in both light and dark modes
 */
export function HighContrastText({
  children,
  className,
  element = 'div',
  ...props
}: HighContrastTextProps) {
  const Component = element as any;
  
  return (
    <Component
      className={cn(
        "dark:text-white text-gray-800 font-medium",
        className
      )}
      {...props}
    >
      {children}
    </Component>
  );
}