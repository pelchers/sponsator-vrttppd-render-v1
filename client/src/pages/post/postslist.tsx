import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchPosts, deletePost } from '@/api/posts';
import { Button } from '@/components/ui/button';
import { PostImage } from '@/components/PostImage';
import { PencilIcon } from '@/components/icons/PencilIcon';
import { Card, CardContent } from "@/components/ui/card";

interface Post {
  id: string;
  title: string;
  description?: string;
  created_at?: string;
  tags?: string[];
  post_image_url?: string | null;
  post_image_upload?: string | null;
  post_image_display?: 'url' | 'upload';
}

export default function PostsListPage() {
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
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Posts</h1>
        <Link
          to="/post/edit/new"
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition-colors duration-200"
        >
          Create New Post
        </Link>
      </div>

      {posts.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">No posts found. Create your first post!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <div key={post.id} className="relative bg-white rounded-lg shadow hover:shadow-md transition-shadow">
              <Link to={`/post/${post.id}`} className="block">
                <div className="aspect-video w-full overflow-hidden rounded-t-lg">
                  <PostImage
                    post={{
                      post_image_url: post.post_image_url,
                      post_image_upload: post.post_image_upload,
                      post_image_display: post.post_image_display
                    }}
                    className="w-full h-full object-cover"
                    fallback={
                      <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                        <span className="text-gray-400">No post image</span>
                      </div>
                    }
                  />
                </div>
                <CardContent className="p-4">
                  <h2 className="text-xl font-semibold mb-2 group-hover:text-blue-500 transition-colors duration-200">
                    {post.title || 'Untitled Post'}
                  </h2>
                  {post.description && (
                    <p className="text-gray-600 mb-4 line-clamp-3">
                      {post.description}
                    </p>
                  )}
                  {post.tags && post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {post.tags.slice(0, 3).map((tag, index) => (
                        <span key={index} className="bg-gray-100 px-2 py-1 rounded text-xs">
                          {tag}
                        </span>
                      ))}
                      {post.tags.length > 3 && (
                        <span className="text-xs text-gray-500">+{post.tags.length - 3} more</span>
                      )}
                    </div>
                  )}
                </CardContent>
              </Link>

              {/* Edit button */}
              <Link
                to={`/post/edit/${post.id}`}
                className="absolute top-2 right-2 p-2 bg-white rounded-full shadow hover:shadow-md transition-shadow"
              >
                <PencilIcon className="w-4 h-4 text-gray-600 hover:text-blue-500" />
              </Link>
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