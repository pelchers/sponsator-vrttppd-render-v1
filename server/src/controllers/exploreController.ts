import { Request, Response } from 'express';
import * as exploreService from '../services/exploreService';

// Search across all content types
export const searchAll = async (req: Request, res: Response) => {
  try {
    const { q = '', page = '1', limit = '12' } = req.query;
    const searchQuery = String(q);
    const pageNum = parseInt(String(page), 10);
    const limitNum = parseInt(String(limit), 10);
    
    // Parse content types filter (comma-separated string to array)
    const contentTypesParam = req.query.contentTypes ? String(req.query.contentTypes) : '';
    const contentTypes = contentTypesParam ? contentTypesParam.split(',') : [];
    
    // Parse user types filter (comma-separated string to array)
    const userTypesParam = req.query.userTypes ? String(req.query.userTypes) : '';
    const userTypes = userTypesParam ? userTypesParam.split(',') : [];
    
    // Prepare results object
    const results: any = {
      users: [],
      projects: [],
      articles: [],
      posts: []
    };
    
    // Execute searches in parallel based on selected content types
    const searchPromises = [];
    
    // Only search for content types that are explicitly selected
    if (contentTypes.includes('users')) {
      searchPromises.push(
        exploreService.searchUsers(searchQuery, userTypes, pageNum, limitNum)
          .then(data => { results.users = data.users; })
      );
    }
    
    if (contentTypes.includes('projects')) {
      searchPromises.push(
        exploreService.searchProjects(searchQuery, userTypes, pageNum, limitNum)
          .then(data => { results.projects = data.projects; })
      );
    }
    
    if (contentTypes.includes('articles')) {
      searchPromises.push(
        exploreService.searchArticles(searchQuery, userTypes, pageNum, limitNum)
          .then(data => { results.articles = data.articles; })
      );
    }
    
    if (contentTypes.includes('posts')) {
      searchPromises.push(
        exploreService.searchPosts(searchQuery, userTypes, pageNum, limitNum)
          .then(data => { results.posts = data.posts; })
      );
    }
    
    // Wait for all searches to complete
    await Promise.all(searchPromises);
    
    // Return results
    return res.status(200).json({
      results,
      totalPages: 1, // Simplified for now
      page: pageNum
    });
  } catch (error) {
    console.error('Error in searchAll:', error);
    return res.status(500).json({ 
      message: 'Error searching content',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}; 