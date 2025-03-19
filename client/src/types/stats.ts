export interface SiteStats {
  totalUsers: number;
  totalProjects: number;
  totalArticles: number;
  totalPosts: number;
  totalLikes?: number;
  totalFollows?: number;
  totalWatches?: number;
}

export interface UserStats {
  projects: number;
  articles: number;
  posts: number;
  likes: number;
  recentProjects?: Array<{
    id: string;
    title: string;
    description: string;
  }>;
  recentArticles?: Array<{
    id: string;
    title: string;
    description: string;
  }>;
  recentPosts?: Array<{
    id: string;
    title: string;
    description: string;
  }>;
} 