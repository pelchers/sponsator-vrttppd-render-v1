import { prisma } from '../lib/prisma';

interface FeaturedOptions {
  featuredOnly?: boolean;
}

export const getFeaturedContent = async (options: FeaturedOptions = {}) => {
  try {
    const { featuredOnly = false } = options;
    const baseWhere = featuredOnly ? { featured: true } : {};

    const [latestUsers, latestProjects, latestArticles, latestPosts, latestComments] = await Promise.all([
      // Get latest users
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
          watches_count: true,
          featured: true
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
          },
          featured: true
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
          },
          featured: true
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
          },
          featured: true
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
        project_followers: project.project_followers || 0
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