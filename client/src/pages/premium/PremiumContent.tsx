import { SubscriptionGate } from '@/components/subscription/SubscriptionGate';

export default function PremiumContent() {
  return (
    <SubscriptionGate requiredTier="pro">
      {/* Premium content here */}
    </SubscriptionGate>
  );
} 