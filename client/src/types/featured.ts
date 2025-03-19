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
  mediaUrl?: string;
  tags?: string[];
  skills?: string[];
  timeline?: string;
  budget?: string;
  project_followers?: number;
  bio?: string;
  user_type?: string;
  career_title?: string;
}

export interface FeaturedContent {
  users: FeaturedItem[];
  projects: FeaturedItem[];
  articles: FeaturedItem[];
  posts: FeaturedItem[];
} 