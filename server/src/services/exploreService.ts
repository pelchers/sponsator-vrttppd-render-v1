import { PrismaClient } from '@prisma/client';
import { SortOptions, validSortFields, contentTypeFieldMap } from '../types/sorting';

const prisma = new PrismaClient();

// Search users with filters
export const searchUsers = async (query: string, userTypes: string[], page: number, limit: number) => {
  try {
    // Build where clause
    const where: any = {};
    
    // Add search condition if query is provided
    if (query) {
      where.OR = [
        { username: { contains: query, mode: 'insensitive' } },
        { bio: { contains: query, mode: 'insensitive' } }
      ];
    }
    
    // Add user type filter if provided
    if (userTypes.length > 0) {
      where.user_type = { in: userTypes };
    }
    
    // Execute query using Prisma directly
    const users = await prisma.users.findMany({
      where,
      select: {
        id: true,
        username: true,
        bio: true,
        profile_image: true,
        user_type: true,
        created_at: true
      },
      skip: (page - 1) * limit,
      take: limit
    });
    
    return { users };
  } catch (error) {
    console.error('Error searching users:', error);
    return { users: [] };
  }
};

// Search projects with filters
export const searchProjects = async (query: string, userTypes: string[], page: number, limit: number) => {
  try {
    // Build where clause
    const where: any = {};
    
    // Add search condition if query is provided
    if (query) {
      where.OR = [
        { project_name: { contains: query, mode: 'insensitive' } },
        { project_description: { contains: query, mode: 'insensitive' } }
      ];
    }
    
    // Add user type filter if provided
    if (userTypes.length > 0) {
      where.users = {
        user_type: { in: userTypes }
      };
    }
    
    // Execute query
    const projects = await prisma.projects.findMany({
      where,
      select: {
        id: true,
        project_name: true,
        project_description: true,
        project_image: true,
        project_type: true,
        project_tags: true,
        created_at: true,
        user_id: true,
        users: {
          select: {
            username: true,
            user_type: true
          }
        }
      },
      skip: (page - 1) * limit,
      take: limit
    });
    
    // Transform results to include username and use consistent field names
    const transformedProjects = projects.map(project => ({
      id: project.id,
      title: project.project_name,
      description: project.project_description,
      project_image: project.project_image,
      project_type: project.project_type,
      tags: project.project_tags,
      created_at: project.created_at,
      user_id: project.user_id,
      username: project.users?.username,
      user_type: project.users?.user_type
    }));
    
    return { projects: transformedProjects };
  } catch (error) {
    console.error('Error searching projects:', error);
    return { projects: [] };
  }
};

// Search articles with filters
export const searchArticles = async (query: string, userTypes: string[], page: number, limit: number) => {
  try {
    // Build where clause
    const where: any = {};
    
    // Add search condition if query is provided
    if (query) {
      where.OR = [
        { title: { contains: query, mode: 'insensitive' } }
        // Note: searching in sections would require more complex logic
      ];
    }
    
    // Add user type filter if provided
    if (userTypes.length > 0) {
      where.users = {
        user_type: { in: userTypes }
      };
    }
    
    // Execute query
    const articles = await prisma.articles.findMany({
      where,
      select: {
        id: true,
        title: true,
        tags: true,
        created_at: true,
        user_id: true,
        users: {
          select: {
            username: true,
            user_type: true
          }
        },
        article_sections: true
      },
      skip: (page - 1) * limit,
      take: limit
    });
    
    // Transform results to include username and excerpt
    const transformedArticles = articles.map(article => {
      // Create excerpt from first text section
      let excerpt = 'No content available';
      try {
        const firstSection = article.article_sections?.[0];
        if (firstSection && firstSection.text) {
          excerpt = firstSection.text.substring(0, 150) + '...';
        }
      } catch (e) {
        // Use default excerpt if parsing fails
      }
      
      return {
        ...article,
        username: article.users?.username,
        user_type: article.users?.user_type,
        excerpt
      };
    });
    
    return { articles: transformedArticles };
  } catch (error) {
    console.error('Error searching articles:', error);
    return { articles: [] };
  }
};

// Search posts with filters
export const searchPosts = async (query: string, userTypes: string[], page: number, limit: number) => {
  try {
    // Build where clause
    const where: any = {};
    
    // Add search condition if query is provided
    if (query) {
      where.OR = [
        { title: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } }
      ];
    }
    
    // Add user type filter if provided
    if (userTypes.length > 0) {
      where.users = {
        user_type: { in: userTypes }
      };
    }
    
    // Execute query
    const posts = await prisma.posts.findMany({
      where,
      select: {
        id: true,
        title: true,
        description: true,
        mediaUrl: true,
        tags: true,
        likes: true,
        comments: true,
        created_at: true,
        user_id: true,
        users: {
          select: {
            username: true,
            user_type: true
          }
        }
      },
      skip: (page - 1) * limit,
      take: limit
    });
    
    // Transform results to include username
    const transformedPosts = posts.map(post => ({
      ...post,
      username: post.users?.username,
      user_type: post.users?.user_type,
      comments: typeof post.comments === 'number' ? post.comments : 0
    }));
    
    return { posts: transformedPosts };
  } catch (error) {
    console.error('Error searching posts:', error);
    return { posts: [] };
  }
};

// Combined search across all content types
export async function searchAll(
  query: string,
  options: {
    contentTypes?: string[];
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }
) {
  const { 
    contentTypes = ['all'], 
    page = 1, 
    limit = 12,
    sortBy = 'created_at',
    sortOrder = 'desc'
  } = options;

  // Build sort object for Prisma
  const orderBy = sortBy === 'title' 
    ? { // Handle title field mapping per content type
      users: { username: sortOrder },
      projects: { project_name: sortOrder },
      articles: { title: sortOrder },
      posts: { title: sortOrder }
    }
    : { // Use same field name for all content types
      [sortBy]: sortOrder
    };

  // Use existing content type filtering logic
  const showAll = contentTypes.includes('all');
  const results = {
    users: showAll || contentTypes.includes('users') 
      ? await prisma.users.findMany({
          where: {
            OR: [
              { username: { contains: query, mode: 'insensitive' } },
              { bio: { contains: query, mode: 'insensitive' } }
            ]
          },
          orderBy: {
            [sortBy === 'title' ? 'username' : sortBy]: sortOrder
          },
          select: {
            id: true,
            username: true,
            bio: true,
            profile_image: true,
            user_type: true,
            created_at: true
          },
          skip: (page - 1) * limit,
          take: limit
        })
      : [],
    projects: showAll || contentTypes.includes('projects')
      ? await prisma.projects.findMany({
          where: {
            OR: [
              { project_name: { contains: query, mode: 'insensitive' } },
              { project_description: { contains: query, mode: 'insensitive' } }
            ],
            users: {
              user_type: { in: contentTypes.filter(type => type !== 'users') }
            }
          },
          orderBy: {
            [sortBy === 'title' ? 'project_name' : sortBy]: sortOrder
          },
          select: {
            id: true,
            project_name: true,
            project_description: true,
            project_image: true,
            project_type: true,
            project_tags: true,
            created_at: true,
            user_id: true,
            users: {
              select: {
                username: true,
                user_type: true
              }
            }
          },
          skip: (page - 1) * limit,
          take: limit
        })
      : [],
    articles: showAll || contentTypes.includes('articles')
      ? await prisma.articles.findMany({
          where: {
            OR: [
              { title: { contains: query, mode: 'insensitive' } }
            ],
            users: {
              user_type: { in: contentTypes.filter(type => type !== 'articles') }
            }
          },
          orderBy: {
            [sortBy === 'title' ? 'title' : sortBy]: sortOrder
          },
          select: {
            id: true,
            title: true,
            tags: true,
            created_at: true,
            user_id: true,
            users: {
              select: {
                username: true,
                user_type: true
              }
            },
            article_sections: true
          },
          skip: (page - 1) * limit,
          take: limit
        })
      : [],
    posts: showAll || contentTypes.includes('posts')
      ? await prisma.posts.findMany({
          where: {
            OR: [
              { title: { contains: query, mode: 'insensitive' } },
              { description: { contains: query, mode: 'insensitive' } }
            ],
            users: {
              user_type: { in: contentTypes.filter(type => type !== 'posts') }
            }
          },
          orderBy: {
            [sortBy === 'title' ? 'title' : sortBy]: sortOrder
          },
          select: {
            id: true,
            title: true,
            description: true,
            mediaUrl: true,
            tags: true,
            likes: true,
            comments: true,
            created_at: true,
            user_id: true,
            users: {
              select: {
                username: true,
                user_type: true
              }
            }
          },
          skip: (page - 1) * limit,
          take: limit
        })
      : []
  };

  return {
    results,
    page,
    limit,
    // ... rest of return object
  };
} 