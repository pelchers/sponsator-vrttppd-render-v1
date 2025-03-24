"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate, Link } from 'react-router-dom'
import { Button } from "@/components/ui/button"
import { fetchPost, likePost, commentOnPost, deletePost } from "@/api/posts"
import CommentsSection from '@/components/comments/CommentsSection'
import { getCurrentUser } from '@/api/auth'
import { PostImage } from '@/components/PostImage'

interface Comment {
  id: string
  user_id: string
  username: string
  content: string
  created_at: string
}

interface Post {
  id: string
  title: string
  description: string
  mediaUrl?: string
  tags: string[]
  likes: number
  comments: Comment[]
  created_at: string
  updated_at: string
  user_id: string
  username: string
}

export default function PostPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [comment, setComment] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const currentUser = getCurrentUser();

  useEffect(() => {
    if (!id) return;

    const loadPost = async () => {
      try {
        setLoading(true);
        const data = await fetchPost(id);
        setPost(data);
      } catch (err) {
        console.error('Error loading post:', err);
        setError('Failed to load post. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    loadPost();
  }, [id]);

  const handleLike = async () => {
    if (!post) return;
    
    try {
      await likePost(post.id);
      // Update the post with incremented likes
      setPost(prev => prev ? { ...prev, likes: prev.likes + 1 } : null);
    } catch (err) {
      console.error('Error liking post:', err);
      alert('Failed to like post. Please try again.');
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!post || !comment.trim()) return;
    
    try {
      setSubmittingComment(true);
      const response = await commentOnPost(post.id, comment);
      
      // Update the post with the new comment
      setPost(prev => {
        if (!prev) return null;
        return {
          ...prev,
          comments: [...prev.comments, response.comment]
        };
      });
      
      // Clear the comment input
      setComment("");
    } catch (err) {
      console.error('Error submitting comment:', err);
      alert('Failed to submit comment. Please try again.');
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleDelete = async () => {
    if (!post) return;
    
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        await deletePost(post.id);
        navigate('/posts');
      } catch (err) {
        console.error('Error deleting post:', err);
        alert('Failed to delete post. Please try again.');
      }
    }
  };

  if (loading) {
    return <div className="container mx-auto px-4 py-8">Loading post...</div>;
  }

  if (error || !post) {
    return <div className="container mx-auto px-4 py-8 text-red-500">{error || 'Post not found'}</div>;
  }

  const isOwner = currentUser?.id === post.user_id;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link to="/posts" className="text-blue-500 hover:underline">
          &larr; Back to Posts
        </Link>
      </div>
      
      {/* Edit Button - Only visible to post owner */}
      {isOwner && (
        <div className="flex justify-end mb-4">
          <Button
            onClick={() => navigate(`/post/edit/${post.id}`)}
            className="bg-blue-500 hover:bg-blue-600 text-white"
          >
            Edit Post
          </Button>
        </div>
      )}
      
      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        {/* Post Image - Updated to be adaptive with max dimensions */}
        <div className="relative w-full max-h-[600px] min-h-[300px]">
          <PostImage
            post={post}
            className="w-full h-full max-h-[600px] object-contain bg-gray-100"
            fallback={
              <div className="w-full h-full min-h-[300px] bg-gray-200 flex items-center justify-center">
                <span className="text-gray-500">No image available</span>
              </div>
            }
          />
        </div>
        
        {/* Post Content */}
        <div className="p-6">
          <h1 className="text-3xl font-bold mb-4">{post.title}</h1>
          
          <div className="prose max-w-none">
            <p className="text-gray-700 mb-4">{post.description}</p>
          </div>

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {post.tags.map((tag: string, index: number) => (
                <span
                  key={index}
                  className="bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Post Metadata */}
          <div className="mt-6 pt-6 border-t border-gray-200 text-sm text-gray-500">
            <div>Posted by: {post.username}</div>
            <div>Posted on: {new Date(post.created_at).toLocaleDateString()}</div>
            {post.updated_at !== post.created_at && (
              <div>Updated on: {new Date(post.updated_at).toLocaleDateString()}</div>
            )}
          </div>
        </div>
      </div>
      
      <div className="flex items-center space-x-4 border-t pt-4">
        <button 
          onClick={handleLike}
          className="flex items-center space-x-1 text-gray-500 hover:text-blue-500"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
          </svg>
          <span>{post.likes} {post.likes === 1 ? 'Like' : 'Likes'}</span>
        </button>
        
        <div className="text-gray-500">
          <span>{post.comments.length} {post.comments.length === 1 ? 'Comment' : 'Comments'}</span>
        </div>
      </div>
      
      <div className="bg-gray-50 p-6">
        <h2 className="text-xl font-semibold mb-4">Comments</h2>
        
        {post.comments.length > 0 ? (
          <div className="space-y-4 mb-6">
            {post.comments.map((comment) => (
              <div key={comment.id} className="bg-white p-4 rounded-lg shadow-sm">
                <div className="flex justify-between">
                  <div className="font-medium">{comment.username}</div>
                  <div className="text-sm text-gray-500">
                    {new Date(comment.created_at).toLocaleDateString()}
                  </div>
                </div>
                <div className="mt-2">{comment.content}</div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 mb-6">No comments yet. Be the first to comment!</p>
        )}
        
        <form onSubmit={handleCommentSubmit} className="space-y-4">
          <div>
            <label htmlFor="comment" className="block text-sm font-medium text-gray-700">Add a comment</label>
            <textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Write your comment here..."
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            />
          </div>
          
          <Button 
            type="submit" 
            className="bg-blue-500 hover:bg-blue-600 text-white" 
            disabled={submittingComment || !comment.trim()}
          >
            {submittingComment ? 'Submitting...' : 'Submit Comment'}
          </Button>
        </form>
      </div>
      
      {/* Add comments section */}
      {post && (
        <CommentsSection 
          entityType="post"
          entityId={post.id}
        />
      )}
    </div>
  );
}

