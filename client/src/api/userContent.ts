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

interface FetchUserInteractionsOptions {
  contentTypes: string[];
  interactionTypes: string[];
  page: number;
  limit: number;
  userId: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Fetch user interactions (likes, follows, watches)
export const fetchUserInteractions = async (options: FetchUserInteractionsOptions) => {
  try {
    // First, get filtered interactions from the interactions endpoint
    const params = new URLSearchParams();
    
    if (options.contentTypes?.length > 0) {
      params.append('contentTypes', options.contentTypes.join(','));
    }
    
    if (options.interactionTypes?.length > 0) {
      params.append('interactionTypes', options.interactionTypes.join(','));
    }
    
    params.append('page', options.page.toString());
    params.append('limit', options.limit.toString());
    params.append('userId', options.userId);
    
    // Get filtered interactions first
    const interactionsResponse = await axios.get(`${API_URL}/users/interactions?${params.toString()}`, {
      headers: getAuthHeaders()
    });

    // Then use explore API to get full data with images
    const data = await searchAll('', {
      contentTypes: options.contentTypes,
      page: options.page,
      limit: options.limit,
      userId: options.userId,
      sortBy: options.sortBy,
      sortOrder: options.sortOrder
    });

    // Combine the interaction data with the explore data
    const transformedResults = {
      users: data.results.users?.map((user: any) => ({
        ...user,
        user_profile_image_url: user.profile_image_url || null,
        user_profile_image_upload: user.profile_image_upload || null,
        user_profile_image_display: user.profile_image_display || 'url',
        // Get interaction data from the interactions response
        userHasLiked: interactionsResponse.data.results.users?.find((u: any) => u.id === user.id)?.userHasLiked || false,
        userIsFollowing: interactionsResponse.data.results.users?.find((u: any) => u.id === user.id)?.userIsFollowing || false,
        userIsWatching: interactionsResponse.data.results.users?.find((u: any) => u.id === user.id)?.userIsWatching || false
      })).filter((user: any) => 
        interactionsResponse.data.results.users?.some((u: any) => u.id === user.id)
      ) || [],
      posts: data.results.posts?.map((post: any) => ({
        ...post,
        user_profile_image_url: post.user_profile_image_url || null,
        user_profile_image_upload: post.user_profile_image_upload || null,
        user_profile_image_display: post.user_profile_image_display || 'url',
        userHasLiked: interactionsResponse.data.results.posts?.find((p: any) => p.id === post.id)?.userHasLiked || false,
        userIsFollowing: interactionsResponse.data.results.posts?.find((p: any) => p.id === post.id)?.userIsFollowing || false,
        userIsWatching: interactionsResponse.data.results.posts?.find((p: any) => p.id === post.id)?.userIsWatching || false
      })).filter((post: any) => 
        interactionsResponse.data.results.posts?.some((p: any) => p.id === post.id)
      ) || [],
      articles: data.results.articles?.map((article: any) => ({
        ...article,
        user_profile_image_url: article.user_profile_image_url || null,
        user_profile_image_upload: article.user_profile_image_upload || null,
        user_profile_image_display: article.user_profile_image_display || 'url',
        userHasLiked: interactionsResponse.data.results.articles?.find((a: any) => a.id === article.id)?.userHasLiked || false,
        userIsFollowing: interactionsResponse.data.results.articles?.find((a: any) => a.id === article.id)?.userIsFollowing || false,
        userIsWatching: interactionsResponse.data.results.articles?.find((a: any) => a.id === article.id)?.userIsWatching || false
      })).filter((article: any) => 
        interactionsResponse.data.results.articles?.some((a: any) => a.id === article.id)
      ) || [],
      projects: data.results.projects?.map((project: any) => ({
        ...project,
        user_profile_image_url: project.user_profile_image_url || null,
        user_profile_image_upload: project.user_profile_image_upload || null,
        user_profile_image_display: project.user_profile_image_display || 'url',
        userHasLiked: interactionsResponse.data.results.projects?.find((p: any) => p.id === project.id)?.userHasLiked || false,
        userIsFollowing: interactionsResponse.data.results.projects?.find((p: any) => p.id === project.id)?.userIsFollowing || false,
        userIsWatching: interactionsResponse.data.results.projects?.find((p: any) => p.id === project.id)?.userIsWatching || false
      })).filter((project: any) => 
        interactionsResponse.data.results.projects?.some((p: any) => p.id === project.id)
      ) || []
    };

    return {
      results: transformedResults,
      totalPages: interactionsResponse.data.totalPages
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

// Update fetchUserPortfolio to use explore API
export const fetchUserPortfolio = async (options: {
  contentTypes: string[];
  userId: string;
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}) => {
  try {
    // Use the explore API like fetchUserLikes does
    const data = await searchAll('', {
      contentTypes: options.contentTypes,
      page: options.page,
      limit: options.limit,
      sortBy: options.sortBy,
      sortOrder: options.sortOrder,
      userId: options.userId // Pass userId to filter by user
    });

    // Transform results to ensure image fields are present
    const transformedResults = {
      users: data.results.users?.map((user: any) => ({
        ...user,
        user_profile_image_url: user.profile_image_url || null,
        user_profile_image_upload: user.profile_image_upload || null,
        user_profile_image_display: user.profile_image_display || 'url'
      })) || [],
      posts: data.results.posts?.map((post: any) => ({
        ...post,
        user_profile_image_url: post.user_profile_image_url || null,
        user_profile_image_upload: post.user_profile_image_upload || null,
        user_profile_image_display: post.user_profile_image_display || 'url'
      })) || [],
      articles: data.results.articles?.map((article: any) => ({
        ...article,
        user_profile_image_url: article.user_profile_image_url || null,
        user_profile_image_upload: article.user_profile_image_upload || null,
        user_profile_image_display: article.user_profile_image_display || 'url'
      })) || [],
      projects: data.results.projects?.map((project: any) => ({
        ...project,
        user_profile_image_url: project.user_profile_image_url || null,
        user_profile_image_upload: project.user_profile_image_upload || null,
        user_profile_image_display: project.user_profile_image_display || 'url'
      })) || []
    };

    return {
      results: transformedResults,
      totalPages: data.totalPages
    };
  } catch (error) {
    console.error('Error fetching user portfolio:', error);
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

// Update the getUserInteractions function to include sort parameters
export async function getUserInteractions(
  userId: string,
  options: {
    contentTypes?: string[];
    interactionTypes?: string[];
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  } = {}
) {
  const params = new URLSearchParams();
  
  if (options.contentTypes) {
    params.append('contentTypes', options.contentTypes.join(','));
  }
  
  if (options.interactionTypes) {
    params.append('interactionTypes', options.interactionTypes.join(','));
  }
  
  if (options.page) {
    params.append('page', options.page.toString());
  }
  
  if (options.limit) {
    params.append('limit', options.limit.toString());
  }
  
  if (options.sortBy) {
    params.append('sortBy', options.sortBy);
  }
  
  if (options.sortOrder) {
    params.append('sortOrder', options.sortOrder);
  }

  const response = await fetch(`${API_URL}/users/${userId}/interactions?${params}`);
  if (!response.ok) {
    throw new Error('Failed to fetch user interactions');
  }

  return response.json();
}

// Update the getUserPortfolio function to include sort parameters
export async function getUserPortfolio(
  userId: string,
  options: {
    contentTypes?: string[];
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  } = {}
) {
  console.log(`Fetching from endpoint: ${API_URL}/users/portfolio/${userId}?${new URLSearchParams({
    ...(options.contentTypes && { contentTypes: options.contentTypes.join(',') }),
    ...(options.page && { page: options.page.toString() }),
    ...(options.limit && { limit: options.limit.toString() }),
    ...(options.sortBy && { sortBy: options.sortBy }),
    ...(options.sortOrder && { sortOrder: options.sortOrder })
  })}`);

  try {
    // Prepare headers with auth token
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getAuthToken()}`
    };
    
    console.log('Using headers:', headers);
    
    // Make the API call
    const response = await fetch(`${API_URL}/users/portfolio/${userId}?${new URLSearchParams({
      ...(options.contentTypes && { contentTypes: options.contentTypes.join(',') }),
      ...(options.page && { page: options.page.toString() }),
      ...(options.limit && { limit: options.limit.toString() }),
      ...(options.sortBy && { sortBy: options.sortBy }),
      ...(options.sortOrder && { sortOrder: options.sortOrder })
    })}`, {
      method: 'GET',
      headers
    });
    
    console.log('Response status:', response.status);
    console.log('Response headers:', response.headers);
    
    // Parse the response
    const text = await response.text();
    console.log('Response text:', text);
    
    // If empty response, return empty data
    if (!text) {
      return {
        results: { posts: [], articles: [], projects: [] },
        counts: { posts: 0, articles: 0, projects: 0 },
        page: options.page || 1,
        limit: options.limit || 12,
        totalPages: 0
      };
    }
    
    return JSON.parse(text);
  } catch (error) {
    console.error('Error fetching portfolio:', error);
    // Return empty data on error
    return {
      results: { posts: [], articles: [], projects: [] },
      counts: { posts: 0, articles: 0, projects: 0 },
      page: options.page || 1,
      limit: options.limit || 12,
      totalPages: 0
    };
  }
}

// Add this function to get user's content stats
export async function getUserStats(userId: string) {
  try {
    const response = await fetch(`${API_URL}/user/${userId}/stats`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch user stats');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching user stats:', error);
    return {
      projects: 0,
      articles: 0,
      posts: 0,
      likes: 0
    };
  }
} 