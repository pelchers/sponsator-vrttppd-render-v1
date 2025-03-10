import { PrismaClient } from '@prisma/client';

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
export const searchAll = async (
  query: string, 
  contentTypes: string[], 
  userTypes: string[], 
  page: number, 
  limit: number
) => {
  const results: any = {
    users: [],
    projects: [],
    articles: [],
    posts: []
  };
  
  const searchPromises = [];
  
  // Only search for content types that are explicitly selected
  if (contentTypes.includes('users')) {
    searchPromises.push(
      searchUsers(query, userTypes, page, limit)
        .then(data => { results.users = data.users; })
    );
  }
  
  if (contentTypes.includes('projects')) {
    searchPromises.push(
      searchProjects(query, userTypes, page, limit)
        .then(data => { results.projects = data.projects; })
    );
  }
  
  if (contentTypes.includes('articles')) {
    searchPromises.push(
      searchArticles(query, userTypes, page, limit)
        .then(data => { results.articles = data.articles; })
    );
  }
  
  if (contentTypes.includes('posts')) {
    searchPromises.push(
      searchPosts(query, userTypes, page, limit)
        .then(data => { results.posts = data.posts; })
    );
  }
  
  // Wait for all searches to complete
  await Promise.all(searchPromises);
  
  return results;
}; 