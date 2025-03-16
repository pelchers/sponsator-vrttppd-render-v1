export interface Comment {
  id: string;
  user_id: string;
  entity_type: string;
  entity_id: string;
  text: string;
  likes_count: number;
  follows_count: number;
  watches_count: number;
  created_at: string;
  updated_at: string;
  users?: {
    username: string;
    profile_image: string | null;
  };
} 