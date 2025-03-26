import type React from "react"
import { cn } from "@/lib/utils"
import { sectionStyles, sectionHeaderStyles } from "@/styles/sections"

interface PageSectionProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
  variant?: 'spring' | 'turquoise' | 'orange' | 'lemon' | 'red' | 'white' | 'black' | 'ghost';
}

export default function PageSection({ 
  title, 
  children, 
  className = '',
  variant = 'white'
}: PageSectionProps) {
  return (
    <section 
      className={cn(
        "w-full min-w-full", // Ensure full width
        sectionStyles.base,
        sectionStyles.variants[variant],
        className
      )}
    >
      <div className="max-w-7xl mx-auto px-4">
        {title && (
          <div className={sectionHeaderStyles.base}>
            <h2 className={cn(
              "text-lg",
              sectionHeaderStyles.title[variant]
            )}>
              {title}
            </h2>
          </div>
        )}
        {children}
      </div>
    </section>
  );
}

