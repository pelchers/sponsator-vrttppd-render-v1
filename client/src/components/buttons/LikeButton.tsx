import { useState } from "react"
import { HeartIcon } from "@/components/icons/HeartIcon"
import { likeEntity, unlikeEntity } from "@/api/likes"

interface LikeButtonProps {
  entityType: string // "post", "project", "article", "comment"
  entityId: string
  initialLikeCount: number
  initialLiked: boolean
  size?: "sm" | "md" | "lg"
  variant?: "card" | "page"
  className?: string
  onLikeChange?: (liked: boolean) => void
}

export default function LikeButton({
    entityType,
    entityId,
    initialLikeCount,
    initialLiked,
    size = "md",
    variant = "card",
    className = "",
    onLikeChange
  }: LikeButtonProps) {
    const [liked, setLiked] = useState(initialLiked)
    const [likeCount, setLikeCount] = useState(initialLikeCount)
    const [isLoading, setIsLoading] = useState(false)
  
    const handleLikeToggle = async () => {
      if (isLoading) return
      
      setIsLoading(true)
      
      // Optimistic update
      setLiked(!liked)
      setLikeCount(prev => !liked ? prev + 1 : Math.max(0, prev - 1))
      
      try {
        if (liked) {
          await unlikeEntity(entityType, entityId)
        } else {
          await likeEntity(entityType, entityId)
        }
        
        // Notify parent component if callback provided
        if (onLikeChange) {
          onLikeChange(!liked)
        }
      } catch (error) {
        console.error('Error toggling like:', error)
        // Revert optimistic update if there's an error
        setLiked(liked)
        setLikeCount(prev => liked ? prev + 1 : Math.max(0, prev - 1))
      } finally {
        setIsLoading(false)
      }
    }
  
    // Determine size-based classes
    const sizeClasses = {
      sm: "text-xs",
      md: "text-sm",
      lg: "text-base"
    }[size]
  
    // Determine variant-based classes
    const variantClasses = {
      card: "gap-1",
      page: "gap-2"
    }[variant]
  
    return (
      <button
        onClick={handleLikeToggle}
        disabled={isLoading}
        className={`flex items-center ${sizeClasses} ${variantClasses} ${
          liked ? 'text-red-500' : 'text-gray-500 hover:text-red-400'
        } transition-colors ${className}`}
        aria-label={liked ? "Unlike" : "Like"}
        title={liked ? "Unlike" : "Like"}
      >
        <HeartIcon 
          filled={liked} 
          className={size === "lg" ? "w-5 h-5" : "w-4 h-4"} 
        />
        <span className="ml-1 text-sm">{likeCount}</span>
      </button>
  )
} 