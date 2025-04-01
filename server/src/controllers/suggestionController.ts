import { Request, Response } from 'express';
import { suggestionService } from '../services/suggestionService';

interface AuthRequest extends Request {
  user?: {
    id: string;
    // ... other user fields
  };
}

export const suggestionController = {
  async createSuggestion(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
      }
      
      const suggestionData = {
        ...req.body,
        user_id: userId
      };
      
      const suggestion = await suggestionService.createSuggestion(suggestionData);
      
      res.status(201).json(suggestion);
    } catch (error) {
      console.error('Error creating suggestion:', error);
      res.status(500).json({ error: 'Failed to create suggestion' });
    }
  },
  
  async getSuggestions(req: Request, res: Response) {
    try {
      const status = req.query.status as string | undefined;
      const category = req.query.category as string | undefined;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const showAll = req.query.showAll === 'true';
      
      const suggestions = await suggestionService.getSuggestions({ 
        status, 
        category, 
        limit,
        showAll
      });
      
      res.json(suggestions);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      res.status(500).json({ error: 'Failed to fetch suggestions' });
    }
  },
  
  async getSuggestionById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      const suggestion = await suggestionService.getSuggestionById(id);
      
      if (!suggestion) {
        return res.status(404).json({ error: 'Suggestion not found' });
      }
      
      res.json(suggestion);
    } catch (error) {
      console.error('Error fetching suggestion:', error);
      res.status(500).json({ error: 'Failed to fetch suggestion' });
    }
  },
  
  async updateSuggestion(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
      }
      
      // Check if user is admin (for admin_comments)
      const isAdmin = await suggestionService.isUserAdmin(userId);
      
      // If not admin, check if user owns the suggestion
      if (!isAdmin) {
        const suggestion = await suggestionService.getSuggestionById(id);
        
        if (!suggestion) {
          return res.status(404).json({ error: 'Suggestion not found' });
        }
        
        if (suggestion.user_id !== userId) {
          return res.status(403).json({ error: 'Not authorized to update this suggestion' });
        }
        
        // Non-admins can't update admin_comments
        if (req.body.admin_comments !== undefined) {
          delete req.body.admin_comments;
        }
        
        // Non-admins can't update status
        if (req.body.status !== undefined) {
          delete req.body.status;
        }
      }
      
      const updatedSuggestion = await suggestionService.updateSuggestion(id, req.body);
      
      res.json(updatedSuggestion);
    } catch (error) {
      console.error('Error updating suggestion:', error);
      res.status(500).json({ error: 'Failed to update suggestion' });
    }
  },
  
  async deleteSuggestion(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
      }
      
      // Check if user is admin
      const isAdmin = await suggestionService.isUserAdmin(userId);
      
      // If not admin, check if user owns the suggestion
      if (!isAdmin) {
        const suggestion = await suggestionService.getSuggestionById(id);
        
        if (!suggestion) {
          return res.status(404).json({ error: 'Suggestion not found' });
        }
        
        if (suggestion.user_id !== userId) {
          return res.status(403).json({ error: 'Not authorized to delete this suggestion' });
        }
      }
      
      await suggestionService.deleteSuggestion(id);
      
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting suggestion:', error);
      res.status(500).json({ error: 'Failed to delete suggestion' });
    }
  },
  
  async approveSuggestion(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
      }
      
      // Check if user is admin
      const isAdmin = await suggestionService.isUserAdmin(userId);
      
      if (!isAdmin) {
        return res.status(403).json({ error: 'Only admins can approve suggestions' });
      }
      
      const updatedSuggestion = await suggestionService.updateSuggestion(id, {
        status: 'approved',
        ...req.body
      });
      
      res.json(updatedSuggestion);
    } catch (error) {
      console.error('Error approving suggestion:', error);
      res.status(500).json({ error: 'Failed to approve suggestion' });
    }
  },
  
  async featureSuggestion(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
      }
      
      // Check if user is admin
      const isAdmin = await suggestionService.isUserAdmin(userId);
      
      if (!isAdmin) {
        return res.status(403).json({ error: 'Only admins can feature suggestions' });
      }
      
      const updatedSuggestion = await suggestionService.updateSuggestion(id, {
        status: 'featured',
        ...req.body
      });
      
      res.json(updatedSuggestion);
    } catch (error) {
      console.error('Error featuring suggestion:', error);
      res.status(500).json({ error: 'Failed to feature suggestion' });
    }
  }
}; 