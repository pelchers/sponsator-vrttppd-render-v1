import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const testimonialService = {
  async createTestimonial(data: any) {
    try {
      const testimonial = await prisma.testimonials.create({
        data,
        include: {
          users: {
            select: {
              id: true,
              username: true,
              profile_image_url: true,
              profile_image_upload: true,
              profile_image_display: true
            }
          }
        }
      });
      
      return this.mapTestimonialToFrontend(testimonial);
    } catch (error) {
      console.error('Error creating testimonial:', error);
      throw error;
    }
  },
  
  async getTestimonials({ featured = false, limit, showAll = false }: { 
    featured?: boolean, 
    limit?: number,
    showAll?: boolean
  }) {
    try {
      const testimonials = await prisma.testimonials.findMany({
        where: {
          ...(showAll ? {} : { is_approved: true }),
          ...(featured && { is_featured: true })
        },
        take: limit,
        orderBy: {
          created_at: 'desc'
        },
        include: {
          users: {
            select: {
              id: true,
              username: true,
              profile_image_url: true,
              profile_image_upload: true,
              profile_image_display: true
            }
          }
        }
      });
      
      return testimonials.map(this.mapTestimonialToFrontend);
    } catch (error) {
      console.error('Error fetching testimonials:', error);
      throw error;
    }
  },
  
  async getTestimonialById(id: string) {
    try {
      const testimonial = await prisma.testimonials.findUnique({
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
          }
        }
      });
      
      if (!testimonial) return null;
      
      return this.mapTestimonialToFrontend(testimonial);
    } catch (error) {
      console.error('Error fetching testimonial:', error);
      throw error;
    }
  },
  
  async updateTestimonial(id: string, data: any) {
    try {
      const testimonial = await prisma.testimonials.update({
        where: { id },
        data,
        include: {
          users: {
            select: {
              id: true,
              username: true,
              profile_image_url: true,
              profile_image_upload: true,
              profile_image_display: true
            }
          }
        }
      });
      
      return this.mapTestimonialToFrontend(testimonial);
    } catch (error) {
      console.error('Error updating testimonial:', error);
      throw error;
    }
  },
  
  async deleteTestimonial(id: string) {
    try {
      await prisma.testimonials.delete({
        where: { id }
      });
      
      return true;
    } catch (error) {
      console.error('Error deleting testimonial:', error);
      throw error;
    }
  },
  
  mapTestimonialToFrontend(testimonial: any) {
    return {
      id: testimonial.id,
      user_id: testimonial.user_id,
      title: testimonial.title,
      content: testimonial.content,
      rating: testimonial.rating,
      company: testimonial.company,
      position: testimonial.position,
      created_at: testimonial.created_at.toISOString(),
      is_approved: testimonial.is_approved,
      is_featured: testimonial.is_featured,
      user: testimonial.users ? {
        id: testimonial.users.id,
        username: testimonial.users.username,
        profile_image_url: testimonial.users.profile_image_url,
        profile_image_upload: testimonial.users.profile_image_upload,
        profile_image_display: testimonial.users.profile_image_display
      } : undefined
    };
  }
}; 