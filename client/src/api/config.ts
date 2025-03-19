export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4100/api';
export const API_BASE_URL = API_URL;

// Add ApiResponse type here
export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  error?: string;
}

export const API_ROUTES = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout'
  },
  USERS: {
    PROFILE: (id: string) => `/users/${id}`,
    UPDATE: (id: string) => `/users/${id}`,
    UPLOAD_IMAGE: (id: string) => `/users/${id}/image`
  },
  PROJECTS: {
    BASE: '/projects',
    UPDATE: '/projects/:id',
    CREATE: '/projects',
    DELETE: '/projects/:id',
    GET: '/projects/:id',
    GET_USER_PROJECTS: '/projects/user/:userId',
    UPLOAD_IMAGE: '/projects/:id/image',
    UPLOAD_TEAM_MEMBER_MEDIA: '/projects/:id/team-members/:index/media',
    UPLOAD_COLLABORATOR_MEDIA: '/projects/:id/collaborators/:index/media',
    UPLOAD_ADVISOR_MEDIA: '/projects/:id/advisors/:index/media',
    UPLOAD_PARTNER_MEDIA: '/projects/:id/partners/:index/media',
    UPLOAD_TESTIMONIAL_MEDIA: '/projects/:id/testimonials/:index/media',
  },
  FEATURED: {
    GET: '/featured'
  }
};

// Helper to replace URL parameters
export const replaceUrlParams = (url: string, params: Record<string, string>) => {
  let finalUrl = url;
  Object.entries(params).forEach(([key, value]) => {
    finalUrl = finalUrl.replace(`:${key}`, value);
  });
  return finalUrl;
}; 