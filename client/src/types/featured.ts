interface Author {
  username: string;
  profile_image: string | null;
}

interface FeaturedItem {
  id: string;
  title?: string;
  project_name?: string;
  description?: string;
  project_description?: string;
  created_at: string;
  users: Author;
  likes_count?: number;
  follows_count?: number;
  watches_count?: number;
  followers_count?: number;
  mediaUrl?: string;
  profile_image_url?: string | null;
  profile_image_upload?: string | null;
  profile_image_display?: string;
  tags?: string[];
  skills?: string[];
  timeline?: string;
  budget?: string;
  project_followers?: number;
  bio?: string;
  user_type?: string;
  career_title?: string;
  text?: string;  // For comments
  entity_type?: string;  // For comments
  entity_id?: string;  // For comments
  username?: string;
}

export interface FeaturedContent {
  users: FeaturedItem[];
  projects: FeaturedItem[];
  articles: FeaturedItem[];
  posts: FeaturedItem[];
  comments: FeaturedItem[];
} 