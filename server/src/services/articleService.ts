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
        article_sections: true
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
      await Promise.all(sections.map((section: any) => 
        prisma.article_sections.create({
          data: {
            article_id: article.id,
            type: section.type,
            title: section.title,
            subtitle: section.subtitle,
            text: section.text,
            media_url: section.mediaUrl,
            media_subtext: section.mediaSubtext
          }
        })
      ));
    }
    
    // Fetch the complete article with sections
    const completeArticle = await prisma.articles.findUnique({
      where: { id: article.id },
      include: {
        article_sections: true
      }
    });
    
    return transformDbToApi(completeArticle);
  },
  
  // Update an existing article
  updateArticle: async (id: string, userId: string, articleData: any) => {
    // Check if the article exists and belongs to the user
    const existingArticle = await prisma.articles.findFirst({
      where: {
        id,
        user_id: userId
      }
    });
    
    if (!existingArticle) return null;
    
    const { title, tags, citations, contributors, related_media, sections } = articleData;
    
    // Update the article
    await prisma.articles.update({
      where: { id },
      data: {
        title: title || 'Untitled Article',
        tags: tags || [],
        citations: citations || [],
        contributors: contributors || [],
        related_media: related_media || [],
        updated_at: new Date()
      }
    });
    
    // Delete existing sections
    await prisma.article_sections.deleteMany({
      where: { article_id: id }
    });
    
    // Create new sections
    if (sections && sections.length > 0) {
      await Promise.all(sections.map((section: any) => 
        prisma.article_sections.create({
          data: {
            article_id: id,
            type: section.type,
            title: section.title,
            subtitle: section.subtitle,
            text: section.text,
            media_url: section.mediaUrl,
            media_subtext: section.mediaSubtext
          }
        })
      ));
    }
    
    // Fetch the updated article with sections
    const updatedArticle = await prisma.articles.findUnique({
      where: { id },
      include: {
        article_sections: true
      }
    });
    
    return transformDbToApi(updatedArticle);
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
  }
};

// Helper function to transform database model to API response
function transformDbToApi(article: any) {
  if (!article) return null;
  
  return {
    id: article.id,
    user_id: article.user_id,
    title: article.title,
    tags: article.tags,
    citations: article.citations,
    contributors: article.contributors,
    related_media: article.related_media,
    created_at: article.created_at,
    updated_at: article.updated_at,
    sections: article.article_sections?.map((section: any) => ({
      id: section.id,
      type: section.type,
      title: section.title,
      subtitle: section.subtitle,
      text: section.text,
      mediaUrl: section.media_url,
      mediaSubtext: section.media_subtext
    })) || []
  };
} 