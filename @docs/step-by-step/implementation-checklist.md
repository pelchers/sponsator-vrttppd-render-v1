# Implementation Checklist

## 1. Comments System Implementation
- [ ] Follow comments-implementation.md guide
- [ ] Test comments on all content types (posts, articles, projects)
- [ ] Verify likes on comments work
- [ ] Test permissions and deletion

## 2. Page Routing & Access
- [ ] Update Home/Landing Page Routing
  - [ ] Make Landing page default for new/logged-out users
  - [ ] Make Home page default for logged-in users
  - [ ] Update navbar links accordingly

- [ ] Create Basic Public Pages
  - [ ] About (`/pages/about/About.tsx`)
  - [ ] FAQ (`/pages/faq/FAQ.tsx`)
  - [ ] Features (`/pages/features/Features.tsx`)
  - [ ] Testimonials (`/pages/testimonials/Testimonials.tsx`)
  - [ ] Subscriptions/Pricing (`/pages/subscriptions/Subscriptions.tsx`)

- [ ] Implement Route Protection
  - [ ] Create auth middleware for protected routes
  - [ ] Allow public access to:
    - [ ] Landing page
    - [ ] About page
    - [ ] FAQ page
    - [ ] Signup/Login pages
    - [ ] Testimonials page
    - [ ] Features page
    - [ ] Subscriptions/pricing page
  - [ ] Gate access to all other pages for:
    - [ ] Non-logged-in users
    - [ ] Non-subscribed users

## 3. Stripe Subscription Implementation
- [ ] Setup Stripe Account & Keys
- [ ] Update Database Schema
  - [ ] Add subscription-related fields to user model
  - [ ] Add subscription plans table
  - [ ] Add payment history table

- [ ] Implement Stripe Integration
  - [ ] Setup Stripe webhook handling
  - [ ] Create subscription checkout flow
  - [ ] Handle subscription status changes
  - [ ] Implement usage tracking if needed

- [ ] Create Subscription UI
  - [ ] Pricing page
  - [ ] Checkout flow
  - [ ] Subscription management dashboard
  - [ ] Payment history view

## 4. Style Guide Updates
- [ ] Review LandingTest page styles
- [ ] Update style-guide.md with:
  - [ ] New color schemes
  - [ ] Typography updates
  - [ ] Component variations
  - [ ] Animation standards
  - [ ] Layout patterns
  - [ ] Responsive design patterns

## 5. Database Updates
- [ ] Add subscription-related fields to users table:
```prisma
model users {
  // Existing fields...
  
  // Subscription fields
  stripe_customer_id    String?
  subscription_status   String?   @default("inactive")
  subscription_plan    String?
  subscription_end_date DateTime?
  trial_end_date       DateTime?
  is_trial             Boolean   @default(false)
  
  // Payment fields
  last_payment_date    DateTime?
  next_payment_date    DateTime?
  payment_method_id    String?
}

// New subscription-related models
model subscription_plans {
  id          String   @id @default(uuid())
  name        String
  description String?
  price       Float
  interval    String   // monthly, yearly
  features    String[] // Array of features included
  stripe_price_id String
  created_at  DateTime @default(now())
  updated_at  DateTime @updatedAt
}

model payment_history {
  id          String   @id @default(uuid())
  user_id     String
  amount      Float
  status      String
  stripe_payment_id String
  created_at  DateTime @default(now())
  
  user        users    @relation(fields: [user_id], references: [id])
}
```

## 6. Route Protection Implementation
```typescript
// Example auth middleware structure
export const authenticateUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    const decoded = verifyToken(token);
    req.user = decoded;
    
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

export const requireSubscription = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await prisma.users.findUnique({
      where: { id: req.user.id }
    });
    
    if (!user || user.subscription_status !== 'active') {
      return res.status(403).json({ message: 'Subscription required' });
    }
    
    next();
  } catch (error) {
    return res.status(500).json({ message: 'Server error' });
  }
};
```

## Priority Order
1. Comments System (core functionality)
2. Route Protection (security)
3. Basic Public Pages (user experience)
4. Stripe Integration (monetization)
5. Style Guide Updates (polish)

## Notes
- Each task should be tested thoroughly before moving to the next
- Document all changes in appropriate guides
- Update TypeScript types as needed
- Keep accessibility in mind for all new pages
- Follow existing patterns for consistency
- Consider writing tests for new functionality

Would you like me to expand on any of these sections or create additional guides for specific implementations? 