import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchArticles, deleteArticle } from '@/api/articles';
import { Button } from '@/components/ui/button';
import { ArticleImage } from '@/components/ArticleImage';
import { PencilIcon } from '@/components/icons/PencilIcon';
import { Card, CardContent } from "@/components/ui/card";

interface Article {
  id: string;
  title: string;
  description?: string;
  created_at?: string;
  tags?: string[];
  article_image_url?: string | null;
  article_image_upload?: string | null;
  article_image_display?: 'url' | 'upload';
}

export default function ArticlesListPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const loadArticles = async () => {
      try {
        setLoading(true);
        const response = await fetchArticles(page, 10);
        console.log('Fetched articles:', response);
        setArticles(response.data || []);
        setTotalPages(Math.ceil((response.total || 0) / 10));
      } catch (err) {
        console.error('Error loading articles:', err);
        setError('Failed to load articles. Please try again later.');
        setArticles([]);
      } finally {
        setLoading(false);
      }
    };

    loadArticles();
  }, [page]);

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this article?')) {
      try {
        await deleteArticle(id);
        setArticles(articles.filter(article => article.id !== id));
      } catch (err) {
        console.error('Error deleting article:', err);
        alert('Failed to delete article. Please try again.');
      }
    }
  };

  if (loading && articles.length === 0) {
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
        <h1 className="text-2xl font-bold">Articles</h1>
        <Link
          to="/article/edit/new"
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition-colors duration-200"
        >
          Create New Article
        </Link>
      </div>

      {articles.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">No articles found. Create your first article!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((article) => (
            <div key={article.id} className="relative bg-white rounded-lg shadow hover:shadow-md transition-shadow">
              <Link to={`/article/${article.id}`} className="block">
                <div className="aspect-video w-full overflow-hidden rounded-t-lg">
                  <ArticleImage
                    article={{
                      article_image_url: article.article_image_url,
                      article_image_upload: article.article_image_upload,
                      article_image_display: article.article_image_display
                    }}
                    className="w-full h-full object-cover"
                    fallback={
                      <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                        <span className="text-gray-400">No article image</span>
                      </div>
                    }
                  />
                </div>
                <CardContent className="p-4">
                  <h2 className="text-xl font-semibold mb-2 group-hover:text-blue-500 transition-colors duration-200">
                    {article.title || 'Untitled Article'}
                  </h2>
                  {article.description && (
                    <p className="text-gray-600 mb-4 line-clamp-3">
                      {article.description}
                    </p>
                  )}
                  {article.tags && article.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {article.tags.slice(0, 3).map((tag, index) => (
                        <span key={index} className="bg-gray-100 px-2 py-1 rounded text-xs">
                          {tag}
                        </span>
                      ))}
                      {article.tags.length > 3 && (
                        <span className="text-xs text-gray-500">+{article.tags.length - 3} more</span>
                      )}
                    </div>
                  )}
                </CardContent>
              </Link>

              {/* Edit button */}
              <Link
                to={`/article/edit/${article.id}`}
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

