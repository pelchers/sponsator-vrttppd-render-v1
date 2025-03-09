"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate, Link } from 'react-router-dom'
import { Button } from "@/components/ui/button"
import { fetchPost, likePost, commentOnPost, deletePost } from "@/api/posts"

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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link to="/posts" className="text-blue-500 hover:underline">
          &larr; Back to Posts
        </Link>
      </div>
      
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <h1 className="text-3xl font-bold">{post.title}</h1>
            <div className="flex space-x-2">
              <Link 
                to={`/post/edit/${post.id}`}
                className="text-green-600 hover:underline"
              >
                Edit
              </Link>
              <button 
                onClick={handleDelete}
                className="text-red-600 hover:underline"
              >
                Delete
              </button>
            </div>
          </div>
          
          <div className="text-sm text-gray-500 mb-4">
            Posted by {post.username} on {new Date(post.created_at).toLocaleDateString()}
          </div>
          
          {post.mediaUrl && (
            <div className="mb-6">
              <img 
                src={post.mediaUrl} 
                alt="Post media" 
                className="w-full rounded-lg object-cover max-h-96"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = 'https://via.placeholder.com/800x400?text=Image+Not+Found';
                }}
              />
            </div>
          )}
          
          <div className="prose max-w-none mb-6">
            {post.description.split('\n').map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>
          
          {post.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-6">
              {post.tags.map((tag, index) => (
                <span key={index} className="bg-gray-100 px-2 py-1 rounded text-xs">
                  {tag}
                </span>
              ))}
            </div>
          )}
          
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
      </div>
    </div>
  );
}

