import { useAuth } from '@/hooks/useAuth';
import { useSubscription } from '@/hooks/useSubscription';

interface SubscriptionGatePageProps {
  children: React.ReactNode;
  requiredTier?: 'basic' | 'pro' | 'enterprise';
  pageName?: string;
}

export const SubscriptionGatePage = ({ children, requiredTier, pageName }: SubscriptionGatePageProps) => {
  const { isAuthenticated } = useAuth();
  const { subscriptionTier, isSubscribed } = useSubscription();

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

  if (!isSubscribed || (requiredTier && subscriptionTier !== requiredTier)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
        <div className="p-8 bg-white rounded-lg shadow-md max-w-md w-full mx-4">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            Subscription Required
          </h1>
          <p className="text-gray-600">
            {requiredTier 
              ? `This page requires a ${requiredTier} subscription.`
              : 'Please subscribe to access this page.'}
          </p>
          <div className="mt-6">
            <a 
              href="/subscriptions" 
              className="w-full inline-block text-center px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              View Subscription Options
            </a>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}; 