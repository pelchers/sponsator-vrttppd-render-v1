import axios from 'axios';
import { getAuthHeaders } from '@/utils/auth';
import { searchAll } from '@/api/explore';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4100/api';

// Fetch user's liked content
export const fetchUserLikes = async (options: any) => {
  try {
    // Use the explore API as a temporary solution
    const data = await searchAll('', {
      contentTypes: options.contentTypes,
      page: options.page,
      limit: options.limit
    });
    
    // Add userHasLiked flag to all items
    const results = {
      users: data.results.users || [],
      posts: (data.results.posts || []).map((post: any) => ({ ...post, userHasLiked: true })),
      articles: (data.results.articles || []).map((article: any) => ({ ...article, userHasLiked: true })),
      projects: (data.results.projects || []).map((project: any) => ({ ...project, userHasLiked: true }))
    };
    
    return {
      results,
      totalPages: data.totalPages
    };
  } catch (error) {
    console.error('Error fetching user likes:', error);
    return {
      results: {
        users: [],
        posts: [],
        articles: [],
        projects: []
      },
      totalPages: 1
    };
  }
};

// Fetch user interactions (likes, follows, watches)
export const fetchUserInteractions = async (options: {
  contentTypes?: string[];
  interactionTypes?: string[];
  page?: number;
  limit?: number;
}) => {
  try {
    // For now, we'll use the explore API as a temporary solution
    // In a real implementation, this would call a dedicated backend endpoint
    const data = await searchAll('', {
      contentTypes: options.contentTypes,
      page: options.page,
      limit: options.limit
    });
    
    // Process results based on selected interaction types
    const results = {
      users: [],
      posts: [],
      articles: [],
      projects: []
    };
    
    // Only process content types that were requested
    if (options.contentTypes?.includes('users') && data.results.users) {
      // Filter users based on interaction types
      const filteredUsers = data.results.users.filter((user: any, index: number) => {
        // For demo purposes, we'll assign different interaction types based on index
        const hasLike = index % 3 === 0;
        const hasFollow = index % 2 === 0;
        
        // Check if any of the user's interaction types match the requested types
        return (hasLike && options.interactionTypes?.includes('likes')) || 
               (hasFollow && options.interactionTypes?.includes('follows'));
      });
      
      // Add interaction flags
      results.users = filteredUsers.map((user: any, index: number) => ({
        ...user,
        userHasLiked: index % 3 === 0,
        userIsFollowing: index % 2 === 0,
        // Add a property to indicate which interaction type this item represents
        interactionType: index % 3 === 0 ? 'like' : 'follow'
      }));
    }
    
    if (options.contentTypes?.includes('posts') && data.results.posts) {
      // Filter posts based on interaction types
      const filteredPosts = data.results.posts.filter((post: any, index: number) => {
        // For demo purposes, we'll assign likes based on index
        const hasLike = index % 2 === 0;
        
        // Posts only support likes
        return hasLike && options.interactionTypes?.includes('likes');
      });
      
      // Add interaction flags
      results.posts = filteredPosts.map((post: any) => ({
        ...post,
        userHasLiked: true,
        interactionType: 'like'
      }));
    }
    
    if (options.contentTypes?.includes('articles') && data.results.articles) {
      // Filter articles based on interaction types
      const filteredArticles = data.results.articles.filter((article: any, index: number) => {
        // For demo purposes, we'll assign different interaction types based on index
        const hasLike = index % 3 === 0;
        const hasFollow = index % 2 === 0;
        const hasWatch = index % 4 === 0;
        
        // Check if any of the article's interaction types match the requested types
        return (hasLike && options.interactionTypes?.includes('likes')) || 
               (hasFollow && options.interactionTypes?.includes('follows')) ||
               (hasWatch && options.interactionTypes?.includes('watches'));
      });
      
      // Add interaction flags and determine primary interaction type
      results.articles = filteredArticles.map((article: any, index: number) => {
        // Determine which interaction types this article has
        const hasLike = index % 3 === 0;
        const hasFollow = index % 2 === 0;
        const hasWatch = index % 4 === 0;
        
        // Determine which interaction type to display based on selected filters
        let interactionType = '';
        
        // First check if the selected interaction types include watches and this article has a watch
        if (options.interactionTypes?.includes('watches') && hasWatch) {
          interactionType = 'watch';
        } 
        // Then check for follows
        else if (options.interactionTypes?.includes('follows') && hasFollow) {
          interactionType = 'follow';
        }
        // Finally check for likes
        else if (options.interactionTypes?.includes('likes') && hasLike) {
          interactionType = 'like';
        }
        
        return {
          ...article,
          userHasLiked: hasLike,
          userIsFollowing: hasFollow,
          userIsWatching: hasWatch,
          interactionType
        };
      });
    }
    
    if (options.contentTypes?.includes('projects') && data.results.projects) {
      // Filter projects based on interaction types
      const filteredProjects = data.results.projects.filter((project: any, index: number) => {
        // For demo purposes, we'll assign different interaction types based on index
        const hasLike = index % 3 === 0;
        const hasFollow = index % 2 === 0;
        const hasWatch = index % 4 === 0;
        
        // Check if any of the project's interaction types match the requested types
        return (hasLike && options.interactionTypes?.includes('likes')) || 
               (hasFollow && options.interactionTypes?.includes('follows')) ||
               (hasWatch && options.interactionTypes?.includes('watches'));
      });
      
      // Add interaction flags and determine primary interaction type
      results.projects = filteredProjects.map((project: any, index: number) => {
        // Determine which interaction types this project has
        const hasLike = index % 3 === 0;
        const hasFollow = index % 2 === 0;
        const hasWatch = index % 4 === 0;
        
        // Determine which interaction type to display based on selected filters
        let interactionType = '';
        
        // First check if the selected interaction types include watches and this project has a watch
        if (options.interactionTypes?.includes('watches') && hasWatch) {
          interactionType = 'watch';
        } 
        // Then check for follows
        else if (options.interactionTypes?.includes('follows') && hasFollow) {
          interactionType = 'follow';
        }
        // Finally check for likes
        else if (options.interactionTypes?.includes('likes') && hasLike) {
          interactionType = 'like';
        }
        
        return {
          ...project,
          userHasLiked: hasLike,
          userIsFollowing: hasFollow,
          userIsWatching: hasWatch,
          interactionType
        };
      });
    }
    
    return {
      results,
      totalPages: data.totalPages
    };
  } catch (error) {
    console.error('Error fetching user interactions:', error);
    return {
      results: {
        users: [],
        posts: [],
        articles: [],
        projects: []
      },
      totalPages: 1
    };
  }
}; 