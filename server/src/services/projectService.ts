import { PrismaClient, projects as PrismaProject } from '@prisma/client'
import prisma from '../lib/prisma'
import { Project } from '@prisma/client'
import path from 'path'

const prismaClient = new PrismaClient()

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
  const { 
    seeking, 
    notification_preferences, 
    social_links,
    team_members,
    collaborators,
    advisors,
    partners,
    testimonials,
    deliverables,
    milestones,
    ...baseData 
  } = data;

  // Handle JSON fields (stringify arrays and objects)
  const jsonFields = {
    team_members: JSON.stringify(team_members || []),
    collaborators: JSON.stringify(collaborators || []),
    advisors: JSON.stringify(advisors || []),
    partners: JSON.stringify(partners || []),
    testimonials: JSON.stringify(testimonials || []),
    deliverables: JSON.stringify(deliverables || []),
    milestones: JSON.stringify(milestones || [])
  };

  // Return flattened data for database
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

    // Add JSON fields
    ...jsonFields,

    // Add timestamps
    updated_at: new Date()
  };
}

// Transform database data to API response format
function transformDbToApi(project: any) {
  return {
    ...project,
    // Parse JSON fields
    team_members: JSON.parse(project.team_members || '[]'),
    collaborators: JSON.parse(project.collaborators || '[]'),
    advisors: JSON.parse(project.advisors || '[]'),
    partners: JSON.parse(project.partners || '[]'),
    testimonials: JSON.parse(project.testimonials || '[]'),
    deliverables: JSON.parse(project.deliverables || '[]'),
    milestones: JSON.parse(project.milestones || '[]'),
  };
}

// Transform API data to database format
function transformApiToDb(data: any) {
  return {
    ...data,
    // Stringify JSON fields
    team_members: JSON.stringify(data.team_members || []),
    collaborators: JSON.stringify(data.collaborators || []),
    advisors: JSON.stringify(data.advisors || []),
    partners: JSON.stringify(data.partners || []),
    testimonials: JSON.stringify(data.testimonials || []),
    deliverables: JSON.stringify(data.deliverables || []),
    milestones: JSON.stringify(data.milestones || []),
  };
}

export const projectService = {
  async createProject(userId: string, projectData: any) {
    try {
      console.log('Creating project with data:', JSON.stringify(projectData, null, 2));
      
      // Filter out any fields that don't exist in the schema
      const allowedFields = [
        'project_name', 'project_description', 'project_type', 'project_category',
        'project_image_url', 'project_image_upload', 'project_image_display',
        'project_title', 'project_duration', 'project_handle', 'project_followers',
        'client', 'client_location', 'client_website',
        'contract_type', 'contract_duration', 'contract_value',
        'project_timeline', 'budget', 'project_status',
        'preferred_collaboration_type', 'budget_range', 'currency',
        'standard_rate', 'rate_type', 'compensation_type',
        'skills_required', 'expertise_needed', 'target_audience', 'solutions_offered',
        'project_tags', 'industry_tags', 'technology_tags', 'project_status_tag',
        'seeking_creator', 'seeking_brand', 'seeking_freelancer', 'seeking_contractor',
        'social_links_youtube', 'social_links_instagram', 'social_links_github',
        'social_links_twitter', 'social_links_linkedin',
        'website_links', 'short_term_goals', 'long_term_goals',
        'project_visibility', 'search_visibility',
        'notification_preferences_email', 'notification_preferences_push', 'notification_preferences_digest',
        'team_members', 'collaborators', 'advisors', 'partners', 'testimonials',
        'deliverables', 'milestones'
      ];
      
      const filteredData = Object.keys(projectData)
        .filter(key => allowedFields.includes(key))
        .reduce((obj: any, key) => {
          obj[key] = projectData[key];
          return obj;
        }, {});
      
      console.log('Filtered project data:', JSON.stringify(filteredData, null, 2));
      
      const project = await prismaClient.projects.create({
        data: {
          ...filteredData,
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

  async updateProject(id: string, userId: string, data: any) {
    try {
      console.log('Updating project with data:', data);
      
      // Make sure we preserve the image display preference
      const updateData = {
        ...data,
        project_image_display: data.project_image_display || 'url',
        project_image_url: data.project_image_display === 'url' ? data.project_image_url : '',
        project_image_upload: data.project_image_display === 'upload' ? data.project_image_upload : '',
      };

      const project = await prismaClient.projects.update({
        where: { id },
        data: updateData
      });

      return mapProjectToFrontend(project);
    } catch (error) {
      console.error('Error updating project:', error);
      throw error;
    }
  },

  async getProject(projectId: string) {
    const project = await prismaClient.projects.findUnique({
      where: { id: projectId }
    })
    return project ? transformDbToApi(project) : null
  },

  getAllProjects: async () => {
    const projects = await prismaClient.projects.findMany();
    return projects.map(transformDbToApi);
  },

  getProjectsByUser: async (userId: string) => {
    const projects = await prismaClient.projects.findMany({
      where: { user_id: userId },
    });
    return projects.map(transformDbToApi);
  },

  getProjectById: async (id: string) => {
    try {
      const project = await prismaClient.projects.findUnique({
        where: { id },
      });
      
      if (!project) {
        return null;
      }
      
      // Transform the project data
      const transformedProject = transformDbToApi(project);
      
      // Map the project data for the frontend
      const mappedProject = mapProjectToFrontend(transformedProject);
      
      console.log('Project data for frontend:', {
        id: mappedProject.id,
        image_url: mappedProject.project_image_url,
        image_upload: mappedProject.project_image_upload,
        image_display: mappedProject.project_image_display,
        image: mappedProject.project_image
      });
      
      return mappedProject;
    } catch (error) {
      console.error('Error in getProjectById:', error);
      throw error;
    }
  },

  async deleteProject(id: string) {
    try {
      await prismaClient.projects.delete({
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
      // Store the path relative to the uploads directory
      // Make sure this path is consistent with the static file serving
      const relativePath = `projects/${file.filename}`;
      
      console.log('Uploading project image:', relativePath);
      
      const updatedProject = await prismaClient.projects.update({
        where: { id },
        data: {
          project_image_upload: relativePath,
          project_image_url: '',
          project_image_display: 'upload'
        }
      });
      
      // Log the updated project for debugging
      console.log('Updated project image data:', {
        project_image_upload: updatedProject.project_image_upload,
        project_image_display: updatedProject.project_image_display
      });
      
      return {
        path: relativePath,
        project: mapProjectToFrontend(updatedProject)
      };
    } catch (error) {
      console.error('Error uploading project image:', error);
      throw error;
    }
  },

  async uploadFieldMedia(id: string, field: string, index: number, file: Express.Multer.File) {
    try {
      const imagePath = `/uploads/${file.filename}`;
      const project = await prismaClient.projects.findUnique({
        where: { id }
      });

      if (!project) {
        throw new Error('Project not found');
      }

      // Parse the existing field data
      const fieldData = JSON.parse(project[field] || '[]');
      
      // Update the media path at the specified index
      fieldData[index] = {
        ...fieldData[index],
        media: imagePath
      };

      // Update the project with the new field data
      await prismaClient.projects.update({
        where: { id },
        data: {
          [field]: JSON.stringify(fieldData),
          updated_at: new Date()
        }
      });

      return imagePath;
    } catch (error) {
      console.error(`Error in uploadFieldMedia:`, error);
      throw error;
    }
  }
}

function mapProjectToFrontend(project: any) {
  // Ensure proper image path is set based on display preference
  const processedProject = {
    ...project,
    project_image: project.project_image_display === 'url' 
      ? project.project_image_url
      : project.project_image_upload 
        ? `/uploads/${project.project_image_upload}`
        : null,
    // Keep the original fields
    project_image_url: project.project_image_url || '',
    project_image_upload: project.project_image_upload || '',
    project_image_display: project.project_image_display || 'url'
  };

  console.log('Mapped project image fields:', {
    display: processedProject.project_image_display,
    url: processedProject.project_image_url,
    upload: processedProject.project_image_upload,
    final: processedProject.project_image
  });

  return processedProject;
} 