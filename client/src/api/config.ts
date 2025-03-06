export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4100/api';

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
  }
}; 