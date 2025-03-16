import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';

interface AuthGateModalProps {
  children: React.ReactNode;
  feature?: string;
}

export const AuthGateModal = ({ children, feature }: AuthGateModalProps) => {
  const { isAuthenticated } = useAuth();
  const [showModal, setShowModal] = useState(false);

  const handleAction = () => {
    if (!isAuthenticated) {
      setShowModal(true);
      return;
    }

    // If authenticated, allow access to children
    return children;
  };

  return (
    <>
      <div onClick={handleAction}>
        {children}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
            <div className="flex justify-between items-start">
              <h2 className="text-2xl font-bold text-gray-800">
                Authentication Required
              </h2>
              <button 
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            
            <div className="mt-4">
              <p className="text-gray-600">
                Please log in to {feature ? `use ${feature}` : 'access this feature'}.
              </p>
            </div>

            <div className="mt-6 flex gap-4">
              <a 
                href="/login" 
                className="w-full text-center px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Log In
              </a>
              <button
                onClick={() => setShowModal(false)}
                className="w-full px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}; 