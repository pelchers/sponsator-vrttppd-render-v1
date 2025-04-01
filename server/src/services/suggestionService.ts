import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const suggestionService = {
  async createSuggestion(data: any) {
    try {
      const suggestion = await prisma.suggestions.create({
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
      
      return this.mapSuggestionToFrontend(suggestion);
    } catch (error) {
      console.error('Error creating suggestion:', error);
      throw error;
    }
  },
  
  async getSuggestions({ 
    status, 
    category, 
    limit,
    showAll = false
  }: { 
    status?: string, 
    category?: string, 
    limit?: number,
    showAll?: boolean
  }) {
    try {
      const suggestions = await prisma.suggestions.findMany({
        where: {
          ...(status && { status }),
          ...(category && { category }),
          ...(!showAll && { is_public: true })
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
      
      return suggestions.map(this.mapSuggestionToFrontend);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      throw error;
    }
  },
  
  async getSuggestionById(id: string) {
    try {
      const suggestion = await prisma.suggestions.findUnique({
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
      
      if (!suggestion) return null;
      
      return this.mapSuggestionToFrontend(suggestion);
    } catch (error) {
      console.error('Error fetching suggestion:', error);
      throw error;
    }
  },
  
  async updateSuggestion(id: string, data: any) {
    try {
      const updatedSuggestion = await prisma.suggestions.update({
        where: { id },
        data: {
          ...data,
          updated_at: new Date()
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
      
      return this.mapSuggestionToFrontend(updatedSuggestion);
    } catch (error) {
      console.error('Error updating suggestion:', error);
      throw error;
    }
  },
  
  async deleteSuggestion(id: string) {
    try {
      await prisma.suggestions.delete({
        where: { id }
      });
      
      return { success: true };
    } catch (error) {
      console.error('Error deleting suggestion:', error);
      throw error;
    }
  },
  
  async isUserAdmin(userId: string) {
    try {
      const user = await prisma.users.findUnique({
        where: { id: userId },
        select: { user_type: true }
      });
      
      return user?.user_type === 'admin';
    } catch (error) {
      console.error('Error checking if user is admin:', error);
      return false;
    }
  },
  
  mapSuggestionToFrontend(suggestion: any) {
    return {
      id: suggestion.id,
      user_id: suggestion.user_id,
      title: suggestion.title,
      description: suggestion.description,
      category: suggestion.category,
      priority: suggestion.priority,
      status: suggestion.status,
      admin_comments: suggestion.admin_comments,
      created_at: suggestion.created_at.toISOString(),
      updated_at: suggestion.updated_at.toISOString(),
      is_public: suggestion.is_public,
      user: suggestion.users ? {
        id: suggestion.users.id,
        username: suggestion.users.username,
        profile_image_url: suggestion.users.profile_image_url,
        profile_image_upload: suggestion.users.profile_image_upload,
        profile_image_display: suggestion.users.profile_image_display
      } : undefined
    };
  }
}; 