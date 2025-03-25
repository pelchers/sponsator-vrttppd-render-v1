import React from 'react';
import { API_URL } from '@/config';

interface ProjectImageProps {
  project: {
    project_image_url?: string | null;
    project_image_upload?: string | null;
    project_image_display?: 'url' | 'upload';
  };
  className?: string;
  fallback?: React.ReactNode;
}

export function ProjectImage({ project, className, fallback }: ProjectImageProps) {
  // Add more detailed logging to debug
  console.log('ProjectImage props received:', project);

  // Determine the image URL based on display preference
  const imageUrl = project.project_image_display === 'url'
    ? project.project_image_url
    : project.project_image_upload
      ? `${API_URL.replace('/api', '')}/uploads/${project.project_image_upload}`
      : null;

  // Log the resolved URL and the decision process
  console.log('ProjectImage resolution:', {
    display: project.project_image_display,
    url: project.project_image_url,
    upload: project.project_image_upload,
    apiUrl: API_URL.replace('/api', ''),
    resolved: imageUrl,
    displayIsUrl: project.project_image_display === 'url',
    hasUpload: Boolean(project.project_image_upload)
  });

  if (!imageUrl) {
    console.log('ProjectImage: No image URL resolved, showing fallback');
    return fallback || null;
  }

  return (
    <img
      src={imageUrl}
      alt="Project"
      className={className}
      onError={(e) => {
        console.error('ProjectImage: Image failed to load:', {
          attemptedUrl: imageUrl,
          element: e.target
        });
        const target = e.target as HTMLImageElement;
        target.style.display = 'none';
        if (fallback && target.parentElement) {
          target.parentElement.appendChild(fallback as Node);
        }
      }}
    />
  );
} 