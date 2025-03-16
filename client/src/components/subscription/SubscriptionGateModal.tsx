import { useAuth } from '@/hooks/useAuth';
import { useSubscription } from '@/hooks/useSubscription';

interface SubscriptionGateModalProps {
  children: React.ReactNode;
  requiredTier?: 'basic' | 'pro' | 'enterprise';
  feature?: string; // Name of the feature being gated
}

export const SubscriptionGateModal = ({ children, requiredTier, feature }: SubscriptionGateModalProps) => {
  const { isAuthenticated } = useAuth();
  const { subscriptionTier, isSubscribed } = useSubscription();
  const [showModal, setShowModal] = useState(false);

  const handleAction = () => {
    if (!isAuthenticated) {
      setShowModal(true);
      return;
    }

    if (!isSubscribed || (requiredTier && subscriptionTier !== requiredTier)) {
      setShowModal(true);
      return;
    }

    // If we get here, user has proper access
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
                {!isAuthenticated ? 'Authentication Required' : 'Subscription Required'}
              </h2>
              <button 
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            
            <div className="mt-4">
              {!isAuthenticated ? (
                <p className="text-gray-600">
                  Please log in to {feature ? `use ${feature}` : 'access this feature'}.
                </p>
              ) : (
                <p className="text-gray-600">
                  {requiredTier 
                    ? `This feature requires a ${requiredTier} subscription.`
                    : 'Please subscribe to access this feature.'}
                </p>
              )}
            </div>

            <div className="mt-6 flex gap-4">
              {!isAuthenticated ? (
                <a 
                  href="/login" 
                  className="w-full text-center px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Log In
                </a>
              ) : (
                <a 
                  href="/subscriptions" 
                  className="w-full text-center px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  View Subscription Options
                </a>
              )}
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