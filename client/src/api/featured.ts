import axios from 'axios';
import { API_ROUTES } from './config';
import { searchAll } from '@/api/explore';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4100/api';

interface FetchFeaturedContentOptions {
  featuredOnly?: boolean;
}

export const fetchFeaturedContent = async (options: FetchFeaturedContentOptions = {}) => {
  try {
    const { featuredOnly = false } = options;
    
    // Use the explore API to get data with images
    const data = await searchAll('', {
      contentTypes: ['users', 'projects', 'articles', 'posts'],
      featured: true // Always get featured items
    });

    // Filter results based on featuredOnly option
    const transformedResults = {
      users: data.results.users?.map((user: any) => ({
        ...user,
        profile_image: user.profile_image_url || user.profile_image_upload,
        profile_image_url: user.profile_image_url,
        profile_image_upload: user.profile_image_upload,
        profile_image_display: user.profile_image_display || 'url',
        bio: user.bio || '',
        career_title: user.career_title || '',
        likes_count: user.likes_count || 0,
        follows_count: user.follows_count || 0,
        followers_count: user.followers_count || 0,
        watches_count: user.watches_count || 0,
        users: {
          username: user.username,
          profile_image: user.profile_image_url || user.profile_image_upload
        }
      })).filter(user => !featuredOnly || user.featured) || [],
      projects: data.results.projects?.map((project: any) => ({
        ...project,
        user_profile_image_url: project.user_profile_image_url || null,
        user_profile_image_upload: project.user_profile_image_upload || null,
        user_profile_image_display: project.user_profile_image_display || 'url'
      })).filter(project => !featuredOnly || project.featured) || [],
      articles: data.results.articles?.map((article: any) => ({
        ...article,
        user_profile_image_url: article.user_profile_image_url || null,
        user_profile_image_upload: article.user_profile_image_upload || null,
        user_profile_image_display: article.user_profile_image_display || 'url'
      })).filter(article => !featuredOnly || article.featured) || [],
      posts: data.results.posts?.map((post: any) => ({
        ...post,
        user_profile_image_url: post.user_profile_image_url || null,
        user_profile_image_upload: post.user_profile_image_upload || null,
        user_profile_image_display: post.user_profile_image_display || 'url'
      })).filter(post => !featuredOnly || post.featured) || [],
      comments: data.results.comments?.filter(comment => !featuredOnly || comment.featured) || []
    };

    return transformedResults;
  } catch (error) {
    console.error('Error fetching featured content:', error);
    return {
      users: [],
      projects: [],
      articles: [],
      posts: [],
      comments: []
    };
  }
}; 