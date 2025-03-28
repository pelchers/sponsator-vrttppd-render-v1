import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

export const articleService = {
  // Get all articles with pagination
  getArticles: async (page: number, limit: number) => {
    const skip = (page - 1) * limit;
    
    const [articles, total] = await Promise.all([
      prisma.articles.findMany({
        skip,
        take: limit,
        orderBy: { created_at: 'desc' },
        include: {
          users: {
            select: {
              id: true,
              username: true,
              profile_image_url: true,
              profile_image_upload: true,
              profile_image_display: true
            }
          },
          article_sections: true
        }
      }),
      prisma.articles.count()
    ]);
    
    return {
      data: articles.map(transformDbToApi),
      total,
      page,
      limit
    };
  },
  
  // Get a single article by ID
  getArticle: async (id: string) => {
    const article = await prisma.articles.findUnique({
      where: { id },
      include: {
        users: {
          select: {
            id: true,
            username: true,
            profile_image_url: true,
            profile_image_upload: true,
            profile_image_display: true
          }
        },
        article_sections: {
          orderBy: {
            order: 'asc'
          }
        }
      }
    });
    
    if (!article) return null;
    
    return transformDbToApi(article);
  },
  
  // Create a new article
  createArticle: async (userId: string, articleData: any) => {
    const { title, tags, citations, contributors, related_media, sections } = articleData;
    
    // Create the article
    const article = await prisma.articles.create({
      data: {
        user_id: userId,
        title: title || 'Untitled Article',
        tags: tags || [],
        citations: citations || [],
        contributors: contributors || [],
        related_media: related_media || [],
        created_at: new Date(),
        updated_at: new Date()
      }
    });
    
    // Create the article sections
    if (sections && sections.length > 0) {
      await createSections(article.id, sections);
    }
    
    // Fetch the complete article with sections
    const completeArticle = await prisma.articles.findUnique({
      where: { id: article.id },
      include: {
        users: {
          select: {
            id: true,
            username: true,
            profile_image_url: true,
            profile_image_upload: true,
            profile_image_display: true
          }
        },
        article_sections: true
      }
    });
    
    return transformDbToApi(completeArticle);
  },
  
  // Update an existing article
  updateArticle: async (id: string, userId: string, articleData: any) => {
    try {
      // Check if the article exists and belongs to the user
      const existingArticle = await prisma.articles.findFirst({
        where: {
          id,
          user_id: userId
        }
      });
      
      if (!existingArticle) return null;

      const { 
        article_image_url,
        article_image_upload,
        article_image_display,
        sections,
        ...otherData 
      } = articleData;

      // First update the basic article data
      await prisma.articles.update({
        where: { id },
        data: {
          ...otherData,
          article_image_url: article_image_url || '',
          article_image_upload: article_image_upload || '',
          article_image_display: article_image_display || 'url',
          updated_at: new Date()
        }
      });

      // Then handle sections if they exist
      if (sections) {
        // Delete existing sections
        await prisma.article_sections.deleteMany({
          where: { article_id: id }
        });

        // Create new sections
        if (sections.length > 0) {
          await prisma.$transaction(
            sections.map((section, index) => 
              prisma.article_sections.create({
                data: {
                  article_id: id,
                  type: section.type || 'full-width-text',
                  title: section.title || '',
                  subtitle: section.subtitle || '',
                  text: section.text || '',
                  media_url: section.mediaUrl || '',
                  media_subtext: section.mediaSubtext || '',
                  order: section.order ?? index
                }
              })
            )
          );
        }
      }

      // Finally, fetch the complete updated article with sections
      const completeArticle = await prisma.articles.findUnique({
        where: { id },
        include: {
          users: {
            select: {
              id: true,
              username: true,
              profile_image_url: true,
              profile_image_upload: true,
              profile_image_display: true
            }
          },
          article_sections: {
            orderBy: {
              order: 'asc'
            }
          }
        }
      });

      return transformDbToApi(completeArticle);
    } catch (error) {
      console.error('Error updating article:', error);
      throw error;
    }
  },
  
  // Delete an article
  deleteArticle: async (id: string, userId: string) => {
    // Check if the article exists and belongs to the user
    const existingArticle = await prisma.articles.findFirst({
      where: {
        id,
        user_id: userId
      }
    });
    
    if (!existingArticle) return false;
    
    // Delete the article (cascade will delete sections)
    await prisma.articles.delete({
      where: { id }
    });
    
    return true;
  },
  
  // Upload media for an article section
  uploadArticleMedia: async (id: string, userId: string, sectionIndex: number, file: Express.Multer.File) => {
    // Check if the article exists and belongs to the user
    const existingArticle = await prisma.articles.findFirst({
      where: {
        id,
        user_id: userId
      },
      include: {
        article_sections: true
      }
    });
    
    if (!existingArticle) throw new Error('Article not found or you do not have permission');
    
    // Check if the section exists
    if (!existingArticle.article_sections[sectionIndex]) {
      throw new Error('Section not found');
    }
    
    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(__dirname, '../../uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    
    // Generate a unique filename
    const filename = `${Date.now()}-${file.originalname}`;
    const filepath = path.join(uploadsDir, filename);
    
    // Write the file
    fs.writeFileSync(filepath, file.buffer);
    
    // Update the section with the media URL
    const mediaUrl = `/uploads/${filename}`;
    await prisma.article_sections.update({
      where: { id: existingArticle.article_sections[sectionIndex].id },
      data: { media_url: mediaUrl }
    });
    
    return mediaUrl;
  },

  async uploadArticleCoverImage(id: string, file: Express.Multer.File) {
    try {
      // Store the path relative to the uploads directory
      const relativePath = `articles/${file.filename}`;
      
      console.log('Uploading article cover image:', relativePath);
      
      const updatedArticle = await prisma.articles.update({
        where: { id },
        data: {
          article_image_upload: relativePath,
          article_image_url: '',
          article_image_display: 'upload',
          updated_at: new Date()
        }
      });
      
      // Log the updated article data
      console.log('Updated article image data:', {
        article_image_upload: updatedArticle.article_image_upload,
        article_image_display: updatedArticle.article_image_display
      });
      
      // Return the data in the same format as the frontend expects
      return {
        path: relativePath,
        article: {
          ...updatedArticle,
          article_image: `/uploads/${relativePath}`,
          article_image_url: '',
          article_image_upload: relativePath,
          article_image_display: 'upload'
        }
      };
    } catch (error) {
      console.error('Error uploading article cover image:', error);
      throw error;
    }
  },

  // Add this helper function to map article data for frontend
  mapArticleToFrontend(article: any) {
    return {
      ...article,
      article_image: article.article_image_display === 'url' 
        ? article.article_image_url
        : article.article_image_upload 
          ? `/uploads/${article.article_image_upload}`
          : null,
      // Keep original fields
      article_image_url: article.article_image_url || '',
      article_image_upload: article.article_image_upload || '',
      article_image_display: article.article_image_display || 'url'
    };
  }
};

// Helper function to transform database model to API response
function transformDbToApi(article: any) {
  if (!article) return null;
  
  return {
    ...article,
    // Add image fields to the response
    article_image: article.article_image_display === 'url' 
      ? article.article_image_url
      : article.article_image_upload 
        ? `/uploads/${article.article_image_upload}`
        : null,
    article_image_url: article.article_image_url || '',
    article_image_upload: article.article_image_upload || '',
    article_image_display: article.article_image_display || 'url',
    // Transform sections to the expected format
    sections: article.article_sections?.map((section: any) => ({
      id: section.id,
      type: section.type || 'full-width-text',
      title: section.title || '',
      subtitle: section.subtitle || '',
      text: section.text || '',
      mediaUrl: section.media_url || '',
      mediaSubtext: section.media_subtext || '',
      order: section.order ?? 0
    })) || []
  };
}

// When creating article sections
const createSections = async (articleId, sections) => {
  const sectionPromises = sections.map((section, index) => {
    return prisma.article_sections.create({
      data: {
        article_id: articleId,
        type: section.type,
        title: section.title,
        subtitle: section.subtitle,
        text: section.text,
        media_url: section.mediaUrl,
        media_subtext: section.mediaSubtext,
        order: section.order !== undefined ? section.order : index
      }
    });
  });
  
  return Promise.all(sectionPromises);
}; 