import * as React from "react";
import { cn } from "@/lib/utils";

interface TimelineProps {
  children: React.ReactNode;
  className?: string;
}

export function Timeline({ children, className }: TimelineProps) {
  return (
    <div className={cn("space-y-1", className)}>
      {children}
    </div>
  );
}

interface TimelineItemProps {
  children: React.ReactNode;
  className?: string;
  active?: boolean;
  completed?: boolean;
}

export function TimelineItem({ 
  children, 
  className,
  active = false,
  completed = false
}: TimelineItemProps) {
  return (
    <div className={cn(
      "flex relative",
      className
    )}>
      <div className="flex flex-col items-center mr-4">
        <div className={cn(
          "w-3 h-3 rounded-full z-10",
          active ? "bg-primary ring-4 ring-primary/20" : 
          completed ? "bg-primary" : "bg-gray-300"
        )} />
        <div className={cn(
          "w-0.5 h-full -mt-1",
          (active || completed) ? "bg-primary" : "bg-gray-300"
        )} />
      </div>
      <div className="pb-8 flex-1">
        {children}
      </div>
    </div>
  );
}

interface TimelineContentProps {
  children: React.ReactNode;
  className?: string;
}

export function TimelineContent({ children, className }: TimelineContentProps) {
  return (
    <div className={cn(className)}>
      {children}
    </div>
  );
}

interface TimelineTitleProps {
  children: React.ReactNode;
  className?: string;
}

export function TimelineTitle({ children, className }: TimelineTitleProps) {
  return (
    <h3 className={cn("font-medium text-base", className)}>
      {children}
    </h3>
  );
}

interface TimelineDescriptionProps {
  children: React.ReactNode;
  className?: string;
}

export function TimelineDescription({ children, className }: TimelineDescriptionProps) {
  return (
    <p className={cn("text-sm text-gray-500", className)}>
      {children}
    </p>
  );
}
