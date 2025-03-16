import { useAuth } from "@/hooks/useAuth";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import LikeButton from "@/components/buttons/LikeButton";
import { formatDate } from "@/utils/formatDate";
import { Comment } from "@/types/comments";

interface CommentItemProps {
  comment: Comment;
  onReply?: (commentId: string) => void;
  onDelete?: (commentId: string) => void;
}

export default function CommentItem({
  comment,
  onReply,
  onDelete
}: CommentItemProps) {
  const { user } = useAuth();
  const canDelete = user?.id === comment.user_id;

  return (
    <div className="p-4 border rounded">
      <div className="flex justify-between items-start">
        <div className="flex gap-2 items-center">
          <Avatar src={comment.users?.profile_image} />
          <div>
            <div className="font-medium">{comment.users?.username}</div>
            <div className="text-sm text-gray-500">
              {formatDate(comment.created_at)}
            </div>
          </div>
        </div>
        {canDelete && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete?.(comment.id)}
          >
            Delete
          </Button>
        )}
      </div>
      <div className="mt-2">{comment.text}</div>
      <div className="mt-2 flex gap-2">
        <LikeButton
          entityType="comment"
          entityId={comment.id}
          initialLiked={false}
          initialLikeCount={comment.likes_count}
        />
        {onReply && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onReply(comment.id)}
          >
            Reply
          </Button>
        )}
      </div>
    </div>
  );
} 