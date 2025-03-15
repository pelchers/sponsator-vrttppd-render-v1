import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { fetchArticle } from '@/api/articles';
import PageSection from "@/components/sections/PageSection";
import { Button } from "@/components/ui/button";
import './Article.css';
import { HeartIcon } from '@/components/icons/HeartIcon';
import FollowButton from '@/components/buttons/FollowButton';
import WatchButton from '@/components/buttons/WatchButton';
import { likeEntity, unlikeEntity, checkLikeStatus, getLikeCount } from '@/api/likes';

export default function ArticleViewPage() {
  const { id } = useParams();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [comment, setComment] = useState({ author: '', text: '' });
  const [comments, setComments] = useState([]);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Fetch the actual article data from the API
    if (id) {
      setLoading(true);
      fetchArticle(id)
        .then(data => {
          console.log('Fetched article data:', data);
          
          // Sort sections by id or created_at if available
          if (data.sections && Array.isArray(data.sections)) {
            // Sort sections by their natural order in the database
            // This assumes sections have some sort of order indicator
            data.sections.sort((a, b) => {
              // If sections have an explicit order field, use that
              if (a.order !== undefined && b.order !== undefined) {
                return a.order - b.order;
              }
              // Otherwise, sort by ID which should preserve creation order
              return a.id.localeCompare(b.id);
            });
          }
          
          setArticle(data);
          // In a real app, you'd fetch comments separately or they'd be included in the article data
          setComments(data.comments || []);
        })
        .catch(error => {
          console.error('Error fetching article:', error);
          setError('Failed to load article. Please try again later.');
        })
        .finally(() => {
          setLoading(false);
        });
    }
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

  if (loading) {
    return <div className="article-container">
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    </div>;
  }

  if (error) {
    return <div className="article-container">
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        <p>{error}</p>
      </div>
    </div>;
  }

  if (!article) {
    return <div className="article-container">
      <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
        <p>Article not found</p>
      </div>
    </div>;
  }

  return (
    <div className="article-container">
      <h1 className="article-title">{article.title}</h1>

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

      <div className="article-comments-section">
        <h2 className="article-section-title">Comments</h2>
        
        {comments.length > 0 ? (
          comments.map((comment, index) => (
            <div key={index} className="article-comment">
              <p className="article-comment-author">{comment.author}</p>
              <p className="article-comment-text">{comment.text}</p>
            </div>
          ))
        ) : (
          <p className="text-gray-500 mb-4">No comments yet. Be the first to comment!</p>
        )}
        
        <div className="article-comment-form">
          <h3 className="article-comment-form-title">Add a comment</h3>
          <form className="space-y-4" onSubmit={handleCommentSubmit}>
            <div>
              <input 
                type="text"
                placeholder="Your name" 
                value={comment.author}
                onChange={(e) => setComment({...comment, author: e.target.value})}
                className="article-input"
              />
            </div>
            <div>
              <textarea 
                placeholder="Your comment" 
                value={comment.text}
                onChange={(e) => setComment({...comment, text: e.target.value})}
                className="article-textarea"
                rows={4}
              />
            </div>
            <Button type="submit" className="article-button">Post Comment</Button>
          </form>
        </div>
      </div>
    </div>
  );
}

