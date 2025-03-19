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