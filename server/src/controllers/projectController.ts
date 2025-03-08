import { Request, Response } from 'express';
import { projectService } from '../services/projectService';
import { uploadFile } from '../services/fileService';

// Add type for user in request
interface AuthRequest extends Request {
  user?: {
    id: string;
  };
}

export const projectController = {
  // Get all projects
  async getAllProjects(req: Request, res: Response) {
    try {
      const projects = await projectService.getAllProjects();
      res.json(projects);
    } catch (error) {
      console.error('Error in getAllProjects:', error);
      res.status(500).json({ message: 'Failed to fetch projects' });
    }
  },

  // Get projects by user ID
  async getProjectsByUser(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const projects = await projectService.getProjectsByUser(userId);
      res.json(projects);
    } catch (error) {
      console.error('Error in getProjectsByUser:', error);
      res.status(500).json({ message: 'Failed to fetch user projects' });
    }
  },

  // Get project by ID
  async getProjectById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const project = await projectService.getProjectById(id);
      
      if (!project) {
        return res.status(404).json({ message: 'Project not found' });
      }
      
      res.json(project);
    } catch (error) {
      console.error('Error in getProjectById:', error);
      res.status(500).json({ message: 'Failed to fetch project' });
    }
  },

  // Create new project
  async createProject(req: Request, res: Response) {
    try {
      const userId = req.user?.id; // From auth middleware
      if (!userId) {
        return res.status(401).json({ message: 'Authentication required' });
      }

      const projectData = req.body;
      const project = await projectService.createProject(userId, projectData);
      res.status(201).json(project);
    } catch (error) {
      console.error('Error in createProject:', error);
      res.status(500).json({ message: 'Failed to create project' });
    }
  },

  // Update project
  async updateProject(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      
      // Log the incoming data to verify fields
      console.log('Updating project with data:', JSON.stringify(req.body, null, 2));
      
      // Pass all fields to the service
      const updatedProject = await projectService.updateProject(id, userId, req.body);
      
      // Make sure we're returning a valid JSON response
      return res.status(200).json(updatedProject);
    } catch (error) {
      console.error('Error updating project:', error);
      return res.status(500).json({ message: 'Failed to update project' });
    }
  },

  // Delete project
  async deleteProject(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user?.id; // From auth middleware
      
      // Check if project exists and belongs to user
      const existingProject = await projectService.getProjectById(id);
      if (!existingProject) {
        return res.status(404).json({ message: 'Project not found' });
      }
      
      if (existingProject.user_id !== userId) {
        return res.status(403).json({ message: 'Not authorized to delete this project' });
      }

      await projectService.deleteProject(id);
      res.json({ message: 'Project deleted successfully' });
    } catch (error) {
      console.error('Error in deleteProject:', error);
      res.status(500).json({ message: 'Failed to delete project' });
    }
  },

  // Upload project image
  async uploadProjectImage(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      
      // Check if project exists and belongs to user
      const existingProject = await projectService.getProjectById(id);
      if (!existingProject) {
        return res.status(404).json({ message: 'Project not found' });
      }
      
      if (existingProject.user_id !== userId) {
        return res.status(403).json({ message: 'Not authorized to update this project' });
      }

      if (!req.file) {
        return res.status(400).json({ message: 'No image file provided' });
      }

      const imagePath = await projectService.uploadProjectImage(id, req.file);
      res.json({ imagePath });
    } catch (error) {
      console.error('Error in uploadProjectImage:', error);
      res.status(500).json({ message: 'Failed to upload project image' });
    }
  },

  // Upload media for complex fields (team members, collaborators, etc.)
  async uploadFieldMedia(req: AuthRequest, res: Response) {
    try {
      const { id, field, index } = req.params;
      const userId = req.user?.id;
      
      // Check if project exists and belongs to user
      const existingProject = await projectService.getProjectById(id);
      if (!existingProject) {
        return res.status(404).json({ message: 'Project not found' });
      }
      
      if (existingProject.user_id !== userId) {
        return res.status(403).json({ message: 'Not authorized to update this project' });
      }

      if (!req.file) {
        return res.status(400).json({ message: 'No media file provided' });
      }

      const mediaPath = await projectService.uploadFieldMedia(id, field, parseInt(index), req.file);
      res.json({ mediaPath });
    } catch (error: any) {
      console.error('Error in uploadFieldMedia:', error);
      res.status(500).json({ 
        message: 'Failed to upload media',
        error: error.message 
      });
    }
  }
};

export const uploadTeamMemberMedia = async (req: Request, res: Response) => {
  try {
    const { projectId, index } = req.params;
    const file = req.file;
    
    if (!file) {
      throw new Error('No file uploaded');
    }

    const mediaUrl = await uploadFile(file);
    const project = await projectService.getProject(projectId);
    
    if (!project) {
      throw new Error('Project not found');
    }

    const teamMembers = project.team_members;
    teamMembers[parseInt(index)].media = mediaUrl;

    await projectService.updateProject(projectId, {
      ...project,
      team_members: teamMembers
    });

    res.json({ url: mediaUrl });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Add other media upload endpoints
export const uploadCollaboratorMedia = async (req: Request, res: Response) => {
  try {
    const { projectId, index } = req.params;
    const file = req.file;
    
    if (!file) {
      throw new Error('No file uploaded');
    }

    const mediaUrl = await uploadFile(file);
    const project = await projectService.getProject(projectId);
    
    if (!project) {
      throw new Error('Project not found');
    }

    const collaborators = project.collaborators;
    collaborators[parseInt(index)].media = mediaUrl;

    await projectService.updateProject(projectId, {
      ...project,
      collaborators
    });

    res.json({ url: mediaUrl });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const uploadAdvisorMedia = async (req: Request, res: Response) => {
  // Similar implementation for advisors
};

export const uploadPartnerMedia = async (req: Request, res: Response) => {
  // Similar implementation for partners
};

export const uploadTestimonialMedia = async (req: Request, res: Response) => {
  // Similar implementation for testimonials
};

// Similar endpoints for other media uploads 