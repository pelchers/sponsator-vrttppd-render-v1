# Stripe Implementation Guide

## 1. Initial Setup

### Install Dependencies
```bash
# Client-side
npm install @stripe/stripe-js

# Server-side
npm install stripe
```

### Environment Variables
```env
# .env.local (client)
VITE_STRIPE_PUBLIC_KEY=pk_test_...

# .env (server)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

## 2. Server-Side Setup

### Initialize Stripe
```typescript
// server/src/lib/stripe.ts
import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
  typescript: true,
});
```

### Database Schema Updates
```prisma
// prisma/schema.prisma
model User {
  // ... existing fields
  stripeCustomerId     String?
  subscriptionId       String?
  subscriptionStatus   String?  // 'active', 'past_due', 'canceled', etc.
  subscriptionTier     String?  // 'basic', 'pro', 'enterprise'
  subscriptionEndDate  DateTime?
  paymentMethodId      String?
}

model SubscriptionPlan {
  id          String   @id @default(uuid())
  stripePriceId String
  name        String
  description String
  price       Float
  interval    String   // 'month' or 'year'
  features    String[]
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model PaymentHistory {
  id          String   @id @default(uuid())
  userId      String
  amount      Float
  status      String
  stripePaymentId String
  createdAt   DateTime @default(now())
  user        User     @relation(fields: [userId], references: [id])
}
```

### Stripe Controllers
```typescript
// server/src/controllers/stripeController.ts
import { stripe } from '../lib/stripe';
import { prisma } from '../lib/prisma';

export const createCheckoutSession = async (req: Request, res: Response) => {
  try {
    const { priceId, userId } = req.body;
    const user = await prisma.user.findUnique({ where: { id: userId } });

    // Create or get Stripe customer
    let customerId = user.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { userId }
      });
      customerId = customer.id;
      await prisma.user.update({
        where: { id: userId },
        data: { stripeCustomerId: customerId }
      });
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [{
        price: priceId,
        quantity: 1,
      }],
      mode: 'subscription',
      success_url: `${process.env.CLIENT_URL}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/subscription/cancel`,
      metadata: { userId }
    });

    res.json({ sessionId: session.id });
  } catch (error) {
    console.error('Checkout session error:', error);
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
};

export const handleWebhook = async (req: Request, res: Response) => {
  const sig = req.headers['stripe-signature']!;
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle different event types
  switch (event.type) {
    case 'customer.subscription.created':
    case 'customer.subscription.updated':
      const subscription = event.data.object;
      await updateSubscriptionStatus(subscription);
      break;

    case 'customer.subscription.deleted':
      await handleSubscriptionCanceled(event.data.object);
      break;

    case 'invoice.payment_failed':
      await handleFailedPayment(event.data.object);
      break;
  }

  res.json({ received: true });
};

async function updateSubscriptionStatus(subscription: Stripe.Subscription) {
  const { customer, status, items } = subscription;
  const customerId = typeof customer === 'string' ? customer : customer.id;

  const user = await prisma.user.findFirst({
    where: { stripeCustomerId: customerId }
  });

  if (!user) return;

  // Get price ID from subscription
  const priceId = items.data[0].price.id;
  const tier = getTierFromPriceId(priceId); // Helper function to map price to tier

  await prisma.user.update({
    where: { id: user.id },
    data: {
      subscriptionId: subscription.id,
      subscriptionStatus: status,
      subscriptionTier: tier,
      subscriptionEndDate: new Date(subscription.current_period_end * 1000)
    }
  });
}
```

## 3. Client-Side Implementation

### Stripe Context
```typescript
// client/src/contexts/StripeContext.tsx
import { createContext, useContext, useEffect, useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

export const StripeContext = createContext<{
  createCheckoutSession: (priceId: string) => Promise<void>;
}>({
  createCheckoutSession: async () => {},
});

export const StripeProvider = ({ children }: { children: React.ReactNode }) => {
  const createCheckoutSession = async (priceId: string) => {
    try {
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ priceId }),
      });

      const { sessionId } = await response.json();
      const stripe = await stripePromise;
      
      // Redirect to Checkout
      const { error } = await stripe!.redirectToCheckout({ sessionId });
      
      if (error) {
        console.error('Stripe checkout error:', error);
      }
    } catch (error) {
      console.error('Failed to create checkout session:', error);
    }
  };

  return (
    <StripeContext.Provider value={{ createCheckoutSession }}>
      {children}
    </StripeContext.Provider>
  );
};
```

### Subscription Components

```typescript
// client/src/components/subscription/PricingCard.tsx
import { useStripe } from '@/contexts/StripeContext';

interface PricingCardProps {
  tier: string;
  price: number;
  features: string[];
  stripePriceId: string;
}

export const PricingCard = ({ tier, price, features, stripePriceId }: PricingCardProps) => {
  const { createCheckoutSession } = useStripe();

  return (
    <div className="p-6 border rounded-lg">
      <h3 className="text-xl font-bold">{tier}</h3>
      <p className="text-2xl font-bold">${price}/mo</p>
      <ul className="mt-4">
        {features.map((feature, index) => (
          <li key={index} className="flex items-center gap-2">
            <CheckIcon /> {feature}
          </li>
        ))}
      </ul>
      <button
        onClick={() => createCheckoutSession(stripePriceId)}
        className="w-full mt-6 px-4 py-2 bg-blue-500 text-white rounded"
      >
        Subscribe
      </button>
    </div>
  );
};
```

### Subscription Management
```typescript
// client/src/pages/account/Subscription.tsx
import { useSubscription } from '@/hooks/useSubscription';

export default function SubscriptionPage() {
  const { subscriptionTier, subscriptionStatus, subscriptionEndDate } = useSubscription();

  const handleCancelSubscription = async () => {
    try {
      await fetch('/api/cancel-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      // Handle cancellation UI update
    } catch (error) {
      console.error('Failed to cancel subscription:', error);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Subscription Management</h1>
      
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="mb-4">
          <h2 className="font-bold">Current Plan</h2>
          <p>{subscriptionTier || 'No active subscription'}</p>
        </div>

        <div className="mb-4">
          <h2 className="font-bold">Status</h2>
          <p>{subscriptionStatus}</p>
        </div>

        {subscriptionEndDate && (
          <div className="mb-4">
            <h2 className="font-bold">Renewal Date</h2>
            <p>{new Date(subscriptionEndDate).toLocaleDateString()}</p>
          </div>
        )}

        {subscriptionStatus === 'active' && (
          <button
            onClick={handleCancelSubscription}
            className="px-4 py-2 bg-red-500 text-white rounded"
          >
            Cancel Subscription
          </button>
        )}
      </div>
    </div>
  );
}
```

## 4. Testing

### Test Cards
```typescript
const TEST_CARDS = {
  success: '4242424242424242',
  failedPayment: '4000000000000341',
  requiresAuth: '4000002500003155',
};
```

### Webhook Testing
```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Start webhook forwarding
stripe listen --forward-to localhost:4100/api/webhook
```

## 5. Error Handling

```typescript
// server/src/utils/stripeErrors.ts
export const handleStripeError = (error: any) => {
  switch (error.type) {
    case 'StripeCardError':
      return {
        message: 'Your card was declined',
        code: 'card_declined'
      };
    case 'StripeInvalidRequestError':
      return {
        message: 'Invalid parameters were supplied to Stripe\'s API',
        code: 'invalid_request'
      };
    default:
      return {
        message: 'An unexpected error occurred',
        code: 'unknown'
      };
  }
};
```

## Notes

1. **Security**
   - Never log full card details
   - Use Stripe Elements for secure card collection
   - Validate webhook signatures
   - Use environment variables for keys

2. **Error Handling**
   - Handle failed payments gracefully
   - Implement retry logic for webhooks
   - Monitor subscription status changes

3. **User Experience**
   - Clear pricing information
   - Smooth checkout flow
   - Easy subscription management
   - Clear feedback on payment status

4. **Monitoring**
   - Set up Stripe Dashboard alerts
   - Monitor webhook delivery
   - Track failed payments
   - Monitor subscription churn 

## 6. Integration with Gate Components

### Subscription Gates
We use three components to protect content based on subscription status:

```typescript
// client/src/components/subscription/SubscriptionModal.tsx
// Modal component used by SubscriptionGateModal
interface SubscriptionModalProps {
  feature?: string;
  requiredTier?: string;
  onClose: () => void;
}

export const SubscriptionModal = ({ feature, requiredTier, onClose }: SubscriptionModalProps) => {
  const { createCheckoutSession } = useStripe();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
        <div className="flex justify-between items-start">
          <h2 className="text-2xl font-bold text-gray-800">
            Subscription Required
          </h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>
        
        <div className="mt-4">
          <p className="text-gray-600">
            {feature && requiredTier 
              ? `The ${feature} feature requires a ${requiredTier} subscription.`
              : 'This feature requires a subscription.'}
          </p>
        </div>

        <div className="mt-6 flex gap-4">
          <a 
            href="/subscriptions" 
            className="w-full text-center px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            View Plans
          </a>
          <button
            onClick={onClose}
            className="w-full px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

// client/src/components/subscription/SubscriptionGatePage.tsx
// For protecting entire pages
export const SubscriptionGatePage = ({ children, requiredTier, pageName }: SubscriptionGatePageProps) => {
  const { isAuthenticated } = useAuth();
  const { subscriptionTier, isSubscribed } = useSubscription();

  if (!isAuthenticated) {
    return <AuthenticationRequired />;
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
              className="w-full inline-block text-center px-4 py-2 bg-blue-500 text-white rounded"
            >
              View Plans
            </a>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

// client/src/components/subscription/SubscriptionGateModal.tsx
// For protecting specific features
export const SubscriptionGateModal = ({ children, feature, requiredTier }: SubscriptionGateModalProps) => {
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

    return children;
  };

  return (
    <>
      <div onClick={handleAction}>
        {children}
      </div>

      {showModal && (
        <SubscriptionModal
          feature={feature}
          requiredTier={requiredTier}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
};
```

### Component Relationships

```typescript
// How the components work together:

SubscriptionGateModal
      ↓
  uses when needed
      ↓
SubscriptionModal
      ↓
redirects to subscription page
      ↓
Stripe Checkout
      ↓
updates subscription status
      ↓
gates update automatically
```

### Usage with Stripe

1. **Page Protection**
```typescript
// Example premium page
export default function PremiumContent() {
  return (
    <SubscriptionGatePage 
      requiredTier="pro"
      pageName="Premium Content"
    >
      <div className="container mx-auto py-8">
        <h1>Premium Content</h1>
        {/* Premium content here */}
      </div>
    </SubscriptionGatePage>
  );
}
```

2. **Feature Protection**
```typescript
// Example premium feature
export function AdvancedAnalytics() {
  const { createCheckoutSession } = useStripe();
  
  return (
    <SubscriptionGateModal 
      feature="advanced-analytics"
      requiredTier="pro"
    >
      <button 
        className="btn"
        onClick={() => handleAnalyticsClick()}
      >
        View Advanced Analytics
      </button>
    </SubscriptionGateModal>
  );
}
```

### Subscription Flow

1. User encounters gated content
2. If not subscribed:
   - Page gate: Shows subscription required page
   - Feature gate: Shows modal
3. User clicks "View Plans" or "Subscribe"
4. Redirected to pricing page
5. Selects plan and proceeds to Stripe Checkout
6. After successful payment:
   - Stripe webhook updates user subscription status
   - Gates automatically update based on new status
   - User gains access to protected content

### Gate-Stripe Integration

```typescript
// client/src/hooks/useSubscription.ts
export const useSubscription = () => {
  const { user } = useAuth();
  const [checkingAccess, setCheckingAccess] = useState(false);

  const checkFeatureAccess = async (feature: string) => {
    setCheckingAccess(true);
    try {
      const response = await fetch(`/api/check-access/${feature}`);
      const { hasAccess, requiredTier } = await response.json();
      return { hasAccess, requiredTier };
    } catch (error) {
      console.error('Error checking feature access:', error);
      return { hasAccess: false };
    } finally {
      setCheckingAccess(false);
    }
  };

  return {
    isSubscribed: !!user?.subscription,
    subscriptionTier: user?.subscription?.tier,
    subscriptionStatus: user?.subscription?.status,
    checkFeatureAccess,
    checkingAccess
  };
};
```

### Error States

Handle various subscription states in gates:
```typescript
// Types of subscription states to handle
type SubscriptionStatus = 
  | 'active'
  | 'past_due'
  | 'canceled'
  | 'incomplete'
  | 'incomplete_expired';

// Example status check in gate
if (subscriptionStatus === 'past_due') {
  return (
    <PaymentRequired 
      message="Your payment is past due. Please update your payment method."
      actionButton={
        <UpdatePaymentButton onClick={() => handleUpdatePayment()} />
      }
    />
  );
}
``` 