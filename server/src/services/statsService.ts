import prisma from '../lib/prisma';

export const getSiteStats = async () => {
  try {
    console.log('[STATS SERVICE] Calculating site statistics');
    
    // Get counts from all relevant tables
    const [
      usersCount,
      projectsCount,
      articlesCount,
      postsCount,
      likesCount,
      followsCount,
      watchesCount
    ] = await Promise.all([
      prisma.users.count(),
      prisma.projects.count(),
      prisma.articles.count(),
      prisma.posts.count(),
      prisma.likes.count(),
      prisma.follows.count(),
      prisma.watches.count()
    ]);
    
    // Calculate total content
    const totalContent = projectsCount + articlesCount + postsCount;
    
    console.log('[STATS SERVICE] Statistics calculated:', {
      users: usersCount,
      projects: projectsCount,
      articles: articlesCount,
      posts: postsCount,
      likes: likesCount,
      follows: followsCount,
      watches: watchesCount,
      totalContent
    });
    
    return {
      users: usersCount,
      projects: projectsCount,
      articles: articlesCount,
      posts: postsCount,
      likes: likesCount,
      follows: followsCount,
      watches: watchesCount,
      totalContent
    };
  } catch (error) {
    console.error('[STATS SERVICE] Error calculating statistics:', error);
    throw error;
  }
}; 