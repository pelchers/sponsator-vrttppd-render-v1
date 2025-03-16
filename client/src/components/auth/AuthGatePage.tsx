import { useAuth } from '@/hooks/useAuth';

interface AuthGatePageProps {
  children: React.ReactNode;
  pageName?: string;
}

export const AuthGatePage = ({ children, pageName }: AuthGatePageProps) => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
        <div className="p-8 bg-white rounded-lg shadow-md max-w-md w-full mx-4">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            Authentication Required
          </h1>
          <p className="text-gray-600">
            Please log in to {pageName ? `access ${pageName}` : 'view this page'}.
          </p>
          <div className="mt-6">
            <a 
              href="/login" 
              className="w-full inline-block text-center px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Log In
            </a>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}; 