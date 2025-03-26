import { cn } from "@/lib/utils"
import { sectionStyles } from "@/styles/sections"

export function FeaturedContentSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {[...Array(3)].map((_, i) => (
        <div 
          key={i} 
          className={cn(
            sectionStyles.base,
            sectionStyles.variants['white'],
            "animate-pulse"
          )}
        >
          <div className="h-6 bg-neutral-200 rounded w-1/2 mb-4"></div>
          <div className="space-y-4">
            {[...Array(3)].map((_, j) => (
              <div key={j} className={cn(
                sectionStyles.base,
                sectionStyles.variants['ghost'],
                "bg-neutral-100"
              )}>
                <div className="h-4 bg-neutral-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-neutral-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
} 