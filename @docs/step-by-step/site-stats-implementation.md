# Site-Wide Statistics Implementation Guide

## Overview
This guide explains how we implemented site-wide statistics that show total users, projects, articles, and posts. The stats can be displayed on both authenticated and non-authenticated views.

## Implementation Steps

### 1. Backend Implementation

#### A. Controller
Create `server/src/controllers/statsController.ts`:
```typescript
import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

export const getSiteStats = async (req: Request, res: Response) => {
  try {
    // Get counts from all relevant tables
    const [
      userCount,
      projectCount,
      articleCount,
      postCount,
      likeCount,
      followCount,
      watchCount
    ] = await Promise.all([
      prisma.users.count(),
      prisma.projects.count(),
      prisma.articles.count(),
      prisma.posts.count(),
      prisma.likes.count(),
      prisma.follows.count(),
      prisma.watches.count()
    ]);

    // Return formatted stats
    return res.json({
      totalUsers: userCount,
      totalProjects: projectCount,
      totalArticles: articleCount,
      totalPosts: postCount,
      totalLikes: likeCount,
      totalFollows: followCount,
      totalWatches: watchCount
    });
  } catch (error) {
    console.error('Error getting site stats:', error);
    return res.status(500).json({ 
      message: 'Error fetching site statistics',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
};
```

#### B. Routes
Create `server/src/routes/statsRoutes.ts`:
```typescript
import express from 'express';
import { getSiteStats } from '../controllers/statsController';

const router = express.Router();

router.get('/', getSiteStats);

export default router;
```

### 2. Frontend Implementation

#### A. API Service
Create `client/src/api/stats.ts`:
```typescript
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4100/api';

export const fetchSiteStats = async () => {
  try {
    const response = await axios.get(`${API_URL}/stats`);
    return response.data;
  } catch (error) {
    console.error('Error fetching site stats:', error);
    return null;
  }
};
```

#### B. TypeScript Types
Create `client/src/types/stats.ts`:
```typescript
export interface SiteStats {
  totalUsers: number;
  totalProjects: number;
  totalArticles: number;
  totalPosts: number;
  totalLikes?: number;
  totalFollows?: number;
  totalWatches?: number;
}
```

#### C. Stats Section Component
The stats section can be implemented directly in pages where needed:

```typescript
const StatsSection = ({ siteStats }: { siteStats: SiteStats | null }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <div className="text-2xl font-bold">{siteStats?.totalUsers || '...'}</div>
        <div className="text-gray-600">Community Members</div>
      </div>
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <div className="text-2xl font-bold">{siteStats?.totalProjects || '...'}</div>
        <div className="text-gray-600">Total Projects</div>
      </div>
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <div className="text-2xl font-bold">{siteStats?.totalArticles || '...'}</div>
        <div className="text-gray-600">Total Articles</div>
      </div>
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <div className="text-2xl font-bold">{siteStats?.totalPosts || '...'}</div>
        <div className="text-gray-600">Total Posts</div>
      </div>
    </div>
  );
};
```

## Adding Stats to Other Pages

### Step-by-Step Instructions

1. **Import Required Dependencies**
```typescript
import { fetchSiteStats } from '@/api/stats';
import { SiteStats } from '@/types/stats';
```

2. **Add State Management**
```typescript
const [siteStats, setSiteStats] = useState<SiteStats | null>(null);

useEffect(() => {
  fetchSiteStats().then(stats => setSiteStats(stats));
}, []);
```

3. **Add Stats Section**
Choose one of these approaches:

A. **Using Grid Layout (4 columns)**:
```typescript
<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
  <div className="bg-white p-4 rounded-lg shadow-sm">
    <div className="text-2xl font-bold">{siteStats?.totalUsers || '...'}</div>
    <div className="text-gray-600">Community Members</div>
  </div>
  <div className="bg-white p-4 rounded-lg shadow-sm">
    <div className="text-2xl font-bold">{siteStats?.totalProjects || '...'}</div>
    <div className="text-gray-600">Total Projects</div>
  </div>
  <div className="bg-white p-4 rounded-lg shadow-sm">
    <div className="text-2xl font-bold">{siteStats?.totalArticles || '...'}</div>
    <div className="text-gray-600">Total Articles</div>
  </div>
  <div className="bg-white p-4 rounded-lg shadow-sm">
    <div className="text-2xl font-bold">{siteStats?.totalPosts || '...'}</div>
    <div className="text-gray-600">Total Posts</div>
  </div>
</div>
```

B. **Using Section Container**:
```typescript
<section className="bg-white shadow-sm py-12">
  <div className="max-w-7xl mx-auto px-4">
    <h2 className="text-3xl font-bold text-center mb-8">Platform Statistics</h2>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {/* Stats boxes as shown above */}
    </div>
  </div>
</section>
```

4. **Add Loading State (Optional)**
```typescript
{loading ? (
  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
    {[...Array(4)].map((_, i) => (
      <div key={i} className="bg-white p-4 rounded-lg shadow-sm animate-pulse">
        <div className="h-8 bg-gray-200 rounded mb-2"></div>
        <div className="h-4 bg-gray-200 rounded"></div>
      </div>
    ))}
  </div>
) : (
  // Your stats grid here
)}
```

5. **Position the Stats Section**
Place the stats section in a logical location in your page's layout:
- After the hero section
- Before the main content
- In a sidebar
- At the bottom of the page

### Best Practices

1. **Consistent Styling**
   - Use the same shadow classes
   - Maintain consistent spacing
   - Keep the same grid layout
   - Use the same font sizes

2. **Error Handling**
   - Always provide fallback values ('...')
   - Handle null states gracefully
   - Consider showing error messages

3. **Performance**
   - Don't fetch stats too frequently
   - Consider caching the results
   - Use loading states during fetch

4. **Accessibility**
   - Add proper aria labels
   - Ensure color contrast
   - Make numbers readable

### Example Usage in a Page

```typescript
export default function SomePage() {
  const [siteStats, setSiteStats] = useState<SiteStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchSiteStats()
      .then(stats => setSiteStats(stats))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Other content */}
      
      <section className="bg-white shadow-sm py-12">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8">Platform Statistics</h2>
          {loading ? (
            // Loading state
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* Stats boxes */}
            </div>
          )}
        </div>
      </section>

      {/* More content */}
    </div>
  );
}
```

This implementation provides a consistent way to display site-wide statistics across different pages while maintaining good performance and user experience. 