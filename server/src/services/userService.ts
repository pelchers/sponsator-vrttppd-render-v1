import prisma from '../lib/prisma';

// Add this function to map database user to frontend format
function mapUserToFrontend(user: any) {
  // Map flattened social links to nested object
  const social_links = {
    youtube: user.social_links_youtube || '',
    instagram: user.social_links_instagram || '',
    github: user.social_links_github || '',
    twitter: user.social_links_twitter || '',
    linkedin: user.social_links_linkedin || '',
  };

  // Map flattened notification preferences to nested object
  const notification_preferences = {
    email: user.notification_preferences_email || false,
    push: user.notification_preferences_push || false,
    digest: user.notification_preferences_digest || false,
  };

  // Return user with nested objects
  return {
    ...user,
    social_links,
    notification_preferences,
    // Remove the flattened fields to avoid duplication
    social_links_youtube: undefined,
    social_links_instagram: undefined,
    social_links_github: undefined,
    social_links_twitter: undefined,
    social_links_linkedin: undefined,
    notification_preferences_email: undefined,
    notification_preferences_push: undefined,
    notification_preferences_digest: undefined,
  };
}

// Add this function to map frontend data to database format
function mapFrontendToUser(userData: any) {
  console.log('Processing update data');
  
  // Extract nested objects and related data
  const { 
    social_links, 
    notification_preferences,
    // Keep these in the data instead of removing them
    // work_experience,
    // education,
    // certifications,
    // accolades,
    // endorsements,
    // featured_projects,
    // case_studies,
    ...rest 
  } = userData;

  // Flatten social links
  const flattenedSocialLinks = social_links ? {
    social_links_youtube: social_links.youtube || '',
    social_links_instagram: social_links.instagram || '',
    social_links_github: social_links.github || '',
    social_links_twitter: social_links.twitter || '',
    social_links_linkedin: social_links.linkedin || '',
  } : {};

  // Flatten notification preferences
  const flattenedNotificationPrefs = notification_preferences ? {
    notification_preferences_email: notification_preferences.email || false,
    notification_preferences_push: notification_preferences.push || false,
    notification_preferences_digest: notification_preferences.digest || false,
  } : {};

  // Convert numeric fields to the correct type
  const convertedData = {
    ...rest,
    // Convert string numbers to integers
    career_experience: rest.career_experience !== undefined ? 
      parseInt(rest.career_experience, 10) || 0 : undefined,
    social_media_followers: rest.social_media_followers !== undefined ? 
      parseInt(rest.social_media_followers, 10) || 0 : undefined,
  };

  // Return data with flattened fields and keeping related data
  return {
    ...convertedData,
    ...flattenedSocialLinks,
    ...flattenedNotificationPrefs,
  };
}

export async function getUserById(id: string) {
  try {
    const user = await prisma.users.findUnique({
      where: { id },
      include: {
        user_work_experience: true,
        user_education: true,
        user_certifications: true,
        user_accolades: true,
        user_endorsements: true,
        user_featured_projects: true,
        user_case_studies: true
      }
    });
    
    if (!user) return null;
    
    // Remove sensitive data
    const { password_hash, ...userWithoutPassword } = user;
    
    // Map to frontend format
    return mapUserToFrontend(userWithoutPassword);
  } catch (error) {
    console.error('Error in getUserById:', error);
    throw error;
  }
}

export async function updateUser(id: string, data: any) {
  try {
    console.log('Updating user with ID:', id);
    console.log('Update data:', data);
    
    // Extract all related data before mapping
    const {
      work_experience,
      education,
      certifications,
      accolades,
      endorsements,
      featured_projects,
      case_studies,
      ...mainData
    } = data;

    // Map frontend data to database format for main user fields
    const dbData = mapFrontendToUser(mainData);
    console.log('Mapped data for database:', dbData);
    
    // Extract fields that shouldn't be directly updated
    const {
      password_hash,
      created_at,
      ...updateData
    } = dbData;

    // Add updated_at timestamp
    updateData.updated_at = new Date();
    
    console.log('Final update data for main user record:', updateData);
    
    // Start a transaction to update the user and related data
    const result = await prisma.$transaction(async (tx) => {
      // Update the main user record
      const updatedUser = await tx.users.update({
        where: { id },
        data: updateData,
      });

      // Update work experience
      if (work_experience) {
        await tx.user_work_experience.deleteMany({
          where: { user_id: id }
        });
        
        if (work_experience.length > 0) {
          await tx.user_work_experience.createMany({
            data: work_experience.map(exp => ({
              user_id: id,
              title: exp.title || '',
              company: exp.company || '',
              years: exp.years || '',
              media: exp.media || null
            }))
          });
        }
      }

      // Update education
      if (education) {
        await tx.user_education.deleteMany({
          where: { user_id: id }
        });
        
        if (education.length > 0) {
          await tx.user_education.createMany({
            data: education.map(edu => ({
              user_id: id,
              degree: edu.degree || '',
              school: edu.school || '',
              year: edu.year || '',
              media: edu.media || null
            }))
          });
        }
      }

      // Update certifications
      if (certifications) {
        await tx.user_certifications.deleteMany({
          where: { user_id: id }
        });
        
        if (certifications.length > 0) {
          await tx.user_certifications.createMany({
            data: certifications.map(cert => ({
              user_id: id,
              name: cert.name || '',
              issuer: cert.issuer || '',
              year: cert.year || '',
              media: cert.media || null
            }))
          });
        }
      }

      // Update accolades
      if (accolades) {
        await tx.user_accolades.deleteMany({
          where: { user_id: id }
        });
        
        if (accolades.length > 0) {
          await tx.user_accolades.createMany({
            data: accolades.map(accolade => ({
              user_id: id,
              title: accolade.title || '',
              issuer: accolade.issuer || '',
              year: accolade.year || '',
              media: accolade.media || null
            }))
          });
        }
      }

      // Update endorsements
      if (endorsements) {
        await tx.user_endorsements.deleteMany({
          where: { user_id: id }
        });
        
        if (endorsements.length > 0) {
          await tx.user_endorsements.createMany({
            data: endorsements.map(endorsement => ({
              user_id: id,
              name: endorsement.name || '',
              position: endorsement.position || '',
              company: endorsement.company || '',
              text: endorsement.text || '',
              media: endorsement.media || null
            }))
          });
        }
      }

      // Update featured projects
      if (featured_projects) {
        await tx.user_featured_projects.deleteMany({
          where: { user_id: id }
        });
        
        if (featured_projects.length > 0) {
          await tx.user_featured_projects.createMany({
            data: featured_projects.map(project => ({
              user_id: id,
              title: project.title || '',
              description: project.description || '',
              url: project.url || '',
              media: project.media || null
            }))
          });
        }
      }

      // Update case studies
      if (case_studies) {
        await tx.user_case_studies.deleteMany({
          where: { user_id: id }
        });
        
        if (case_studies.length > 0) {
          await tx.user_case_studies.createMany({
            data: case_studies.map(study => ({
              user_id: id,
              title: study.title || '',
              description: study.description || '',
              url: study.url || '',
              media: study.media || null
            }))
          });
        }
      }

      // Fetch the updated user with all related data
      return await tx.users.findUnique({
        where: { id },
        include: {
          user_work_experience: true,
          user_education: true,
          user_certifications: true,
          user_accolades: true,
          user_endorsements: true,
          user_featured_projects: true,
          user_case_studies: true
        }
      });
    });

    console.log('User updated successfully');
    
    // Remove sensitive data
    const { password_hash: _, ...userWithoutPassword } = result;
    
    // Map to frontend format
    return mapUserToFrontend(userWithoutPassword);
  } catch (error) {
    console.error('Error in updateUser:', error);
    throw error;
  }
}

export async function uploadProfileImage(id: string, file: Express.Multer.File) {
  // This would typically involve:
  // 1. Uploading the file to a storage service (S3, etc.)
  // 2. Getting the URL of the uploaded file
  // 3. Updating the user's profile_image field with the URL
  
  // For this example, we'll assume the file is saved locally and we just store the path
  const imagePath = `/uploads/${file.filename}`;
  
  await prisma.users.update({
    where: { id },
    data: {
      profile_image: imagePath
    }
  });
  
  return imagePath;
}

export async function getUserByEmail(email: string) {
  try {
    const user = await prisma.users.findUnique({
      where: { email },
    });
    
    return user;
  } catch (error) {
    console.error('Error in getUserByEmail:', error);
    throw error;
  }
}

export async function createUser(userData: { username: string; email: string; password_hash: string }) {
  try {
    const now = new Date();
    
    const user = await prisma.users.create({
      data: {
        ...userData,
        created_at: now,
        updated_at: now,
        profile_image: '/placeholder.svg', // Default profile image
        bio: '',
        user_type: 'user',
      },
    });
    
    // Map to frontend format
    return mapUserToFrontend(user);
  } catch (error) {
    console.error('Error in createUser:', error);
    throw error;
  }
}

/**
 * Get all content liked by a user
 */
export const getUserLikedContent = async (
  userId: string,
  contentTypes: string[],
  page: number,
  limit: number
) => {
  console.log(`[USER SERVICE] Getting liked content for user=${userId}, types=${contentTypes.join(',')}, page=${page}, limit=${limit}`);
  
  // Calculate pagination
  const skip = (page - 1) * limit;
  
  // Initialize results object
  const results: any = {
    posts: [],
    articles: [],
    projects: []
  };
  
  // Get total counts for pagination
  const totalCounts: any = {};
  
  // Process each content type if requested
  const promises = [];
  
  if (contentTypes.includes('posts')) {
    promises.push(
      (async () => {
        // Get liked post IDs
        const likedPosts = await prisma.likes.findMany({
          where: {
            user_id: userId,
            entity_type: 'post'
          },
          select: {
            entity_id: true
          }
        });
        
        const postIds = likedPosts.map(like => like.entity_id);
        
        // Get total count
        totalCounts.posts = postIds.length;
        
        // Skip if no liked posts
        if (postIds.length === 0) {
          results.posts = [];
          return;
        }
        
        // Get post data with pagination
        const posts = await prisma.posts.findMany({
          where: {
            id: { in: postIds }
          },
          include: {
            users: {
              select: {
                id: true,
                username: true,
                avatar_url: true
              }
            }
          },
          orderBy: {
            created_at: 'desc'
          },
          skip,
          take: limit
        });
        
        results.posts = posts;
      })()
    );
  }
  
  if (contentTypes.includes('articles')) {
    promises.push(
      (async () => {
        // Get liked article IDs
        const likedArticles = await prisma.likes.findMany({
          where: {
            user_id: userId,
            entity_type: 'article'
          },
          select: {
            entity_id: true
          }
        });
        
        const articleIds = likedArticles.map(like => like.entity_id);
        
        // Get total count
        totalCounts.articles = articleIds.length;
        
        // Skip if no liked articles
        if (articleIds.length === 0) {
          results.articles = [];
          return;
        }
        
        // Get article data with pagination
        const articles = await prisma.articles.findMany({
          where: {
            id: { in: articleIds }
          },
          include: {
            users: {
              select: {
                id: true,
                username: true,
                avatar_url: true
              }
            }
          },
          orderBy: {
            created_at: 'desc'
          },
          skip,
          take: limit
        });
        
        results.articles = articles;
      })()
    );
  }
  
  if (contentTypes.includes('projects')) {
    promises.push(
      (async () => {
        // Get liked project IDs
        const likedProjects = await prisma.likes.findMany({
          where: {
            user_id: userId,
            entity_type: 'project'
          },
          select: {
            entity_id: true
          }
        });
        
        const projectIds = likedProjects.map(like => like.entity_id);
        
        // Get total count
        totalCounts.projects = projectIds.length;
        
        // Skip if no liked projects
        if (projectIds.length === 0) {
          results.projects = [];
          return;
        }
        
        // Get project data with pagination
        const projects = await prisma.projects.findMany({
          where: {
            id: { in: projectIds }
          },
          include: {
            users: {
              select: {
                id: true,
                username: true,
                avatar_url: true
              }
            }
          },
          orderBy: {
            created_at: 'desc'
          },
          skip,
          take: limit
        });
        
        results.projects = projects;
      })()
    );
  }
  
  // Wait for all queries to complete
  await Promise.all(promises);
  
  // Calculate total items and pages
  const totalItems = Object.values(totalCounts).reduce((sum: number, count: number) => sum + count, 0);
  const totalPages = Math.ceil(totalItems / limit) || 1;
  
  console.log(`[USER SERVICE] Found ${totalItems} liked items across ${Object.keys(totalCounts).length} content types`);
  
  return {
    results,
    page,
    totalPages,
    totalItems
  };
};

/**
 * Get user interactions (likes, follows, watches) with filtering
 */
export const getUserInteractions = async (
  userId: string,
  contentTypes: string[],
  interactionTypes: string[],
  page: number,
  limit: number
) => {
  console.log(`[USER SERVICE] Getting interactions for user ${userId}`);
  console.log(`[USER SERVICE] Content types: ${contentTypes.join(', ')}`);
  console.log(`[USER SERVICE] Interaction types: ${interactionTypes.join(', ')}`);
  
  // Initialize results and counts
  const results: any = {
    users: [],
    projects: [],
    posts: [],
    articles: []
  };
  
  const counts: any = {
    users: 0,
    projects: 0,
    posts: 0,
    articles: 0
  };
  
  // Calculate pagination
  const skip = (page - 1) * limit;
  
  // Process each interaction type if requested
  const promises = [];
  
  // Process likes if requested
  if (interactionTypes.includes('likes')) {
    if (contentTypes.includes('users')) {
      promises.push(
        (async () => {
          // Get liked user IDs
          const likedUsers = await prisma.likes.findMany({
            where: {
              user_id: userId,
              entity_type: 'user'
            },
            select: {
              entity_id: true
            }
          });
          
          const userIds = likedUsers.map(like => like.entity_id);
          
          // Get total count
          counts.users += userIds.length;
          
          // Skip if no liked users
          if (userIds.length === 0) return;
          
          // Get user data with pagination
          const users = await prisma.users.findMany({
            where: {
              id: { in: userIds }
            },
            select: {
              id: true,
              username: true,
              profile_image: true,
              bio: true,
              user_type: true,
              career_title: true,
              followers_count: true
            },
            skip,
            take: limit
          });
          
          // Add interaction flags
          const usersWithFlags = users.map(user => ({
            ...user,
            interactionType: 'like'
          }));
          
          results.users = [...results.users, ...usersWithFlags];
        })()
      );
    }
    
    if (contentTypes.includes('posts')) {
      promises.push(
        (async () => {
          // Get liked post IDs
          const likedPosts = await prisma.likes.findMany({
            where: {
              user_id: userId,
              entity_type: 'post'
            },
            select: {
              entity_id: true
            }
          });
          
          const postIds = likedPosts.map(like => like.entity_id);
          
          // Get total count
          counts.posts += postIds.length;
          
          // Skip if no liked posts
          if (postIds.length === 0) return;
          
          // Get post data with pagination
          const posts = await prisma.posts.findMany({
            where: {
              id: { in: postIds }
            },
            include: {
              users: {
                select: {
                  id: true,
                  username: true,
                  profile_image: true
                }
              }
            },
            orderBy: {
              created_at: 'desc'
            },
            skip,
            take: limit
          });
          
          // Add interaction flags
          const postsWithFlags = posts.map(post => ({
            ...post,
            interactionType: 'like'
          }));
          
          results.posts = [...results.posts, ...postsWithFlags];
        })()
      );
    }
    
    if (contentTypes.includes('articles')) {
      promises.push(
        (async () => {
          // Get liked article IDs
          const likedArticles = await prisma.likes.findMany({
            where: {
              user_id: userId,
              entity_type: 'article'
            },
            select: {
              entity_id: true
            }
          });
          
          const articleIds = likedArticles.map(like => like.entity_id);
          
          // Get total count
          counts.articles += articleIds.length;
          
          // Skip if no liked articles
          if (articleIds.length === 0) return;
          
          // Get article data with pagination
          const articles = await prisma.articles.findMany({
            where: {
              id: { in: articleIds }
            },
            include: {
              users: {
                select: {
                  id: true,
                  username: true,
                  profile_image: true
                }
              }
            },
            orderBy: {
              created_at: 'desc'
            },
            skip,
            take: limit
          });
          
          // Add interaction flags
          const articlesWithFlags = articles.map(article => ({
            ...article,
            interactionType: 'like'
          }));
          
          results.articles = [...results.articles, ...articlesWithFlags];
        })()
      );
    }
    
    if (contentTypes.includes('projects')) {
      promises.push(
        (async () => {
          // Get liked project IDs
          const likedProjects = await prisma.likes.findMany({
            where: {
              user_id: userId,
              entity_type: 'project'
            },
            select: {
              entity_id: true
            }
          });
          
          const projectIds = likedProjects.map(like => like.entity_id);
          
          // Get total count
          counts.projects += projectIds.length;
          
          // Skip if no liked projects
          if (projectIds.length === 0) return;
          
          // Get project data with pagination
          const projects = await prisma.projects.findMany({
            where: {
              id: { in: projectIds }
            },
            include: {
              users: {
                select: {
                  id: true,
                  username: true,
                  profile_image: true
                }
              }
            },
            orderBy: {
              created_at: 'desc'
            },
            skip,
            take: limit
          });
          
          // Add interaction flags
          const projectsWithFlags = projects.map(project => ({
            ...project,
            interactionType: 'like'
          }));
          
          results.projects = [...results.projects, ...projectsWithFlags];
        })()
      );
    }
  }
  
  // Process follows if requested
  if (interactionTypes.includes('follows')) {
    if (contentTypes.includes('users')) {
      promises.push(
        (async () => {
          // Get followed user IDs
          const followedUsers = await prisma.follows.findMany({
            where: {
              user_id: userId,
              entity_type: 'user'
            },
            select: {
              entity_id: true
            }
          });
          
          const userIds = followedUsers.map(follow => follow.entity_id);
          
          // Get total count
          counts.users += userIds.length;
          
          // Skip if no followed users
          if (userIds.length === 0) return;
          
          // Get user data with pagination
          const users = await prisma.users.findMany({
            where: {
              id: { in: userIds }
            },
            select: {
              id: true,
              username: true,
              profile_image: true,
              bio: true,
              user_type: true,
              career_title: true,
              followers_count: true
            },
            skip,
            take: limit
          });
          
          // Add interaction flags
          const usersWithFlags = users.map(user => ({
            ...user,
            interactionType: 'follow'
          }));
          
          results.users = [...results.users, ...usersWithFlags];
        })()
      );
    }
    
    if (contentTypes.includes('projects')) {
      promises.push(
        (async () => {
          // Get followed project IDs
          const followedProjects = await prisma.follows.findMany({
            where: {
              user_id: userId,
              entity_type: 'project'
            },
            select: {
              entity_id: true
            }
          });
          
          const projectIds = followedProjects.map(follow => follow.entity_id);
          
          // Get total count
          counts.projects += projectIds.length;
          
          // Skip if no followed projects
          if (projectIds.length === 0) return;
          
          // Get project data with pagination
          const projects = await prisma.projects.findMany({
            where: {
              id: { in: projectIds }
            },
            include: {
              users: {
                select: {
                  id: true,
                  username: true,
                  profile_image: true
                }
              }
            },
            orderBy: {
              created_at: 'desc'
            },
            skip,
            take: limit
          });
          
          // Add interaction flags
          const projectsWithFlags = projects.map(project => ({
            ...project,
            interactionType: 'follow'
          }));
          
          results.projects = [...results.projects, ...projectsWithFlags];
        })()
      );
    }
    
    if (contentTypes.includes('articles')) {
      promises.push(
        (async () => {
          // Get followed article IDs
          const followedArticles = await prisma.follows.findMany({
            where: {
              user_id: userId,
              entity_type: 'article'
            },
            select: {
              entity_id: true
            }
          });
          
          const articleIds = followedArticles.map(follow => follow.entity_id);
          
          // Get total count
          counts.articles += articleIds.length;
          
          // Skip if no followed articles
          if (articleIds.length === 0) return;
          
          // Get article data with pagination
          const articles = await prisma.articles.findMany({
            where: {
              id: { in: articleIds }
            },
            include: {
              users: {
                select: {
                  id: true,
                  username: true,
                  profile_image: true
                }
              }
            },
            orderBy: {
              created_at: 'desc'
            },
            skip,
            take: limit
          });
          
          // Add interaction flags
          const articlesWithFlags = articles.map(article => ({
            ...article,
            interactionType: 'follow'
          }));
          
          results.articles = [...results.articles, ...articlesWithFlags];
        })()
      );
    }
  }
  
  // Process watches if requested
  if (interactionTypes.includes('watches')) {
    if (contentTypes.includes('projects')) {
      promises.push(
        (async () => {
          // Get watched project IDs
          const watchedProjects = await prisma.watches.findMany({
            where: {
              user_id: userId,
              entity_type: 'project'
            },
            select: {
              entity_id: true
            }
          });
          
          const projectIds = watchedProjects.map(watch => watch.entity_id);
          
          // Get total count
          counts.projects += projectIds.length;
          
          // Skip if no watched projects
          if (projectIds.length === 0) return;
          
          // Get project data with pagination
          const projects = await prisma.projects.findMany({
            where: {
              id: { in: projectIds }
            },
            include: {
              users: {
                select: {
                  id: true,
                  username: true,
                  profile_image: true
                }
              }
            },
            orderBy: {
              created_at: 'desc'
            },
            skip,
            take: limit
          });
          
          // Add interaction flags
          const projectsWithFlags = projects.map(project => ({
            ...project,
            interactionType: 'watch'
          }));
          
          results.projects = [...results.projects, ...projectsWithFlags];
        })()
      );
    }
    
    if (contentTypes.includes('articles')) {
      promises.push(
        (async () => {
          // Get watched article IDs
          const watchedArticles = await prisma.watches.findMany({
            where: {
              user_id: userId,
              entity_type: 'article'
            },
            select: {
              entity_id: true
            }
          });
          
          const articleIds = watchedArticles.map(watch => watch.entity_id);
          
          // Get total count
          counts.articles += articleIds.length;
          
          // Skip if no watched articles
          if (articleIds.length === 0) return;
          
          // Get article data with pagination
          const articles = await prisma.articles.findMany({
            where: {
              id: { in: articleIds }
            },
            include: {
              users: {
                select: {
                  id: true,
                  username: true,
                  profile_image: true
                }
              }
            },
            orderBy: {
              created_at: 'desc'
            },
            skip,
            take: limit
          });
          
          // Add interaction flags
          const articlesWithFlags = articles.map(article => ({
            ...article,
            interactionType: 'watch'
          }));
          
          results.articles = [...results.articles, ...articlesWithFlags];
        })()
      );
    }
  }
  
  // Wait for all queries to complete
  await Promise.all(promises);
  
  // Calculate total items and pages
  const totalItems = Object.values(counts).reduce((sum: number, count: number) => sum + count, 0);
  const totalPages = Math.ceil(totalItems / limit) || 1;
  
  console.log(`[USER SERVICE] Found ${totalItems} interaction items across ${Object.keys(counts).length} content types`);
  
  return {
    results,
    counts,
    page,
    totalPages,
    totalItems
  };
};

// Get user's portfolio (content they created)
export async function getUserPortfolio(userId: string, options: {
  contentTypes: string[];
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}) {
  const { contentTypes, page, limit, sortBy = 'created_at', sortOrder = 'desc' } = options;
  const skip = (page - 1) * limit;
  
  console.log(`[USER SERVICE] Getting portfolio for user ${userId}`);
  console.log(`[USER SERVICE] Content types: ${contentTypes.join(', ')}`);
  console.log(`[USER SERVICE] Sort: ${sortBy} ${sortOrder}`);
  
  // Initialize results object
  const results: any = {
    posts: [],
    articles: [],
    projects: []
  };
  
  // Initialize counts
  let totalCount = 0;
  const counts = {
    posts: 0,
    articles: 0,
    projects: 0
  };
  
  // Process each content type in parallel
  const promises = [];
  
  // Process posts if requested
  if (contentTypes.includes('posts')) {
    promises.push(
      (async () => {
        try {
          // Get posts count
          counts.posts = await prisma.posts.count({
            where: { user_id: userId }
          });
          
          // Add to total count
          totalCount += counts.posts;
          
          console.log(`[USER SERVICE] Found ${counts.posts} posts for user ${userId}`);
          
          // Get posts data with pagination
          if (contentTypes.length === 1 || page === 1) {
            const posts = await prisma.posts.findMany({
              where: { user_id: userId },
              skip: contentTypes.length === 1 ? skip : 0,
              take: contentTypes.length === 1 ? limit : Math.min(limit, 10),
              orderBy: { [sortBy]: sortOrder },
              include: {
                users: {
                  select: {
                    id: true,
                    username: true,
                    profile_image: true
                  }
                }
              }
            });
            
            console.log(`[USER SERVICE] Retrieved ${posts.length} posts`);
            
            // Transform posts for API response
            results.posts = posts.map(post => ({
              id: post.id,
              title: post.title,
              content: post.content,
              created_at: post.created_at,
              likes_count: post.likes_count || 0,
              follows_count: post.follows_count || 0,
              watches_count: post.watches_count || 0,
              user: {
                id: post.users.id,
                username: post.users.username,
                profile_image: post.users.profile_image
              }
            }));
          }
        } catch (error) {
          console.error(`[USER SERVICE] Error getting posts: ${error}`);
        }
      })()
    );
  }
  
  // Process articles if requested
  if (contentTypes.includes('articles')) {
    promises.push(
      (async () => {
        // Get articles count
        counts.articles = await prisma.articles.count({
          where: { user_id: userId }
        });
        
        // Add to total count
        totalCount += counts.articles;
        
        // Get articles data with pagination
        if (contentTypes.length === 1 || page === 1) {
          const articles = await prisma.articles.findMany({
            where: { user_id: userId },
            skip: contentTypes.length === 1 ? skip : 0,
            take: contentTypes.length === 1 ? limit : Math.min(limit, 10),
            orderBy: { [sortBy]: sortOrder },
            include: {
              users: {
                select: {
                  id: true,
                  username: true,
                  profile_image: true
                }
              },
              article_sections: true
            }
          });
          
          // Transform articles for API response
          results.articles = articles.map(article => ({
            id: article.id,
            title: article.title,
            sections: article.article_sections,
            created_at: article.created_at,
            likes_count: article.likes_count || 0,
            follows_count: article.follows_count || 0,
            watches_count: article.watches_count || 0,
            user: {
              id: article.users.id,
              username: article.users.username,
              profile_image: article.users.profile_image
            }
          }));
        }
      })()
    );
  }
  
  // Process projects if requested
  if (contentTypes.includes('projects')) {
    promises.push(
      (async () => {
        // Get projects count
        counts.projects = await prisma.projects.count({
          where: { user_id: userId }
        });
        
        // Add to total count
        totalCount += counts.projects;
        
        // Get projects data with pagination
        if (contentTypes.length === 1 || page === 1) {
          const projects = await prisma.projects.findMany({
            where: { user_id: userId },
            skip: contentTypes.length === 1 ? skip : 0,
            take: contentTypes.length === 1 ? limit : Math.min(limit, 10),
            orderBy: { [sortBy]: sortOrder },
            include: {
              users: {
                select: {
                  id: true,
                  username: true,
                  profile_image: true
                }
              }
            }
          });
          
          // Transform projects for API response
          results.projects = projects.map(project => ({
            id: project.id,
            title: project.title,
            description: project.description,
            created_at: project.created_at,
            likes_count: project.likes_count || 0,
            follows_count: project.follows_count || 0,
            watches_count: project.watches_count || 0,
            user: {
              id: project.users.id,
              username: project.users.username,
              profile_image: project.users.profile_image
            }
          }));
        }
      })()
    );
  }
  
  // Wait for all queries to complete
  await Promise.all(promises);
  
  // Calculate total pages
  const totalPages = Math.ceil(totalCount / limit) || 1;
  
  console.log(`[USER SERVICE] Portfolio results: posts=${results.posts.length}, articles=${results.articles.length}, projects=${results.projects.length}`);
  console.log(`[USER SERVICE] Total items: ${totalCount}, Total pages: ${totalPages}`);
  
  return {
    results,
    counts,
    page,
    limit,
    totalPages
  };
} 