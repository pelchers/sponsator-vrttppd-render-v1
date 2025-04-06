import { Navigate, useLocation } from 'react-router-dom';
import { ReactNode, useEffect, useState } from 'react';

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  
  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);
  }, []);
  
  // Show loading state while checking authentication
  if (isAuthenticated === null) {
    return <div>Loading...</div>;
  }
  
  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    // Save the current location for redirect after login
    return <Navigate to="/login" state={{ from: location.pathname }} />;
  }
  
  // Render children if authenticated
  return <>{children}</>;
};

export default ProtectedRoute; 