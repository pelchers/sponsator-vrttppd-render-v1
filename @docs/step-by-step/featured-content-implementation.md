# Featured Content Implementation Guide

This guide explains how we implemented the featured content section that displays the latest users, projects, articles, and posts in rows on the landing page.

## 1. Frontend Implementation

### A. Types
Create `client/src/types/featured.ts`:
```typescript
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
  project_followers?: number;  // Required for ProjectCard
  bio?: string;
  user_type?: string;
  career_title?: string;
  text?: string;  // For comments
  entity_type?: string;  // For comments
  entity_id?: string;  // For comments
}

export interface FeaturedContent {
  users: FeaturedItem[];
  projects: FeaturedItem[];
  articles: FeaturedItem[];
  posts: FeaturedItem[];
  comments: FeaturedItem[];  // Added comments array
}
```

### B. API Configuration
Update `client/src/api/config.ts`:
```typescript
export const API_ROUTES = {
  // ... existing routes ...
  FEATURED: {
    GET: '/featured'
  }
};
```

### C. API Service
Create `client/src/api/featured.ts`:
```typescript
import axios from 'axios';
import { API_ROUTES } from './config';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4100/api';

export const fetchFeaturedContent = async () => {
  try {
    const response = await axios.get(`${API_URL}${API_ROUTES.FEATURED.GET}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching featured content:', error);
    return {
      users: [],
      projects: [],
      articles: [],
      posts: []
    };
  }
};
```

### D. Landing Page Integration
Update `client/src/pages/landing/Landing.tsx`:
```typescript
import { useState, useEffect } from 'react';
import { fetchFeaturedContent } from '@/api/featured';
import type { FeaturedContent } from '@/types/featured';
import { FeaturedContentSkeleton } from '@/components/skeletons/FeaturedContentSkeleton';
import UserCard from '@/components/cards/UserCard';
import ProjectCard from '@/components/cards/ProjectCard';
import ArticleCard from '@/components/cards/ArticleCard';
import PostCard from '@/components/cards/PostCard';

export default function Landing() {
  const [featuredContent, setFeaturedContent] = useState<FeaturedContent>({
    users: [],
    projects: [],
    articles: [],
    posts: [],
    comments: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchFeaturedContent()
      .then(content => setFeaturedContent(content))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="py-8 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-2xl font-semibold mb-6">Featured Content</h2>
        {loading ? (
          <FeaturedContentSkeleton />
        ) : (
          <div className="space-y-6">
            {/* Users */}
            <div className="bg-gray-50 p-6 rounded-xl">
              <h3 className="text-xl font-semibold mb-4">Featured Users</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {featuredContent.users.map((user) => (
                  <UserCard key={user.id} user={user} />
                ))}
              </div>
            </div>

            {/* Projects */}
            <div className="bg-gray-50 p-6 rounded-xl">
              <h3 className="text-xl font-semibold mb-4">Recent Projects</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {featuredContent.projects.map((project) => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </div>
            </div>

            {/* Articles */}
            <div className="bg-gray-50 p-6 rounded-xl">
              <h3 className="text-xl font-semibold mb-4">Recent Articles</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {featuredContent.articles.map((article) => (
                  <ArticleCard key={article.id} article={article} />
                ))}
              </div>
            </div>

            {/* Posts */}
            <div className="bg-gray-50 p-6 rounded-xl">
              <h3 className="text-xl font-semibold mb-4">Recent Posts</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {featuredContent.posts.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>
            </div>

            {/* Comments Section */}
            <div className="bg-gray-50 p-6 rounded-xl">
              <h3 className="text-xl font-semibold mb-4">
                Recent Comments
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {featuredContent.comments.map((comment) => (
                  <div 
                    key={comment.id}
                    className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-all duration-200"
                  >
                    <div className="flex items-center mb-3">
                      <img 
                        src={comment.users.profile_image || '/default-avatar.png'} 
                        alt={comment.users.username}
                        className="w-8 h-8 rounded-full mr-2"
                      />
                      <div>
                        <Link 
                          to={`/profile/${comment.users.id}`}
                          className="font-medium text-gray-900 hover:text-blue-600"
                        >
                          {comment.users.username}
                        </Link>
                        <p className="text-xs text-gray-500">
                          on {comment.entity_type} • {new Date(comment.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <p className="text-gray-700 line-clamp-3">{comment.text}</p>
                    <div className="mt-2 flex items-center gap-2 text-sm text-gray-500">
                      <span>❤️ {comment.likes_count}</span>
                      <span>👁️ {comment.watches_count}</span>
                      <Link 
                        to={`/${comment.entity_type}/${comment.entity_id}`}
                        className="ml-auto text-blue-600 hover:text-blue-800"
                      >
                        View {comment.entity_type}
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
```

## 2. Backend Implementation

### A. Service
Create `server/src/services/featuredService.ts`:
```typescript
import { prisma } from '../lib/prisma';

export const getFeaturedContent = async () => {
  try {
    const [latestUsers, latestProjects, latestArticles, latestPosts, latestComments] = await Promise.all([
      // Get latest users
      prisma.users.findMany({
        take: 3,
        orderBy: { created_at: 'desc' },
        select: {
          id: true,
          username: true,
          profile_image: true,
          bio: true,
          user_type: true,
          career_title: true,
          created_at: true,
          likes_count: true,
          follows_count: true,
          watches_count: true
        }
      }).catch(() => []),

      // Get latest projects
      prisma.projects.findMany({
        take: 3,
        orderBy: { created_at: 'desc' },
        select: {
          id: true,
          project_name: true,
          project_description: true,
          created_at: true,
          likes_count: true,
          follows_count: true,
          watches_count: true,
          project_image: true,
          project_tags: true,
          project_followers: true,
          budget: true,
          project_timeline: true,
          target_audience: true,
          skills_required: true,
          users: {
            select: {
              id: true,
              username: true,
              profile_image: true
            }
          }
        }
      }).catch(() => []),

      // Get latest articles
      prisma.articles.findMany({
        take: 3,
        orderBy: { created_at: 'desc' },
        select: {
          id: true,
          title: true,
          tags: true,
          created_at: true,
          likes_count: true,
          follows_count: true,
          watches_count: true,
          related_media: true,
          article_sections: {
            select: {
              text: true,
              media_url: true
            }
          },
          users: {
            select: {
              id: true,
              username: true,
              profile_image: true
            }
          }
        }
      }).catch(() => []),

      // Get latest posts
      prisma.posts.findMany({
        take: 3,
        orderBy: { created_at: 'desc' },
        select: {
          id: true,
          title: true,
          description: true,
          created_at: true,
          likes_count: true,
          follows_count: true,
          watches_count: true,
          mediaUrl: true,
          tags: true,
          users: {
            select: {
              id: true,
              username: true,
              profile_image: true
            }
          }
        }
      }).catch(() => []),

      // Get latest comments
      prisma.comments.findMany({
        take: 3,
        orderBy: { created_at: 'desc' },
        select: {
          id: true,
          text: true,
          created_at: true,
          entity_type: true,
          entity_id: true,
          likes_count: true,
          follows_count: true,
          watches_count: true,
          featured: true,
          users: {
            select: {
              id: true,
              username: true,
              profile_image: true
            }
          }
        }
      }).catch(() => [])
    ]);

    return {
      users: latestUsers,
      projects: latestProjects.map(project => ({
        ...project,
        mediaUrl: project.project_image,
        tags: project.project_tags,
        skills: project.skills_required,
        timeline: project.project_timeline,
      })),
      articles: latestArticles.map(article => ({
        ...article,
        mediaUrl: article.related_media?.[0] || null,
        description: article.article_sections?.[0]?.text || '',
      })),
      posts: latestPosts,
      comments: latestComments
    };
  } catch (error) {
    console.error('Error in getFeaturedContent service:', error);
    return {
      users: [],
      projects: [],
      articles: [],
      posts: [],
      comments: []
    };
  }
};
```

### B. Controller
Create `server/src/controllers/featuredController.ts`:
```typescript
import { Request, Response } from 'express';
import * as featuredService from '../services/featuredService';

export const getFeaturedContent = async (req: Request, res: Response) => {
  try {
    const featuredContent = await featuredService.getFeaturedContent();
    return res.json(featuredContent);
  } catch (error) {
    console.error('Error getting featured content:', error);
    return res.status(500).json({ 
      message: 'Error fetching featured content',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
};
```

### C. Routes
Create `server/src/routes/featuredRoutes.ts`:
```typescript
import express from 'express';
import { getFeaturedContent } from '../controllers/featuredController';

const router = express.Router();

router.get('/', getFeaturedContent);

export default router;
```

### D. Register Routes
Update `server/src/routes/index.ts`:
```typescript
import featuredRoutes from './featuredRoutes';
// ... other imports ...

const router = Router();

// ... other routes ...
router.use('/featured', featuredRoutes);

export default router;
```

## Key Features

1. **Latest Content**: Shows the 3 most recent items from each content type (including comments)
2. **Author Information**: Displays author username and profile image
3. **Loading States**: Shows loading skeletons while fetching data
4. **Error Handling**: Gracefully handles API errors
5. **Responsive Design**: Grid layout adjusts for different screen sizes
6. **Interactive Elements**: Uses our existing card components with full functionality
7. **Comment Context**: Shows which content type the comment is on and links to it

## Best Practices

1. **Performance**
   - Fetch all content types in parallel using Promise.all
   - Use proper loading states
   - Transform data at the service level

2. **Error Handling**
   - Catch errors at both service and controller levels
   - Return empty arrays as fallbacks
   - Log errors for debugging

3. **Type Safety**
   - Use TypeScript interfaces for all data structures
   - Handle optional fields properly
   - Match schema field names exactly

4. **Code Organization**
   - Separate concerns between service and controller
   - Keep transformations consistent
   - Follow existing patterns for routes and controllers

This implementation provides a clean, efficient way to display featured content while maintaining good performance and user experience.

## 9. Adding Featured Content Filter

### A. Database Schema Update
Add a `featured` boolean field to all relevant tables:

```sql
-- Add featured field to all relevant tables
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "featured" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "featured" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "articles" ADD COLUMN IF NOT EXISTS "featured" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "posts" ADD COLUMN IF NOT EXISTS "featured" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "comments" ADD COLUMN IF NOT EXISTS "featured" BOOLEAN NOT NULL DEFAULT false;
```

### B. Frontend Implementation

1. Update the API service to support featured filtering:
```typescript
interface FetchFeaturedContentOptions {
  featuredOnly?: boolean;
}

export const fetchFeaturedContent = async (options: FetchFeaturedContentOptions = {}) => {
  try {
    const { featuredOnly = false } = options;
    const params = featuredOnly ? '?featured=true' : '';
    const response = await axios.get(`${API_URL}${API_ROUTES.FEATURED.GET}${params}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching featured content:', error);
    return {
      users: [],
      projects: [],
      articles: [],
      posts: []
    };
  }
};
```

2. Update Landing page to show both featured and recent content:
```typescript
export default function Landing() {
  const [featuredContent, setFeaturedContent] = useState<FeaturedContent>({
    users: [],
    projects: [],
    articles: [],
    posts: [],
    comments: []
  });
  const [allContent, setAllContent] = useState<FeaturedContent>({
    users: [],
    projects: [],
    articles: [],
    posts: [],
    comments: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetchFeaturedContent({ featuredOnly: true }),
      fetchFeaturedContent({ featuredOnly: false })
    ])
      .then(([featured, all]) => {
        setFeaturedContent(featured);
        setAllContent(all);
      })
      .finally(() => setLoading(false));
  }, []);

  // ... in JSX ...
  <section className="py-8 bg-white">
    <div className="max-w-7xl mx-auto px-4">
      {/* Featured Content Section */}
      <h2 className="text-2xl font-semibold mb-6">Featured Content</h2>
      {loading ? (
        <FeaturedContentSkeleton />
      ) : (
        <div className="space-y-6">
          {/* Featured content grid */}
        </div>
      )}

      {/* Recent Content Section */}
      <h2 className="text-2xl font-semibold mb-6 mt-12">Recent Content</h2>
      {loading ? (
        <FeaturedContentSkeleton />
      ) : (
        <div className="space-y-6">
          {/* Recent content grid */}
        </div>
      )}
    </div>
  </section>
```

### C. Backend Implementation

1. Update service to support featured filtering:
```typescript
interface FeaturedOptions {
  featuredOnly?: boolean;
}

export const getFeaturedContent = async (options: FeaturedOptions = {}) => {
  try {
    const { featuredOnly = false } = options;
    const baseWhere = featuredOnly ? { featured: true } : {};

    const [latestUsers, latestProjects, latestArticles, latestPosts, latestComments] = await Promise.all([
      // Get latest users with optional featured filter
      prisma.users.findMany({
        where: baseWhere,
        take: 3,
        orderBy: { created_at: 'desc' },
        select: {
          id: true,
          username: true,
          profile_image: true,
          bio: true,
          user_type: true,
          career_title: true,
          created_at: true,
          likes_count: true,
          follows_count: true,
          watches_count: true
        }
      }).catch(() => []),

      // Get latest projects
      prisma.projects.findMany({
        where: baseWhere,
        take: 3,
        orderBy: { created_at: 'desc' },
        select: {
          id: true,
          project_name: true,
          project_description: true,
          created_at: true,
          likes_count: true,
          follows_count: true,
          watches_count: true,
          project_image: true,
          project_tags: true,
          project_followers: true,
          budget: true,
          project_timeline: true,
          target_audience: true,
          skills_required: true,
          users: {
            select: {
              id: true,
              username: true,
              profile_image: true
            }
          }
        }
      }).catch(() => []),

      // Get latest articles
      prisma.articles.findMany({
        where: baseWhere,
        take: 3,
        orderBy: { created_at: 'desc' },
        select: {
          id: true,
          title: true,
          tags: true,
          created_at: true,
          likes_count: true,
          follows_count: true,
          watches_count: true,
          related_media: true,
          article_sections: {
            select: {
              text: true,
              media_url: true
            }
          },
          users: {
            select: {
              id: true,
              username: true,
              profile_image: true
            }
          }
        }
      }).catch(() => []),

      // Get latest posts
      prisma.posts.findMany({
        where: baseWhere,
        take: 3,
        orderBy: { created_at: 'desc' },
        select: {
          id: true,
          title: true,
          description: true,
          created_at: true,
          likes_count: true,
          follows_count: true,
          watches_count: true,
          mediaUrl: true,
          tags: true,
          users: {
            select: {
              id: true,
              username: true,
              profile_image: true
            }
          }
        }
      }).catch(() => []),

      // Get latest comments
      prisma.comments.findMany({
        where: baseWhere,
        take: 3,
        orderBy: { created_at: 'desc' },
        select: {
          id: true,
          text: true,
          created_at: true,
          entity_type: true,
          entity_id: true,
          likes_count: true,
          follows_count: true,
          watches_count: true,
          featured: true,
          users: {
            select: {
              id: true,
              username: true,
              profile_image: true
            }
          }
        }
      }).catch(() => [])
    ]);

    return {
      users: latestUsers,
      projects: latestProjects.map(project => ({
        ...project,
        mediaUrl: project.project_image,
        tags: project.project_tags,
        skills: project.skills_required,
        timeline: project.project_timeline,
      })),
      articles: latestArticles.map(article => ({
        ...article,
        mediaUrl: article.related_media?.[0] || null,
        description: article.article_sections?.[0]?.text || '',
      })),
      posts: latestPosts,
      comments: latestComments
    };
  } catch (error) {
    console.error('Error in getFeaturedContent service:', error);
    return {
      users: [],
      projects: [],
      articles: [],
      posts: [],
      comments: []
    };
  }
};
```

2. Update controller to handle featured parameter:
```typescript
export const getFeaturedContent = async (req: Request, res: Response) => {
  try {
    const featuredOnly = req.query.featured === 'true';
    const featuredContent = await featuredService.getFeaturedContent({ featuredOnly });
    return res.json(featuredContent);
  } catch (error) {
    // ... error handling ...
  }
};
```

### D. Usage

1. To show only featured content:
```typescript
fetchFeaturedContent({ featuredOnly: true })
```

2. To show all content:
```typescript
fetchFeaturedContent({ featuredOnly: false })
```

3. To show both (like on the landing page):
```typitten
Promise.all([
  fetchFeaturedContent({ featuredOnly: true }),
  fetchFeaturedContent({ featuredOnly: false })
])
```

### E. Admin Management

To mark content as featured:
1. Use your admin interface or database tool
2. Set the `featured` field to `true` for the desired content
3. The content will automatically appear in the featured sections

This implementation allows for:
- Flexible content curation
- Easy toggling of featured status
- Separate display of featured and recent content
- Consistent loading states and error handling
- Reusable components for both sections

This implementation provides a clean, efficient way to display featured content while maintaining good performance and user experience. 