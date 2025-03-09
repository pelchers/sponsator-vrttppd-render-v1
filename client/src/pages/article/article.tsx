import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { fetchArticle } from '@/api/articles';
import PageSection from "@/components/sections/PageSection";
import { Button } from "@/components/ui/button";
import './Article.css';

export default function ArticleViewPage() {
  const { id } = useParams();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [comment, setComment] = useState({ author: '', text: '' });
  const [comments, setComments] = useState([]);

  useEffect(() => {
    // Fetch the actual article data from the API
    if (id) {
      setLoading(true);
      fetchArticle(id)
        .then(data => {
          console.log('Fetched article data:', data);
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

  const handleCommentSubmit = (e) => {
    e.preventDefault();
    if (!comment.author || !comment.text) return;
    
    // In a real app, you'd send this to the server
    setComments([...comments, comment]);
    setComment({ author: '', text: '' });
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
                  src={section.mediaUrl || "/placeholder.svg"} 
                  alt={section.title || "Article media"} 
                  className="article-media"
                  onError={(e) => {
                    e.currentTarget.src = "/placeholder.svg";
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
                    src={section.mediaUrl || "/placeholder.svg"}
                    alt={section.title || "Article media"}
                    className="article-media"
                    onError={(e) => {
                      e.currentTarget.src = "/placeholder.svg";
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
                    src={section.mediaUrl || "/placeholder.svg"}
                    alt={section.title || "Article media"}
                    className="article-media"
                    onError={(e) => {
                      e.currentTarget.src = "/placeholder.svg";
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

