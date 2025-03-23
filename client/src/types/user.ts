export interface User {
  id: string;
  username: string | null;
  email: string;
  profile_image?: string | null;
  profile_image_url?: string | null;
  profile_image_upload?: string | null;
  profile_image_display?: 'url' | 'upload';
  bio?: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserFormData extends User {
  profile_image_file?: File | null;  // For handling file uploads
} 