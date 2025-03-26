import type React from "react"
import { cn } from "@/lib/utils"
import { sectionStyles, sectionHeaderStyles } from "@/styles/sections"

interface CategorySectionProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
  variant?: 'spring' | 'turquoise' | 'orange' | 'lemon' | 'red' | 'white' | 'black' | 'ghost';
}

export default function CategorySection({ 
  title, 
  children, 
  className = '', 
  variant = 'white' 
}: CategorySectionProps) {
  return (
    <div className={cn(
      "w-full min-w-full",
      sectionStyles.base,
      sectionStyles.variants[variant],
      className
    )}>
      <div className="max-w-7xl mx-auto px-4">
        {title && (
          <div className={sectionHeaderStyles.base}>
            <h3 className={cn(
              "text-lg",
              sectionHeaderStyles.title[variant]
            )}>
              {title}
            </h3>
          </div>
        )}
        <div className="w-full">{children}</div>
      </div>
    </div>
  );
}

