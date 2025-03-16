import { useAuth } from '@/hooks/useAuth';
import { useSubscription } from '@/hooks/useSubscription'; // We'll create this

interface SubscriptionGateProps {
  children: React.ReactNode;
  requiredTier?: 'basic' | 'pro' | 'enterprise'; // Optional tier requirement
}

export const SubscriptionGate = ({ children, requiredTier }: SubscriptionGateProps) => {
  const { isAuthenticated } = useAuth();
  const { subscriptionTier, isSubscribed } = useSubscription();

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
        <div className="p-8 bg-white rounded-lg shadow-md">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            Authentication Required
          </h1>
          <p className="text-gray-600">
            Please log in to access this content.
          </p>
        </div>
      </div>
    );
  }

  if (!isSubscribed || (requiredTier && subscriptionTier !== requiredTier)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
        <div className="p-8 bg-white rounded-lg shadow-md">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            Subscription Required
          </h1>
          <p className="text-gray-600">
            {requiredTier 
              ? `This content requires a ${requiredTier} subscription.`
              : 'Please subscribe to access this content.'}
          </p>
          <a href="/subscriptions" className="mt-4 inline-block px-4 py-2 bg-blue-500 text-white rounded">
            View Subscription Options
          </a>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}; 