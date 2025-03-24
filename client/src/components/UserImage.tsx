import { API_URL } from '@/config';

interface UserImageProps {
  user: {
    profile_image_display?: 'url' | 'upload';
    profile_image_url?: string | null;
    profile_image_upload?: string | null;
  };
  className?: string;
  fallback?: React.ReactNode;
}

export function UserImage({ user, className, fallback }: UserImageProps) {
  const imageUrl = user.profile_image_display === 'url'
    ? user.profile_image_url
    : user.profile_image_upload
      ? `${API_URL.replace('/api', '')}/uploads/${user.profile_image_upload}`
      : null;

  if (!imageUrl) {
    return fallback || null;
  }

  return (
    <img
      src={imageUrl}
      alt="User profile"
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