import React from 'react';
import { API_URL } from '@/config';

interface PostImageProps {
  post: {
    post_image_url?: string | null;
    post_image_upload?: string | null;
    post_image_display?: 'url' | 'upload';
  };
  className?: string;
  fallback?: React.ReactNode;
}

export function PostImage({ post, className, fallback }: PostImageProps) {
  const imageUrl = post.post_image_display === 'url'
    ? post.post_image_url
    : post.post_image_upload
      ? `${API_URL.replace('/api', '')}/uploads/${post.post_image_upload}`
      : null;

  console.log('PostImage component:', {
    display: post.post_image_display,
    url: post.post_image_url,
    upload: post.post_image_upload,
    resolved: imageUrl
  });

  if (!imageUrl) return fallback || null;

  return (
    <img
      src={imageUrl}
      alt="Post"
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