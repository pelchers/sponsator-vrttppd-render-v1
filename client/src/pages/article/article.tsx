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
import { Link } from 'react-router-dom';

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
    <div className="min-h-screen w-full bg-[#FFFEFF]">
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        {/* Navigation & Edit Button */}
        <div className="bg-white p-6 rounded-2xl shadow-lg">
          <div className="flex justify-between items-center">
            <Link to="/articles" className="text-black hover:text-lemon transition-colors">
              &larr; Back to Articles
            </Link>
            
            {isOwner && (
              <Button
                onClick={() => navigate(`/article/edit/${article.id}`)}
                className="bg-spring text-black px-6 py-2 rounded-full border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all duration-200"
              >
                Edit Article
              </Button>
            )}
          </div>
        </div>

        {/* Article Header with Image */}
        <div className="bg-white p-6 rounded-2xl shadow-lg">
          {/* Article Image */}
          <div className="mb-6">
            <ArticleImage
              article={article}
              className="w-full h-[400px] object-cover rounded-2xl"
              fallback={
                <div className="w-full h-[400px] bg-gray-200 flex items-center justify-center rounded-2xl">
                  <span className="text-gray-500">No cover image</span>
                </div>
              }
            />
          </div>

          {/* Article Title and Metadata */}
          <div className="space-y-4">
            {/* Title */}
            <h1 className="text-4xl font-bold text-black">{article.title}</h1>

            {/* Article metadata */}
            <div className="flex items-center text-sm text-gray-700">
              <span>By </span>
              <Link 
                to={`/profile/${article.user_id}`} 
                className="font-medium hover:text-lemon transition-colors ml-1"
              >
                {article.users?.username || 'Anonymous'}
              </Link>
              <span className="mx-2">•</span>
              <span>{new Date(article.created_at).toLocaleDateString()}</span>
            </div>
            
            {/* Tags */}
            <div className="flex flex-wrap gap-0.5 pb-6">
              {article.tags && article.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex px-1.5 py-0.5 text-[10px] rounded-full bg-lemon-light text-black border border-black transition-all duration-250 hover:scale-105"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Interaction Buttons */}
          <div className="flex justify-center items-center space-x-8 pt-6 border-t border-black">
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
        </div>

        {/* Article Content */}
        <div className="bg-white p-6 rounded-2xl shadow-lg">
          {/* Article Sections */}
          <div className="prose max-w-none">
            {article.sections && article.sections.map((section, index) => (
              <div key={index} className="mb-8">
                {/* Section Title (if exists) */}
                {section.title && (
                  <h2 className="text-3xl font-bold mb-4">{section.title}</h2>
                )}
                
                {section.type === "full-width-text" && (
                  <div className="space-y-4">
                    {section.subtitle && (
                      <h3 className="text-xl font-semibold mb-2">{section.subtitle}</h3>
                    )}
                    <div className="p-4 rounded-lg border border-gray-200 bg-gray-50">
                      <p className="text-gray-700 leading-relaxed">{section.text}</p>
                    </div>
                  </div>
                )}
                
                {section.type === "full-width-media" && (
                  <div className="my-6">
                    <div className="rounded-lg overflow-hidden">
                      <img 
                        src={section.mediaUrl || "https://via.placeholder.com/800x400?text=No+Image+Available"}
                        alt={section.title || "Article media"} 
                        className="w-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = "https://via.placeholder.com/800x400?text=Image+Failed+to+Load";
                          e.currentTarget.alt = "Image failed to load";
                        }}
                      />
                      {section.mediaSubtext && (
                        <div className="p-3">
                          <p className="text-sm text-gray-600 italic">{section.mediaSubtext}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                {(section.type === "left-media-right-text" || section.type === "left-text-right-media") && (
                  <div className="grid md:grid-cols-2 gap-6 my-6">
                    {section.type === "left-media-right-text" ? (
                      <>
                        <div className="rounded-lg overflow-hidden">
                          <img
                            src={section.mediaUrl || "https://via.placeholder.com/800x400?text=No+Image+Available"}
                            alt={section.title || "Article media"}
                            className="w-full object-cover"
                            onError={(e) => {
                              e.currentTarget.src = "https://via.placeholder.com/800x400?text=Image+Failed+to+Load";
                              e.currentTarget.alt = "Image failed to load";
                            }}
                          />
                          {section.mediaSubtext && (
                            <div className="p-3">
                              <p className="text-sm text-gray-600 italic">{section.mediaSubtext}</p>
                            </div>
                          )}
                        </div>
                        <div className="space-y-4">
                          {section.subtitle && (
                            <h3 className="text-3xl font-bold mb-4">{section.subtitle}</h3>
                          )}
                          <div className="p-4 rounded-lg border border-gray-200 bg-gray-50">
                            <p className="text-gray-700 leading-relaxed">{section.text}</p>
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="space-y-4">
                          {section.subtitle && (
                            <h3 className="text-3xl font-bold mb-4">{section.subtitle}</h3>
                          )}
                          <div className="p-4 rounded-lg border border-gray-200 bg-gray-50">
                            <p className="text-gray-700 leading-relaxed">{section.text}</p>
                          </div>
                        </div>
                        <div className="rounded-lg overflow-hidden">
                          <img
                            src={section.mediaUrl || "https://via.placeholder.com/800x400?text=No+Image+Available"}
                            alt={section.title || "Article media"}
                            className="w-full object-cover"
                            onError={(e) => {
                              e.currentTarget.src = "https://via.placeholder.com/800x400?text=Image+Failed+to+Load";
                              e.currentTarget.alt = "Image failed to load";
                            }}
                          />
                          {section.mediaSubtext && (
                            <div className="p-3">
                              <p className="text-sm text-gray-600 italic">{section.mediaSubtext}</p>
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                )}
                
                {/* Subtle section divider (except for last section) */}
                {index < article.sections.length - 1 && (
                  <div className="border-b border-gray-200 my-8" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Citations */}
        {article.citations && article.citations.length > 0 && (
          <div className="bg-white p-6 rounded-2xl shadow-lg">
            <h2 className="text-2xl font-bold mb-6">Citations</h2>
            <ul className="space-y-2">
              {article.citations.map((citation, index) => (
                <li key={index} className="border border-black p-2 rounded-lg bg-white">
                  {citation}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Contributors */}
        {article.contributors && article.contributors.length > 0 && (
          <div className="bg-white p-6 rounded-2xl shadow-lg">
            <h2 className="text-2xl font-bold mb-6">Contributors</h2>
            <div className="border border-black p-2 rounded-lg bg-white">
              {article.contributors.join(', ')}
            </div>
          </div>
        )}

        {/* Related Media */}
        {article.related_media && article.related_media.length > 0 && (
          <div className="bg-white p-6 rounded-2xl shadow-lg">
            <h2 className="text-2xl font-bold mb-6">Related Media</h2>
            <ul className="space-y-2">
              {article.related_media.map((media, index) => (
                <li key={index} className="border border-black p-2 rounded-lg bg-white">
                  {media}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Comments Section */}
        <div className="bg-white p-6 rounded-2xl shadow-lg">
          <CommentsSection 
            entityType="article"
            entityId={article.id}
          />
        </div>
      </div>
    </div>
  );
}

