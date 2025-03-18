import { Request, Response } from 'express';
import * as exploreService from '../services/exploreService';
import { SortOptions, validSortFields, contentTypeFieldMap } from '../types/sorting';

// Search across all content types
export const searchAll = async (req: Request, res: Response) => {
  try {
    const { 
      q = '', 
      contentTypes = '', 
      userTypes = '', 
      page = '1', 
      limit = '12',
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;

    // Convert to appropriate types
    const searchQuery = String(q);
    const pageNum = parseInt(String(page), 10);
    const limitNum = parseInt(String(limit), 10);
    const contentTypesArray = contentTypes ? String(contentTypes).split(',') : [];
    const userTypesArray = userTypes ? String(userTypes).split(',') : [];
    const sort = String(sortBy);
    const order = (String(sortOrder) === 'asc') ? 'asc' : 'desc';

    // Map frontend sort field to database field
    const getSortField = (contentType: string, field: string) => {
      // Map of frontend sort options to database fields
      const fieldMappings: Record<string, Record<string, string>> = {
        users: {
          alpha: 'username',
          likes: 'likes_count',
          follows: 'followers_count',
          watches: 'watches_count',
          created: 'created_at',
          updated: 'updated_at'
        },
        projects: {
          alpha: 'project_name',
          likes: 'likes_count',
          follows: 'follows_count',
          watches: 'watches_count',
          created: 'created_at',
          updated: 'updated_at'
        },
        articles: {
          alpha: 'title',
          likes: 'likes_count',
          follows: 'follows_count',
          watches: 'watches_count',
          created: 'created_at',
          updated: 'updated_at'
        },
        posts: {
          alpha: 'title',
          likes: 'likes_count',
          follows: 'follows_count',
          watches: 'watches_count',
          created: 'created_at',
          updated: 'updated_at'
        }
      };
      
      return fieldMappings[contentType]?.[field] || 'created_at';
    };

    // Pass the sort parameters to the service
    const results = await exploreService.searchAll(
      searchQuery, 
      contentTypesArray, 
      userTypesArray, 
      pageNum, 
      limitNum,
      sort,
      order,
      getSortField
    );

    return res.status(200).json(results);
  } catch (error) {
    console.error('Error in searchAll:', error);
    return res.status(500).json({ 
      message: 'Error searching content',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Add to existing search handler
export async function handleSearch(req: Request, res: Response) {
  try {
    const { 
      q = '', 
      contentTypes, 
      page, 
      limit,
      sortBy,
      sortOrder
    } = req.query;

    // Validate sort params
    if (sortBy && !validSortFields.includes(sortBy as string)) {
      return res.status(400).json({ error: 'Invalid sort field' });
    }
    if (sortOrder && !['asc', 'desc'].includes(sortOrder as string)) {
      return res.status(400).json({ error: 'Invalid sort order' });
    }

    const results = await searchAll(req, res);

    res.json(results);
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Failed to perform search' });
  }
} 