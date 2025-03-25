import { PrismaClient } from '@prisma/client';
import { SortOptions, validSortFields, contentTypeFieldMap } from '../types/sorting';

const prisma = new PrismaClient();

// Search users with filters
export const searchUsers = async (
  query: string, 
  userTypes: string[], 
  page: number, 
  limit: number,
  sortField: string = 'created_at',
  sortOrder: 'asc' | 'desc' = 'desc'
) => {
  try {
    console.log(`[USERS] Sorting by ${sortField} ${sortOrder}`);
    
    // Build where clause
    const where: any = {};
    
    // Add search condition if query is provided
    if (query) {
      where.OR = [
        { username: { contains: query, mode: 'insensitive' } },
        { bio: { contains: query, mode: 'insensitive' } }
      ];
    }
    
    // Add user type filter if provided and not "all"
    if (userTypes.length > 0 && !userTypes.includes('all')) {
      where.user_type = { in: userTypes };
    }
    
    // Make sure likes_count and followers_count have default values if null
    const users = await prisma.users.findMany({
      where,
      select: {
        id: true,
        username: true,
        bio: true,
        user_type: true,
        career_title: true,
        profile_image_url: true,
        profile_image_upload: true,
        profile_image_display: true,
        likes_count: true,
        followers_count: true,
        watches_count: true
      },
      orderBy: {
        [sortField]: sortOrder
      },
      skip: (page - 1) * limit,
      take: limit
    });
    
    // Transform results to ensure consistent format
    const processedUsers = users.map(user => ({
      ...user,
      profile_image_url: user.profile_image_url || null,
      profile_image_upload: user.profile_image_upload || null,
      profile_image_display: user.profile_image_display || 'url',
      likes_count: user.likes_count || 0,
      followers_count: user.followers_count || 0,
      watches_count: user.watches_count || 0
    }));
    
    return { users: processedUsers };
  } catch (error) {
    console.error('Error searching users:', error);
    return { users: [] };
  }
};

// Search projects with filters
export const searchProjects = async (
  query: string, 
  userTypes: string[], 
  page: number, 
  limit: number,
  sortField: string = 'created_at',
  sortOrder: 'asc' | 'desc' = 'desc'
) => {
  try {
    console.log(`[PROJECTS] Sorting by ${sortField} ${sortOrder}, filtering by user types:`, userTypes);
    
    // Build where clause
    const where: any = {};
    
    // Add search condition if query is provided
    if (query) {
      where.OR = [
        { project_name: { contains: query, mode: 'insensitive' } },
        { project_description: { contains: query, mode: 'insensitive' } }
      ];
    }
    
    // Add user type filter if provided and not "all"
    if (userTypes.length > 0 && !userTypes.includes('all')) {
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
        likes_count: true,
        follows_count: true,
        watches_count: true,
        users: {
          select: {
            username: true,
            user_type: true,
            profile_image_url: true,
            profile_image_upload: true,
            profile_image_display: true
          }
        },
        project_image_url: true,
        project_image_upload: true,
        project_image_display: true
      },
      orderBy: {
        [sortField]: sortOrder
      },
      skip: (page - 1) * limit,
      take: limit
    });
    
    // Transform results to include username and use consistent field names
    const transformedProjects = projects.map(project => ({
      ...project,
      username: project.users?.username,
      user_type: project.users?.user_type,
      user_profile_image_url: project.users?.profile_image_url || null,
      user_profile_image_upload: project.users?.profile_image_upload || null,
      user_profile_image_display: project.users?.profile_image_display || 'url',
      project_image_url: project.project_image_url || null,
      project_image_upload: project.project_image_upload || null,
      project_image_display: project.project_image_display || 'url',
      likes_count: project.likes_count || 0,
      follows_count: project.follows_count || 0,
      watches_count: project.watches_count || 0
    }));
    
    console.log(`[PROJECTS] Found ${transformedProjects.length} projects`);
    return { projects: transformedProjects };
  } catch (error) {
    console.error('Error searching projects:', error);
    return { projects: [] };
  }
};

// Search articles with filters
export const searchArticles = async (
  query: string, 
  userTypes: string[], 
  page: number, 
  limit: number,
  sortField: string = 'created_at',
  sortOrder: 'asc' | 'desc' = 'desc'
) => {
  try {
    console.log(`[ARTICLES] Sorting by ${sortField} ${sortOrder}, filtering by user types:`, userTypes);
    
    // Build where clause
    const where: any = {};
    
    // Add search condition if query is provided
    if (query) {
      where.OR = [
        { title: { contains: query, mode: 'insensitive' } }
      ];
    }
    
    // Add user type filter if provided and not "all"
    if (userTypes.length > 0 && !userTypes.includes('all')) {
      where.users = {
        user_type: { in: userTypes }
      };
    }
    
    // Execute query with likes_count and follows_count
    const articles = await prisma.articles.findMany({
      where,
      select: {
        id: true,
        title: true,
        tags: true,
        created_at: true,
        user_id: true,
        likes_count: true,
        follows_count: true,
        watches_count: true,
        users: {
          select: {
            username: true,
            user_type: true,
            profile_image_url: true,
            profile_image_upload: true,
            profile_image_display: true
          }
        },
        article_sections: true,
        article_image_url: true,
        article_image_upload: true,
        article_image_display: true
      },
      orderBy: {
        [sortField]: sortOrder
      },
      skip: (page - 1) * limit,
      take: limit
    });
    
    // Transform results and ensure likes_count and follows_count exist
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
        excerpt,
        user_profile_image_url: article.users?.profile_image_url || null,
        user_profile_image_upload: article.users?.profile_image_upload || null,
        user_profile_image_display: article.users?.profile_image_display || 'url',
        likes_count: article.likes_count || 0,
        follows_count: article.follows_count || 0,
        watches_count: article.watches_count || 0
      };
    });
    
    return { articles: transformedArticles };
  } catch (error) {
    console.error('Error searching articles:', error);
    return { articles: [] };
  }
};

// Search posts with filters
export const searchPosts = async (
  query: string, 
  userTypes: string[], 
  page: number, 
  limit: number,
  sortField: string = 'created_at',
  sortOrder: 'asc' | 'desc' = 'desc'
) => {
  try {
    console.log(`[POSTS] Sorting by ${sortField} ${sortOrder}, filtering by user types:`, userTypes);
    
    // Build where clause
    const where: any = {};
    
    // Add search condition if query is provided
    if (query) {
      where.OR = [
        { title: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } }
      ];
    }
    
    // Add user type filter if provided and not "all"
    if (userTypes.length > 0 && !userTypes.includes('all')) {
      where.users = {
        user_type: { in: userTypes }
      };
    }
    
    // Execute query with likes_count and follows_count
    const posts = await prisma.posts.findMany({
      where,
      select: {
        id: true,
        title: true,
        description: true,
        mediaUrl: true,
        tags: true,
        likes_count: true,
        follows_count: true,
        watches_count: true,
        created_at: true,
        user_id: true,
        users: {
          select: {
            username: true,
            user_type: true,
            profile_image_url: true,
            profile_image_upload: true,
            profile_image_display: true
          }
        },
        post_image_url: true,
        post_image_upload: true,
        post_image_display: true
      },
      orderBy: {
        [sortField]: sortOrder
      },
      skip: (page - 1) * limit,
      take: limit
    });
    
    // Transform results and ensure likes_count and follows_count exist
    const transformedPosts = posts.map(post => ({
      ...post,
      username: post.users?.username,
      user_type: post.users?.user_type,
      user_profile_image_url: post.users?.profile_image_url || null,
      user_profile_image_upload: post.users?.profile_image_upload || null,
      user_profile_image_display: post.users?.profile_image_display || 'url',
      likes_count: post.likes_count || 0,
      follows_count: post.follows_count || 0,
      watches_count: post.watches_count || 0
    }));
    
    return { posts: transformedPosts };
  } catch (error) {
    console.error('Error searching posts:', error);
    return { posts: [] };
  }
};

// Combined search across all content types
export const searchAll = async (
  query: string,
  contentTypes: string[],
  userTypes: string[],
  page: number,
  limit: number,
  sortBy: string,
  sortOrder: 'asc' | 'desc',
  getSortField: (contentType: string, field: string) => string
) => {
  try {
    console.log(`[EXPLORE] Searching with params:`, { 
      query, 
      contentTypes, 
      userTypes, 
      page, 
      limit, 
      sortBy, 
      sortOrder 
    });
    
    // Prepare results object
    const results: any = {
      users: [],
      projects: [],
      articles: [],
      posts: []
    };
    
    // Execute searches in parallel based on selected content types
    const searchPromises = [];
    
    // Only search for content types that are explicitly selected
    if (contentTypes.includes('users')) {
      searchPromises.push(
        (async () => {
          const userSortField = getSortField('users', sortBy);
          const users = await searchUsers(query, userTypes, page, limit, userSortField, sortOrder);
          results.users = users.users;
        })()
      );
    }
    
    if (contentTypes.includes('projects')) {
      searchPromises.push(
        (async () => {
          const projectSortField = getSortField('projects', sortBy);
          const projects = await searchProjects(query, userTypes, page, limit, projectSortField, sortOrder);
          results.projects = projects.projects;
        })()
      );
    }
    
    if (contentTypes.includes('articles')) {
      searchPromises.push(
        (async () => {
          const articleSortField = getSortField('articles', sortBy);
          const articles = await searchArticles(query, userTypes, page, limit, articleSortField, sortOrder);
          results.articles = articles.articles;
        })()
      );
    }
    
    if (contentTypes.includes('posts')) {
      searchPromises.push(
        (async () => {
          const postSortField = getSortField('posts', sortBy);
          const posts = await searchPosts(query, userTypes, page, limit, postSortField, sortOrder);
          results.posts = posts.posts;
        })()
      );
    }
    
    // Wait for all searches to complete
    await Promise.all(searchPromises);
    
    console.log(`[EXPLORE] Search results:`, {
      userCount: results.users.length,
      projectCount: results.projects.length,
      articleCount: results.articles.length,
      postCount: results.posts.length
    });
    
    // Return results
    return {
      results,
      totalPages: 1, // Simplified for now
      page
    };
  } catch (error) {
    console.error('Error in searchAll service:', error);
    throw error;
  }
}; 