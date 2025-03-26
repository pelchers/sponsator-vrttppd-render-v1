import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import CommentInput from './CommentInput';
import CommentList from './CommentList';
import { createComment, getComments, deleteComment } from '@/api/comments';
import type { Comment } from '@/types/comments';
import { sectionStyles, sectionHeaderStyles } from "@/styles/sections"
import { cn } from "@/lib/utils"

interface CommentsSectionProps {
  entityType: string;
  entityId: string;
}

export default function CommentsSection({ entityType, entityId }: CommentsSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const token = localStorage.getItem('token');

  useEffect(() => {
    console.log('CommentsSection mounted', { entityType, entityId });
    loadComments();
  }, [entityType, entityId]);

  const loadComments = async () => {
    console.log('Loading comments for', { entityType, entityId });
    try {
      setIsLoading(true);
      setError(null);
      const data = await getComments(entityType, entityId);
      setComments(data);
    } catch (err) {
      console.error('Error in loadComments:', err);
      console.error('Error loading comments:', err);
      setError('Failed to load comments');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCommentSubmit = async (text: string) => {
    if (!user) return;
    
    try {
      const newComment = await createComment(entityType, entityId, text, token);
      setComments(prev => [newComment, ...prev]);
    } catch (err) {
      console.error('Error creating comment:', err);
      // Could add toast notification here
    }
  };

  const handleCommentDelete = async (commentId: string) => {
    try {
      await deleteComment(commentId, token);
      setComments(prev => prev.filter(c => c.id !== commentId));
    } catch (err) {
      console.error('Error deleting comment:', err);
      // Could add toast notification here
    }
  };

  if (!entityType || !entityId) {
    console.error('CommentsSection: Missing required props', { entityType, entityId });
    return null;
  }

  if (isLoading) {
    return <div>Loading comments...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className={cn(
      sectionStyles.base,
      sectionStyles.variants['white'],
      "mt-8"
    )}>
      <div className={sectionHeaderStyles.base}>
        <h2 className={cn(
          "text-xl",
          sectionHeaderStyles.title['white']
        )}>
          Comments
        </h2>
      </div>
      {user ? (
        <CommentInput
          entityType={entityType}
          entityId={entityId}
          onCommentSubmit={handleCommentSubmit}
        />
      ) : (
        <p className="text-gray-500 mb-4">Please log in to comment</p>
      )}
      <div className="mt-4">
        <CommentList
          entityType={entityType}
          entityId={entityId}
          comments={comments}
          onDelete={handleCommentDelete}
        />
      </div>
    </div>
  );
} 