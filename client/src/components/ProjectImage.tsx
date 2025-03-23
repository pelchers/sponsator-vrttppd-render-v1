import React from 'react';
import { API_URL } from '@/config';

interface ProjectImageProps {
  project: {
    project_image_display?: 'url' | 'upload';
    project_image_url?: string | null;
    project_image_upload?: string | null;
  };
  className?: string;
  fallback?: React.ReactNode;
}

export function ProjectImage({ project, className, fallback }: ProjectImageProps) {
  // Determine the image URL based on display preference
  const imageUrl = project.project_image_display === 'url'
    ? project.project_image_url
    : project.project_image_upload
      ? `${API_URL.replace('/api', '')}/uploads/${project.project_image_upload}`
      : null;

  console.log('ProjectImage component:', {
    display: project.project_image_display,
    url: project.project_image_url,
    upload: project.project_image_upload,
    resolved: imageUrl
  });

  if (!imageUrl) {
    return fallback || null;
  }

  return (
    <img
      src={imageUrl}
      alt="Project"
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