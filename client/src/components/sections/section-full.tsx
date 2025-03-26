import React from "react";
import { cn } from "@/lib/utils"
import { sectionStyles } from "@/styles/sections"

interface SectionFullProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'spring' | 'turquoise' | 'orange' | 'lemon' | 'red' | 'white' | 'black' | 'ghost';
}

export default function SectionFull({ 
  children, 
  className = "", 
  variant = 'white' 
}: SectionFullProps) {
  return (
    <section className={cn(
      "w-full min-w-full",
      sectionStyles.base,
      sectionStyles.variants[variant],
      className
    )}>
      <div className="max-w-7xl mx-auto px-4">
        {children}
      </div>
    </section>
  );
} 