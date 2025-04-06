import axios from 'axios';
import config from '../config';

const api = axios.create({
  baseURL: config.API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData extends LoginCredentials {
  username: string;
}

interface AuthResponse {
  user: any;
  token: string;
}

// Login user
export async function login(credentials: LoginCredentials): Promise<AuthResponse> {
  try {
    // Log the API URL for debugging
    console.log('Login attempt with URL:', `${config.API_URL}/login`);
    
    // Use the correct endpoint path
    const response = await api.post('/login', credentials);
    
    if (response.data && response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('userId', response.data.user.id);
    }
    
    return response.data;
  } catch (error) {
    console.error('Login error:', error);
    throw new Error('Login failed');
  }
}

// Register new user
export async function register(data: RegisterData): Promise<AuthResponse> {
  try {
    const response = await api.post('/register', data);
    
    if (response.data && response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('userId', response.data.user.id);
    }
    
    return response.data;
  } catch (error) {
    console.error('Registration error:', error);
    throw new Error('Registration failed');
  }
}

// Logout user
export function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('userId');
}

// Check if user is authenticated
export function isAuthenticated(): boolean {
  return !!localStorage.getItem('token');
}

// Get current user
export function getCurrentUser() {
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
}

// Get auth token
export function getToken(): string | null {
  return localStorage.getItem('token');
}

export const fetchUserProfile = async (userId, token) => {
  try {
    const response = await api.get(`/users/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
}; 