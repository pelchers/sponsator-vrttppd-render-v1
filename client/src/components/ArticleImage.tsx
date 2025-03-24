import React from 'react';
import { API_URL } from '@/config';

interface ArticleImageProps {
  article: {
    article_image_display?: 'url' | 'upload';
    article_image_url?: string | null;
    article_image_upload?: string | null;
  };
  className?: string;
  fallback?: React.ReactNode;
}

export function ArticleImage({ article, className, fallback }: ArticleImageProps) {
  const imageUrl = article.article_image_display === 'url'
    ? article.article_image_url
    : article.article_image_upload
      ? `${API_URL.replace('/api', '')}/uploads/${article.article_image_upload}`
      : null;

  console.log('ArticleImage component:', {
    display: article.article_image_display,
    url: article.article_image_url,
    upload: article.article_image_upload,
    resolved: imageUrl
  });

  if (!imageUrl) {
    return fallback || null;
  }

  return (
    <img
      src={imageUrl}
      alt="Article cover"
      className={className}
      onError={(e) => {
        console.error('Image failed to load:', imageUrl);
        const target = e.target as HTMLImageElement;
        target.style.display = 'none';
        if (fallback && target.parentElement) {
          target.parentElement.appendChild(fallback as Node);
        }
      }}
    />
  );
} 