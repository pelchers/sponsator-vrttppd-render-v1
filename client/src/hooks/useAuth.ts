import { useState, useEffect } from 'react';

// Simple auth hook that checks if user is logged in
export const useAuth = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    if (token) {
      // In a real app, you'd validate the token and get user info
      // For now, we'll just use a placeholder
      setUser({ id: 'current-user-id', username: 'Current User' });
    }
    setLoading(false);
  }, []);

  return { user, loading };
};

// Add this to your auth hook or wherever you handle authentication
export const getAuthToken = () => {
  const token = localStorage.getItem('token');
  if (!token) {
    console.error('No authentication token found');
    return null;
  }
  return token;
}; 