import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchArticle } from '@/api/articles';
import { getCurrentUser } from '@/api/auth';
import { ArticleImage } from '@/components/ArticleImage';
import PageSection from "@/components/sections/PageSection";
import { Button } from "@/components/ui/button";
import './Article.css';
import { HeartIcon } from '@/components/icons/HeartIcon';
import FollowButton from '@/components/buttons/FollowButton';
import WatchButton from '@/components/buttons/WatchButton';
import { likeEntity, unlikeEntity, checkLikeStatus, getLikeCount } from '@/api/likes';
import CommentsSection from '@/components/comments/CommentsSection';

export default function ArticlePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [comment, setComment] = useState({ author: '', text: '' });
  const [comments, setComments] = useState([]);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const currentUser = getCurrentUser();

  useEffect(() => {
    const loadArticle = async () => {
      try {
        const data = await fetchArticle(id!);
        setArticle(data);
      } catch (err) {
        setError('Failed to load article');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadArticle();
  }, [id]);

  useEffect(() => {
    const fetchLikeData = async () => {
      if (!article) return;
      
      try {
        // Get current like count
        const count = await getLikeCount('article', article.id);
        setLikeCount(count);
        
        // Check if user has liked this article
        const hasLiked = await checkLikeStatus('article', article.id);
        setLiked(hasLiked);
      } catch (error) {
        console.error('Error fetching like data:', error);
      }
    };
    
    fetchLikeData();
  }, [article]);

  const handleCommentSubmit = (e) => {
    e.preventDefault();
    if (!comment.author || !comment.text) return;
    
    // In a real app, you'd send this to the server
    setComments([...comments, comment]);
    setComment({ author: '', text: '' });
  };

  const handleLikeToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isLoading || !article) return;
    
    setIsLoading(true);
    
    // Optimistic update
    setLiked(!liked);
    setLikeCount(prev => !liked ? prev + 1 : Math.max(0, prev - 1));
    
    try {
      if (liked) {
        await unlikeEntity('article', article.id);
        setLiked(false);
        setLikeCount(prev => Math.max(0, prev - 1));
      } else {
        await likeEntity('article', article.id);
        setLiked(true);
        setLikeCount(prev => prev + 1);
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      // If we get a 409 error (already liked), just update the UI to show as liked
      if (error.response && error.response.status === 409) {
        setLiked(true);
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!article) return <div>Article not found</div>;

  const isOwner = currentUser?.id === article.user_id;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Edit Button - Only visible to article owner */}
      {isOwner && (
        <div className="flex justify-end mb-4">
          <Button
            onClick={() => navigate(`/article/edit/${article.id}`)}
            className="bg-blue-500 hover:bg-blue-600 text-white"
          >
            Edit Article
          </Button>
        </div>
      )}

      {/* Article Header with Image */}
      <div className="relative mb-8">
        <ArticleImage
          article={article}
          className="w-full h-[400px] object-cover rounded-lg"
          fallback={
            <div className="w-full h-[400px] bg-gray-200 flex items-center justify-center rounded-lg">
              <span className="text-gray-500">No cover image</span>
            </div>
          }
        />
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-6">
          <h1 className="text-4xl font-bold text-white">{article.title}</h1>
        </div>
      </div>

      <div className="flex justify-center items-center space-x-6 mt-4">
        <div className="flex flex-col items-center">
          <button 
            onClick={handleLikeToggle}
            disabled={isLoading}
            className={`flex items-center gap-1 text-sm ${
              liked ? 'text-red-500' : 'text-gray-500 hover:text-red-400'
            } transition-colors`}
            aria-label={liked ? "Unlike" : "Like"}
          >
            <HeartIcon filled={liked} className="w-6 h-6" />
            <span className="font-medium">{likeCount}</span>
          </button>
          <span className="text-xs text-gray-500 mt-1">Likes</span>
        </div>

        <div className="flex flex-col items-center">
          <WatchButton 
            entityType="article"
            entityId={article.id}
            initialWatching={false}
            initialCount={article.watches_count || 0}
            showCount={true}
            size="lg"
            variant="ghost"
          />
          <span className="text-xs text-gray-500 mt-1">Watching</span>
        </div>

        <div className="flex flex-col items-center">
          <FollowButton 
            entityType="article"
            entityId={article.id}
            initialFollowing={false}
            initialCount={article.followers_count || 0}
            showCount={true}
            size="lg"
            variant="ghost"
          />
          <span className="text-xs text-gray-500 mt-1">Followers</span>
        </div>
      </div>

      <div className="article-tags">
        {article.tags && article.tags.map((tag) => (
          <span
            key={tag}
            className="article-tag"
          >
            #{tag}
          </span>
        ))}
      </div>

      {article.sections && article.sections.map((section, index) => (
        <div key={index} className="article-section p-6 mb-8">
          <h2 className="article-section-title">{section.title}</h2>
          
          {section.type === "full-width-text" && (
            <div className="space-y-4 article-adaptive-container">
              <h3 className="article-section-subtitle">{section.subtitle}</h3>
              <p className="article-section-text">{section.text}</p>
            </div>
          )}
          
          {section.type === "full-width-media" && (
            <div className="space-y-2 article-adaptive-container">
              <div className="article-media-container">
                <img 
                  src={section.mediaUrl || "https://via.placeholder.com/800x400?text=No+Image+Available"}
                  alt={section.title || "Article media"} 
                  className="article-media"
                  onError={(e) => {
                    e.currentTarget.src = "https://via.placeholder.com/800x400?text=Image+Failed+to+Load";
                    e.currentTarget.alt = "Image failed to load";
                  }}
                />
              </div>
              <p className="article-media-subtext">{section.mediaSubtext}</p>
            </div>
          )}
          
          {section.type === "left-media-right-text" && (
            <div className="article-mixed-layout article-adaptive-container">
              <div className="article-mixed-layout-column article-adaptive-container">
                <div className="article-media-container">
                  <img
                    src={section.mediaUrl || "https://via.placeholder.com/800x400?text=No+Image+Available"}
                    alt={section.title || "Article media"}
                    className="article-media"
                    onError={(e) => {
                      e.currentTarget.src = "https://via.placeholder.com/800x400?text=Image+Failed+to+Load";
                      e.currentTarget.alt = "Image failed to load";
                    }}
                  />
                </div>
                <p className="article-media-subtext">{section.mediaSubtext}</p>
              </div>
              <div className="article-mixed-layout-column article-adaptive-container">
                <h3 className="article-section-subtitle">{section.subtitle}</h3>
                <p className="article-section-text">{section.text}</p>
              </div>
            </div>
          )}
          
          {section.type === "left-text-right-media" && (
            <div className="article-mixed-layout article-adaptive-container">
              <div className="article-mixed-layout-column article-adaptive-container">
                <h3 className="article-section-subtitle">{section.subtitle}</h3>
                <p className="article-section-text">{section.text}</p>
              </div>
              <div className="article-mixed-layout-column article-adaptive-container">
                <div className="article-media-container">
                  <img
                    src={section.mediaUrl || "https://via.placeholder.com/800x400?text=No+Image+Available"}
                    alt={section.title || "Article media"}
                    className="article-media"
                    onError={(e) => {
                      e.currentTarget.src = "https://via.placeholder.com/800x400?text=Image+Failed+to+Load";
                      e.currentTarget.alt = "Image failed to load";
                    }}
                  />
                </div>
                <p className="article-media-subtext">{section.mediaSubtext}</p>
              </div>
            </div>
          )}
        </div>
      ))}

      {article.citations && article.citations.length > 0 && (
        <div className="article-section p-6 mb-8">
          <h2 className="article-section-title">Citations</h2>
          <ul className="article-list">
            {article.citations.map((citation, index) => (
              <li key={index}>{citation}</li>
            ))}
          </ul>
        </div>
      )}

      {article.contributors && article.contributors.length > 0 && (
        <div className="article-section p-6 mb-8">
          <h2 className="article-section-title">Contributors</h2>
          <p className="article-section-text">{article.contributors.join(', ')}</p>
        </div>
      )}

      {article.related_media && article.related_media.length > 0 && (
        <div className="article-section p-6 mb-8">
          <h2 className="article-section-title">Related Media</h2>
          <ul className="article-list">
            {article.related_media.map((media, index) => (
              <li key={index}>{media}</li>
            ))}
          </ul>
        </div>
      )}

      <CommentsSection 
        entityType="article"
        entityId={article.id}
      />
    </div>
  );
}

