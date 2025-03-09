import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import PageSection from "@/components/sections/PageSection";
import { Button } from "@/components/ui/button";

export default function ArticleViewPage() {
  const { id } = useParams();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [comment, setComment] = useState({ author: '', text: '' });
  const [comments, setComments] = useState([]);

  useEffect(() => {
    // In a real app, you'd fetch the article data from your API
    // For now, we'll just simulate loading
    setLoading(true);
    setTimeout(() => {
      setArticle({
        id: id,
        title: "Sample Article Title",
        tags: ["technology", "science", "research"],
        sections: [
          {
            type: "full-width-text",
            title: "Introduction",
            subtitle: "A brief overview",
            text: "This is the introduction to our article. It provides a brief overview of what we'll be discussing.",
          },
          {
            type: "left-media-right-text",
            title: "Key Concepts",
            mediaUrl: "/placeholder.svg",
            mediaSubtext: "Diagram of key concepts",
            subtitle: "Understanding the basics",
            text: "Here we delve into the key concepts of our topic. The image on the left provides a visual representation.",
          }
        ],
        citations: ["Smith, J. (2023). Example Study. Journal of Examples, 1(1), 1-10."],
        contributors: ["John Doe", "Jane Smith"],
        related_media: ["Video: 'Further Exploration' - available on YouTube"],
        comments: []
      });
      setLoading(false);
    }, 1000);
  }, [id]);

  const handleCommentSubmit = (e) => {
    e.preventDefault();
    if (!comment.author || !comment.text) return;
    
    // In a real app, you'd send this to the server
    setComments([...comments, comment]);
    setComment({ author: '', text: '' });
  };

  if (loading) {
    return <div className="container mx-auto px-4 py-8">Loading article...</div>;
  }

  if (error) {
    return <div className="container mx-auto px-4 py-8 text-red-500">{error}</div>;
  }

  if (!article) {
    return <div className="container mx-auto px-4 py-8">Article not found</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">{article.title}</h1>

      <div className="mb-4">
        {article.tags && article.tags.map((tag) => (
          <span
            key={tag}
            className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2"
          >
            #{tag}
          </span>
        ))}
      </div>

      {article.sections && article.sections.map((section, index) => (
        <PageSection key={index} title={section.title}>
          {section.type === "full-width-text" && (
            <div className="space-y-4">
              <h3 className="text-xl font-semibold">{section.subtitle}</h3>
              <p>{section.text}</p>
            </div>
          )}
          {section.type === "full-width-media" && (
            <div className="space-y-2">
              <div className="relative w-full h-96">
                <img 
                  src={section.mediaUrl || "/placeholder.svg"} 
                  alt={section.title} 
                  className="w-full h-full object-cover"
                />
              </div>
              <p className="text-sm text-gray-500">{section.mediaSubtext}</p>
            </div>
          )}
          {section.type === "left-media-right-text" && (
            <div className="flex flex-col md:flex-row gap-4">
              <div className="w-full md:w-1/2 space-y-2">
                <div className="relative w-full h-64">
                  <img
                    src={section.mediaUrl || "/placeholder.svg"}
                    alt={section.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <p className="text-sm text-gray-500">{section.mediaSubtext}</p>
              </div>
              <div className="w-full md:w-1/2 space-y-4">
                <h3 className="text-xl font-semibold">{section.subtitle}</h3>
                <p>{section.text}</p>
              </div>
            </div>
          )}
          {section.type === "left-text-right-media" && (
            <div className="flex flex-col md:flex-row gap-4">
              <div className="w-full md:w-1/2 space-y-4">
                <h3 className="text-xl font-semibold">{section.subtitle}</h3>
                <p>{section.text}</p>
              </div>
              <div className="w-full md:w-1/2 space-y-2">
                <div className="relative w-full h-64">
                  <img
                    src={section.mediaUrl || "/placeholder.svg"}
                    alt={section.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <p className="text-sm text-gray-500">{section.mediaSubtext}</p>
              </div>
            </div>
          )}
        </PageSection>
      ))}

      {article.citations && article.citations.length > 0 && (
        <PageSection title="Citations">
          <ul className="list-disc pl-5 space-y-2">
            {article.citations.map((citation, index) => (
              <li key={index}>{citation}</li>
            ))}
          </ul>
        </PageSection>
      )}

      {article.contributors && article.contributors.length > 0 && (
        <PageSection title="Contributors">
          <p>{article.contributors.join(', ')}</p>
        </PageSection>
      )}

      {article.related_media && article.related_media.length > 0 && (
        <PageSection title="Related Media">
          <ul className="list-disc pl-5 space-y-2">
            {article.related_media.map((media, index) => (
              <li key={index}>{media}</li>
            ))}
          </ul>
        </PageSection>
      )}

      <PageSection title="Comments">
        {comments.length > 0 ? (
          comments.map((comment, index) => (
            <div key={index} className="bg-white shadow rounded-lg p-4 mb-4">
              <div className="p-4">
                <p className="font-semibold">{comment.author}</p>
                <p>{comment.text}</p>
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-500">No comments yet. Be the first to comment!</p>
        )}
        
        <div className="bg-white shadow rounded-lg p-4 mt-4">
          <div className="p-4">
            <h3 className="text-lg font-semibold mb-2">Add a comment</h3>
            <form className="space-y-4" onSubmit={handleCommentSubmit}>
              <div>
                <input 
                  type="text"
                  placeholder="Your name" 
                  value={comment.author}
                  onChange={(e) => setComment({...comment, author: e.target.value})}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <textarea 
                  placeholder="Your comment" 
                  value={comment.text}
                  onChange={(e) => setComment({...comment, text: e.target.value})}
                  className="w-full p-2 border rounded"
                  rows={4}
                />
              </div>
              <Button type="submit">Post Comment</Button>
            </form>
          </div>
        </div>
      </PageSection>
    </div>
  );
}

