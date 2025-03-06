import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

// Format projects for frontend
function formatProject(project: any) {
  // Transform the project data into the expected format
  const formatted = {
    ...project,
    // Transform seeking fields
    seeking: {
      creator: project.seeking_creator || false,
      brand: project.seeking_brand || false,
      freelancer: project.seeking_freelancer || false,
      contractor: project.seeking_contractor || false,
    },
    
    // Transform notification preferences
    notification_preferences: {
      email: project.notification_preferences_email || false,
      push: project.notification_preferences_push || false,
      digest: project.notification_preferences_digest || false,
    },
    
    // Transform social links
    social_links: {
      youtube: project.social_links_youtube || '',
      instagram: project.social_links_instagram || '',
      github: project.social_links_github || '',
      twitter: project.social_links_twitter || '',
      linkedin: project.social_links_linkedin || '',
    }
  };

  return formatted;
}

// Format input data for database
function formatProjectForDB(data: any) {
  const { seeking, notification_preferences, social_links, ...rest } = data;
  
  // Flatten seeking object to individual fields
  const seekingFields = seeking ? {
    seeking_creator: seeking.creator || false,
    seeking_brand: seeking.brand || false,
    seeking_freelancer: seeking.freelancer || false,
    seeking_contractor: seeking.contractor || false,
  } : {};
  
  // Flatten notification preferences
  const notificationFields = notification_preferences ? {
    notification_preferences_email: notification_preferences.email || false,
    notification_preferences_push: notification_preferences.push || false,
    notification_preferences_digest: notification_preferences.digest || false,
  } : {};
  
  // Flatten social links
  const socialFields = social_links ? {
    social_links_youtube: social_links.youtube || '',
    social_links_instagram: social_links.instagram || '',
    social_links_github: social_links.github || '',
    social_links_twitter: social_links.twitter || '',
    social_links_linkedin: social_links.linkedin || '',
  } : {};
  
  // Handle JSON fields (stringify if they're objects)
  const jsonFields: Record<string, any> = {};
  ['team_members', 'collaborators', 'advisors', 'partners', 'testimonials', 'milestones', 'deliverables'].forEach(field => {
    if (rest[field] && typeof rest[field] === 'object') {
      jsonFields[field] = JSON.stringify(rest[field]);
    }
  });
  
  // Handle array fields (ensure they are arrays)
  const arrayFields: Record<string, any> = {};
  ['project_tags', 'industry_tags', 'technology_tags', 'skills_required', 'expertise_needed', 'target_audience', 'solutions_offered', 'website_links'].forEach(field => {
    if (rest[field]) {
      arrayFields[field] = Array.isArray(rest[field]) ? rest[field] : [rest[field]];
    }
  });
  
  return {
    ...rest,
    ...seekingFields,
    ...notificationFields,
    ...socialFields,
    ...jsonFields,
    ...arrayFields,
  };
}

// Transform form data to database format
function transformFormToDb(data: any) {
  // Extract nested objects
  const { seeking, notification_preferences, social_links, ...baseData } = data;

  // Flatten the data for database
  return {
    ...baseData,
    // Flatten seeking fields
    seeking_creator: seeking?.creator || false,
    seeking_brand: seeking?.brand || false,
    seeking_freelancer: seeking?.freelancer || false,
    seeking_contractor: seeking?.contractor || false,
    
    // Flatten notification preferences
    notification_preferences_email: notification_preferences?.email || false,
    notification_preferences_push: notification_preferences?.push || false,
    notification_preferences_digest: notification_preferences?.digest || false,
    
    // Flatten social links
    social_links_youtube: social_links?.youtube || '',
    social_links_instagram: social_links?.instagram || '',
    social_links_github: social_links?.github || '',
    social_links_twitter: social_links?.twitter || '',
    social_links_linkedin: social_links?.linkedin || '',
  };
}

// Transform database data to API response format
const transformDbToApi = (data: any) => {
  return {
    ...data,
    // Parse JSON fields
    team_members: JSON.parse(data.team_members || '[]'),
    collaborators: JSON.parse(data.collaborators || '[]'),
    advisors: JSON.parse(data.advisors || '[]'),
    partners: JSON.parse(data.partners || '[]'),
    testimonials: JSON.parse(data.testimonials || '[]'),
    deliverables: JSON.parse(data.deliverables || '[]'),
    milestones: JSON.parse(data.milestones || '[]'),
  }
}

export const projectService = {
  async createProject(userId: string, projectData: any) {
    try {
      const dbData = transformFormToDb(projectData);
      
      const project = await prisma.projects.create({
        data: {
          ...dbData,
          user_id: userId,
          created_at: new Date(),
          updated_at: new Date()
        }
      });

      return formatProject(project);
    } catch (error) {
      console.error('Error in createProject:', error);
      throw error;
    }
  },

  async updateProject(projectId: string, projectData: any) {
    try {
      const dbData = transformFormToDb(projectData);
      
      // Add updated timestamp
      const data = {
        ...dbData,
        updated_at: new Date()
      };

      const project = await prisma.projects.update({
        where: { id: projectId },
        data
      });

      return transformDbToApi(project);
    } catch (error) {
      console.error('Error in updateProject:', error);
      throw error;
    }
  },

  async getProject(projectId: string) {
    const project = await prisma.projects.findUnique({
      where: { id: projectId }
    })
    return project ? transformDbToApi(project) : null
  },

  getAllProjects: async () => {
    const projects = await prisma.projects.findMany();
    return projects.map(formatProject);
  },

  getProjectsByUser: async (userId: string) => {
    const projects = await prisma.projects.findMany({
      where: { user_id: userId },
    });
    return projects.map(formatProject);
  },

  getProjectById: async (id: string) => {
    try {
      const project = await prisma.projects.findUnique({
        where: { id },
      });
      return project ? formatProject(project) : null;
    } catch (error) {
      console.error('Error in getProjectById:', error);
      throw error;
    }
  },

  async deleteProject(id: string) {
    try {
      await prisma.projects.delete({
        where: { id },
      });
      return true;
    } catch (error) {
      console.error('Error in deleteProject:', error);
      throw error;
    }
  },

  async uploadProjectImage(id: string, file: Express.Multer.File) {
    try {
      const imagePath = `/uploads/${file.filename}`;
      
      await prisma.projects.update({
        where: { id },
        data: {
          project_image: imagePath,
        },
      });
      
      return imagePath;
    } catch (error) {
      console.error('Error in uploadProjectImage:', error);
      throw error;
    }
  }
} 