import axios from 'axios';
import { API_URL } from '@/config';

export interface Testimonial {
  id: string;
  user_id: string;
  title?: string;
  content: string;
  rating: number;
  company?: string;
  position?: string;
  created_at: string;
  is_approved: boolean;
  is_featured: boolean;
  user?: {
    id: string;
    username: string;
    profile_image_url?: string;
    profile_image_upload?: string;
    profile_image_display?: string;
  };
}

export interface TestimonialFormData {
  title?: string;
  content: string;
  rating: number;
  company?: string;
  position?: string;
}

export const createTestimonial = async (data: TestimonialFormData) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await axios.post(`${API_URL}/testimonials`, data, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    return response.data;
  } catch (error) {
    console.error('Error creating testimonial:', error);
    throw error;
  }
};

export const fetchTestimonials = async (params?: { 
  featured?: boolean, 
  limit?: number,
  showAll?: boolean
}) => {
  try {
    const response = await axios.get(`${API_URL}/testimonials`, {
      params
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching testimonials:', error);
    throw error;
  }
}; 