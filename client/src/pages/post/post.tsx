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
    <div className="min-h-screen w-full bg-[#FFFEFF]">
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        {/* Navigation */}
        <div className="bg-white p-6 rounded-2xl shadow-lg">
          <div className="flex justify-between items-center">
            <Link to="/posts" className="text-black hover:text-turquoise transition-colors">
              &larr; Back to Posts
            </Link>
            
            {/* Edit Button - Only visible to post owner */}
            {isOwner && (
              <Button
                onClick={() => navigate(`/post/edit/${post.id}`)}
                className="bg-spring text-black px-6 py-2 rounded-full border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all duration-200"
              >
                Edit Post
              </Button>
            )}
          </div>
        </div>
        
        {/* Post Content */}
        <div className="bg-white p-6 rounded-2xl shadow-lg">
          {/* Post Image */}
          <div className="relative w-full max-h-[600px] min-h-[300px] mb-6">
            <PostImage
              post={post}
              className="w-full h-full max-h-[600px] object-contain bg-gray-100 rounded-lg"
              fallback={
                <div className="w-full h-full min-h-[300px] bg-gray-200 flex items-center justify-center rounded-lg">
                  <span className="text-gray-500">No image available</span>
                </div>
              }
            />
          </div>
          
          {/* Post Title & Description */}
          <div className="space-y-4">
            <h1 className="text-3xl font-bold">{post.title}</h1>
            <div className="prose max-w-none">
              <p className="text-gray-700">{post.description}</p>
            </div>
          </div>

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-0.5 mt-4">
              {post.tags.map((tag: string, index: number) => (
                <span
                  key={index}
                  className="inline-flex px-1.5 py-0.5 text-[10px] rounded-full bg-turquoise-light text-black border border-black transition-all duration-250 hover:scale-105"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Post Metadata */}
          <div className="mt-6 pt-6 border-t border-black">
            <div className="text-sm text-gray-700">Posted by: {post.username}</div>
            <div className="text-sm text-gray-700">Posted on: {new Date(post.created_at).toLocaleDateString()}</div>
            {post.updated_at !== post.created_at && (
              <div className="text-sm text-gray-700">Updated on: {new Date(post.updated_at).toLocaleDateString()}</div>
            )}
          </div>
        </div>
        
        {/* Interactions */}
        <div className="bg-white p-6 rounded-2xl shadow-lg">
          <div className="flex items-center justify-between">
            <button 
              onClick={handleLike}
              className="flex items-center space-x-2 text-gray-700 hover:text-turquoise transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
              </svg>
              <span>{post.likes} {post.likes === 1 ? 'Like' : 'Likes'}</span>
            </button>
            
            <div className="text-gray-700">
              <span>{post.comments.length} {post.comments.length === 1 ? 'Comment' : 'Comments'}</span>
            </div>
          </div>
        </div>
        
        {/* Comments Section */}
        <div className="bg-white p-6 rounded-2xl shadow-lg">
          <h2 className="text-2xl font-bold mb-6">Comments</h2>
          
          {/* Comments List */}
          {post.comments.length > 0 ? (
            <div className="space-y-4 mb-6">
              {post.comments.map((comment) => (
                <div key={comment.id} className="border border-black p-4 rounded-lg">
                  <div className="flex justify-between">
                    <div className="font-medium">{comment.username}</div>
                    <div className="text-sm text-gray-700">
                      {new Date(comment.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="mt-2">{comment.content}</div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-700 mb-6">No comments yet. Be the first to comment!</p>
          )}
          
          {/* Comment Form */}
          <form onSubmit={handleCommentSubmit} className="space-y-4">
            <div>
              <label htmlFor="comment" className="block text-sm font-medium text-gray-700">Add a comment</label>
              <textarea
                id="comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={3}
                className="border border-black p-2 rounded-lg bg-white w-full"
                required
              />
            </div>
            
            <div className="flex justify-end">
              <Button 
                type="submit" 
                className="bg-spring text-black px-6 py-2 rounded-full border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all duration-200"
                disabled={submittingComment || !comment.trim()}
              >
                {submittingComment ? 'Submitting...' : 'Submit Comment'}
              </Button>
            </div>
          </form>
        </div>
        
        {/* Comments Component */}
        {post && (
          <CommentsSection 
            entityType="post"
            entityId={post.id}
          />
        )}
      </div>
    </div>
  );
}

