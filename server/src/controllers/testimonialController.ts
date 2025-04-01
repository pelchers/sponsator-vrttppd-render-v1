import { Request, Response } from 'express';
import { testimonialService } from '../services/testimonialService';

interface AuthRequest extends Request {
  user?: {
    id: string;
    // ... other user fields
  };
}

export const testimonialController = {
  async createTestimonial(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
      }
      
      console.log('Creating testimonial with data:', req.body);
      console.log('User ID:', userId);
      
      const testimonialData = {
        ...req.body,
        user_id: userId
      };
      
      const testimonial = await testimonialService.createTestimonial(testimonialData);
      
      console.log('Testimonial created:', testimonial.id);
      
      res.status(201).json(testimonial);
    } catch (error) {
      console.error('Error creating testimonial:', error);
      res.status(500).json({ error: 'Failed to create testimonial' });
    }
  },
  
  async getTestimonials(req: Request, res: Response) {
    try {
      const featured = req.query.featured === 'true';
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const showAll = req.query.showAll === 'true';
      
      console.log('Testimonial query params:', { featured, limit, showAll });
      
      const testimonials = await testimonialService.getTestimonials({ featured, limit, showAll });
      
      console.log('Testimonials found:', testimonials.length);
      
      res.json(testimonials);
    } catch (error) {
      console.error('Error fetching testimonials:', error);
      res.status(500).json({ error: 'Failed to fetch testimonials' });
    }
  },
  
  async getTestimonialById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      const testimonial = await testimonialService.getTestimonialById(id);
      
      if (!testimonial) {
        return res.status(404).json({ error: 'Testimonial not found' });
      }
      
      res.json(testimonial);
    } catch (error) {
      console.error('Error fetching testimonial:', error);
      res.status(500).json({ error: 'Failed to fetch testimonial' });
    }
  },
  
  async updateTestimonial(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
      }
      
      const testimonial = await testimonialService.getTestimonialById(id);
      
      if (!testimonial) {
        return res.status(404).json({ error: 'Testimonial not found' });
      }
      
      if (testimonial.user_id !== userId) {
        return res.status(403).json({ error: 'Not authorized to update this testimonial' });
      }
      
      const updatedTestimonial = await testimonialService.updateTestimonial(id, req.body);
      
      res.json(updatedTestimonial);
    } catch (error) {
      console.error('Error updating testimonial:', error);
      res.status(500).json({ error: 'Failed to update testimonial' });
    }
  },
  
  async deleteTestimonial(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
      }
      
      const testimonial = await testimonialService.getTestimonialById(id);
      
      if (!testimonial) {
        return res.status(404).json({ error: 'Testimonial not found' });
      }
      
      if (testimonial.user_id !== userId) {
        return res.status(403).json({ error: 'Not authorized to delete this testimonial' });
      }
      
      await testimonialService.deleteTestimonial(id);
      
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting testimonial:', error);
      res.status(500).json({ error: 'Failed to delete testimonial' });
    }
  },
  
  // Admin endpoints
  async approveTestimonial(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      
      // Here you would add admin role check
      
      const testimonial = await testimonialService.updateTestimonial(id, { is_approved: true });
      
      res.json(testimonial);
    } catch (error) {
      console.error('Error approving testimonial:', error);
      res.status(500).json({ error: 'Failed to approve testimonial' });
    }
  },
  
  async featureTestimonial(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      
      // Here you would add admin role check
      
      const testimonial = await testimonialService.updateTestimonial(id, { is_featured: true });
      
      res.json(testimonial);
    } catch (error) {
      console.error('Error featuring testimonial:', error);
      res.status(500).json({ error: 'Failed to feature testimonial' });
    }
  }
}; 