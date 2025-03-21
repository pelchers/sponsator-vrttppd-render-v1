export interface User {
  id: string;
  username: string;
  email: string;
  profile_image?: string;
  profile_image_url?: string;
  profile_image_upload?: string;
  bio?: string;
  created_at: string;
  updated_at: string;
}

export interface UserFormData extends User {
  profile_image_file?: File | null;  // For handling file uploads
} 