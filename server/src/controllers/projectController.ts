import { Request, Response } from 'express';
import * as projectService from '../services/projectService';
import { uploadFile } from '../services/fileService';

// Get all projects
export async function getProjects(req: Request, res: Response) {
  try {
    const projects = await projectService.getAllProjects();
    res.json(projects);
  } catch (error) {
    console.error('Error in getProjects:', error);
    res.status(500).json({ message: 'Failed to fetch projects' });
  }
}

// Get projects by user ID
export async function getProjectsByUser(req: Request, res: Response) {
  try {
    const { userId } = req.params;
    const projects = await projectService.getProjectsByUser(userId);
    res.json(projects);
  } catch (error) {
    console.error('Error in getProjectsByUser:', error);
    res.status(500).json({ message: 'Failed to fetch user projects' });
  }
}

// Get project by ID
export async function getProjectById(req: Request, res: Response) {
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
}

// Create new project
export async function createProject(req: Request, res: Response) {
  try {
    // Add null checks for req.user
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const userId = req.user.id;
    
    // Add user_id to project data
    const projectData = {
      ...req.body,
      user_id: userId
    };
    
    const newProject = await projectService.createProject(projectData);
    res.status(201).json(newProject);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    res.status(500).json({ 
      message: 'Failed to create project',
      error: process.env.NODE_ENV === 'development' ? errorMessage : undefined 
    });
  }
}

// Update project
export async function updateProject(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    // Check if project exists and belongs to user
    const existingProject = await projectService.getProjectById(id);
    if (!existingProject) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    if (existingProject.user_id !== userId) {
      return res.status(403).json({ message: 'Not authorized to update this project' });
    }
    
    const updatedProject = await projectService.updateProject(id, req.body);
    res.json(updatedProject);
  } catch (error) {
    console.error('Error in updateProject:', error);
    res.status(500).json({ 
      message: 'Failed to update project',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

// Delete project
export async function deleteProject(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
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
    res.status(500).json({ 
      message: 'Failed to delete project',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

// Upload project image
export async function uploadProjectImage(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const file = req.file;
    
    if (!file) {
      return res.status(400).json({ message: 'No image file provided' });
    }
    
    // Check if project exists and belongs to user
    const existingProject = await projectService.getProjectById(id);
    if (!existingProject) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    if (existingProject.user_id !== userId) {
      return res.status(403).json({ message: 'Not authorized to update this project' });
    }
    
    const imageUrl = await projectService.uploadProjectImage(id, file);
    res.json({ imageUrl });
  } catch (error) {
    console.error('Error uploading project image:', error);
    res.status(500).json({ message: 'Error uploading project image' });
  }
}

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