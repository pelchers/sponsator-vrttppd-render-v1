import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchPosts, deletePost } from '@/api/posts';
import { Button } from '@/components/ui/button';

interface Post {
  id: string;
  title: string;
  description: string;
  mediaUrl?: string;
  tags: string[];
  likes: number;
  comments: any[];
  created_at: string;
  updated_at: string;
  user_id: string;
  username: string;
}

export default function PostsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const loadPosts = async () => {
      try {
        setLoading(true);
        const response = await fetchPosts(page, 10);
        console.log('Fetched posts:', response);
        setPosts(response.data || []);
        setTotalPages(Math.ceil((response.total || 0) / 10));
      } catch (err) {
        console.error('Error loading posts:', err);
        setError('Failed to load posts. Please try again later.');
        // Fallback to empty array if API fails
        setPosts([]);
      } finally {
        setLoading(false);
      }
    };

    loadPosts();
  }, [page]);

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        await deletePost(id);
        setPosts(posts.filter(post => post.id !== id));
      } catch (err) {
        console.error('Error deleting post:', err);
        alert('Failed to delete post. Please try again.');
      }
    }
  };

  if (loading && posts.length === 0) {
    return <div className="container mx-auto px-4 py-8">Loading posts...</div>;
  }

  if (error) {
    return <div className="container mx-auto px-4 py-8 text-red-500">{error}</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Posts</h1>
        <Link
          to="/post/edit/new"
          className="inline-block bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Create New Post
        </Link>
      </div>

      {posts.length === 0 ? (
        <p>No posts found. Create your first post!</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <div key={post.id} className="bg-white shadow rounded-lg overflow-hidden">
              {post.mediaUrl && (
                <div className="h-48 overflow-hidden">
                  <img 
                    src={post.mediaUrl} 
                    alt={post.title} 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = 'https://via.placeholder.com/400x200?text=Image+Not+Found';
                    }}
                  />
                </div>
              )}
              
              <div className="p-4">
                <Link to={`/post/${post.id}`} className="text-lg font-semibold text-blue-600 hover:underline">
                  {post.title || 'Untitled Post'}
                </Link>
                
                <p className="text-gray-500 text-sm mt-1">
                  By {post.username} • {new Date(post.created_at).toLocaleDateString()}
                </p>
                
                <p className="mt-2 text-gray-700 line-clamp-3">
                  {post.description}
                </p>
                
                {post.tags && post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-3">
                    {post.tags.map((tag, index) => (
                      <span key={index} className="bg-gray-100 px-2 py-1 rounded text-xs">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                
                <div className="flex justify-between items-center mt-4 pt-3 border-t border-gray-100">
                  <div className="flex space-x-2 text-sm">
                    <span>{post.likes} likes</span>
                    <span>•</span>
                    <span>{post.comments.length} comments</span>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Link to={`/post/edit/${post.id}`} className="text-green-600 hover:underline text-sm">
                      Edit
                    </Link>
                    <button 
                      onClick={() => handleDelete(post.id)}
                      className="text-red-600 hover:underline text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center mt-6 space-x-2">
          <Button 
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            variant="outline"
          >
            Previous
          </Button>
          <span className="py-2 px-4">
            Page {page} of {totalPages}
          </span>
          <Button 
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            variant="outline"
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
} 