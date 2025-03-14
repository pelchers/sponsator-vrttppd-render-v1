import { Request, Response } from 'express';
import { articleService } from '../services/articleService';

export const articleController = {
  // Get all articles with pagination
  getArticles: async (req: Request, res: Response) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      
      const articles = await articleService.getArticles(page, limit);
      
      res.status(200).json(articles);
    } catch (error) {
      console.error('Error in getArticles controller:', error);
      res.status(500).json({ error: 'Failed to fetch articles' });
    }
  },
  
  // Get a single article by ID
  getArticle: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const article = await articleService.getArticle(id);
      
      if (!article) {
        return res.status(404).json({ error: 'Article not found' });
      }
      
      res.status(200).json(article);
    } catch (error) {
      console.error(`Error in getArticle controller for ID ${req.params.id}:`, error);
      res.status(500).json({ error: 'Failed to fetch article' });
    }
  },
  
  // Create a new article
  createArticle: async (req: Request, res: Response) => {
    try {
      const userId = req.user.id;
      const articleData = req.body;
      
      // Make sure sections have order values if not provided
      if (req.body.sections) {
        req.body.sections = req.body.sections.map((section, index) => ({
          ...section,
          order: section.order !== undefined ? section.order : index
        }));
      }
      
      const article = await articleService.createArticle(userId, articleData);
      
      res.status(201).json(article);
    } catch (error) {
      console.error('Error in createArticle controller:', error);
      res.status(500).json({ error: 'Failed to create article' });
    }
  },
  
  // Update an existing article
  updateArticle: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const articleData = req.body;
      
      // Make sure sections have order values if not provided
      if (req.body.sections) {
        req.body.sections = req.body.sections.map((section, index) => ({
          ...section,
          order: section.order !== undefined ? section.order : index
        }));
      }
      
      const article = await articleService.updateArticle(id, userId, articleData);
      
      if (!article) {
        return res.status(404).json({ error: 'Article not found or you do not have permission to update it' });
      }
      
      res.status(200).json(article);
    } catch (error) {
      console.error(`Error in updateArticle controller for ID ${req.params.id}:`, error);
      res.status(500).json({ error: 'Failed to update article' });
    }
  },
  
  // Delete an article
  deleteArticle: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      
      const success = await articleService.deleteArticle(id, userId);
      
      if (!success) {
        return res.status(404).json({ error: 'Article not found or you do not have permission to delete it' });
      }
      
      res.status(200).json({ message: 'Article deleted successfully' });
    } catch (error) {
      console.error(`Error in deleteArticle controller for ID ${req.params.id}:`, error);
      res.status(500).json({ error: 'Failed to delete article' });
    }
  },
  
  // Upload media for an article section
  uploadArticleMedia: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const sectionIndex = parseInt(req.body.sectionIndex);
      const file = req.file;
      
      if (!file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }
      
      const mediaUrl = await articleService.uploadArticleMedia(id, userId, sectionIndex, file);
      
      res.status(200).json({ mediaUrl });
    } catch (error) {
      console.error(`Error in uploadArticleMedia controller for ID ${req.params.id}:`, error);
      res.status(500).json({ error: 'Failed to upload media' });
    }
  }
}; 