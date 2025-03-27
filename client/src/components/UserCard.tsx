import { Card, CardHeader } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { LikeIcon, FollowIcon, WatchIcon } from "lucide-react"

export default function UserCard({ user, variant = 'white' }: UserCardProps) {
  return (
    <Card className="flex flex-col items-center text-center">
      {/* Profile Image */}
      <div className="w-20 h-20 mx-auto mb-4">
        <img 
          src={user.profile_image || '/default-avatar.png'} 
          alt={user.username}
          className="w-full h-full rounded-full object-cover border-2 border-black"
        />
      </div>

      {/* Username */}
      <h3 className="text-2xl font-bold mb-2 w-full">
        {user.username}
      </h3>

      {/* User Type */}
      <span className="text-sm text-gray-600 mb-3">
        {user.user_type || 'Member'}
      </span>

      {/* Bio */}
      {user.bio && (
        <p className="text-sm text-gray-700 mb-4 line-clamp-2 w-full">
          {user.bio}
        </p>
      )}

      {/* Tags */}
      <div className="flex flex-wrap gap-1 justify-center mb-3">
        {user.tags?.map(tag => (
          <span 
            key={tag}
            className={cn(
              "px-2 py-0.5 text-xs rounded-full",
              getTagColor(tag) // Function to get color based on tag type
            )}
          >
            {tag}
          </span>
        ))}
      </div>

      {/* Stats */}
      <div className="flex items-center justify-center gap-3 text-sm text-gray-600">
        <span className="flex items-center gap-1">
          <LikeIcon className="w-4 h-4" />
          {user.likes_count || 0}
        </span>
        <span className="flex items-center gap-1">
          <FollowIcon className="w-4 h-4" />
          {user.followers_count || 0}
        </span>
        <span className="flex items-center gap-1">
          <WatchIcon className="w-4 h-4" />
          {user.watches_count || 0}
        </span>
      </div>
    </Card>
  )
}

// Helper function to get tag colors
function getTagColor(tag: string) {
  const tagColors = {
    admin: 'bg-red-100 text-red-800',
    moderator: 'bg-orange-100 text-orange-800',
    contributor: 'bg-turquoise-100 text-turquoise-800',
    member: 'bg-spring-100 text-spring-800',
    // Add more tag types as needed
  };

  return tagColors[tag.toLowerCase()] || 'bg-gray-100 text-gray-800';
} 