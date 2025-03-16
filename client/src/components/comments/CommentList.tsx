import CommentItem from "./CommentItem";
import { Comment } from "@/types/comments";

interface CommentListProps {
  entityType: string;
  entityId: string;
  comments: Comment[];
  onReply?: (commentId: string) => void;
  onDelete?: (commentId: string) => void;
}

export default function CommentList({
  entityType,
  entityId,
  comments,
  onReply,
  onDelete
}: CommentListProps) {
  return (
    <div className="space-y-4">
      {comments.map(comment => (
        <CommentItem
          key={comment.id}
          comment={comment}
          onReply={onReply}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
} 