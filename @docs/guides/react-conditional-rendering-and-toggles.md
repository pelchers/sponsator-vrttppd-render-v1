# React Conditional Rendering and Toggle Guide

## Basic Conditional Rendering

### 1. Using && (Logical AND) (Best for: Simple show/hide toggles)
```typescript
// Only renders if condition is true
{isVisible && <Component />}
```
The `&&` operator works because:
- If first value is false, returns first value (nothing renders)
- If first value is true, returns second value (component renders)

### 2. Using Ternary Operator (? :) (Best for: Two alternative views)
```typescript
// Renders one of two options
{isVisible ? <Component /> : <AlternativeComponent />}
```

### 3. Using Multiple Conditions (Best for: Feature flags & environment checks)
```typescript
{(isVisible && isEnabled) && <Component />}
```

### 4. Using Early Returns (Best for: Auth-based page rendering)
```typescript
// From our landing page implementation
const LandingPage = () => {
  const userId = localStorage.getItem('userId');
  const [userStats, setUserStats] = useState<UserStats | null>(null);

  // Early return for authenticated users
  if (userId && isAuthenticated() && userStats) {
    return (
      <div className="min-h-screen w-full bg-gray-50">
        <AuthenticatedDashboard userStats={userStats} />
      </div>
    );
  }

  // Default return for non-authenticated users
  return (
    <div className="min-h-screen flex flex-col">
      <PublicLanding />
    </div>
  );
};
```

### 5. Using Permission Checks (Best for: User-specific actions)
```typescript
// From our article page implementation
const ArticlePage = () => {
  const { id } = useParams();
  const currentUser = getCurrentUser();
  const isOwner = currentUser?.id === article.user_id;

  return (
    <div className="article-container">
      <Article article={article} />
      
      {/* Edit button only shows for article owner */}
      {isOwner && (
        <Button
          onClick={() => navigate(`/article/edit/${id}`)}
          className="bg-spring text-black px-6 py-2 rounded-full border-2 border-black"
        >
          Edit Article
        </Button>
      )}

      {/* Comments section with permission check */}
      <CommentsSection 
        entityType="article"
        entityId={id}
      />
    </div>
  );
};
```

### 6. Subscription-Based Toggle (Best for: Feature gating & access levels)
```typescript
// Types for subscription levels
type SubscriptionTier = 'free' | 'pro' | 'enterprise';

// Helper to check subscription access
const hasSubscriptionAccess = (
  userTier: SubscriptionTier,
  requiredTier: SubscriptionTier
): boolean => {
  const tiers: SubscriptionTier[] = ['free', 'pro', 'enterprise'];
  const userLevel = tiers.indexOf(userTier);
  const requiredLevel = tiers.indexOf(requiredTier);
  return userLevel >= requiredLevel;
};

// Component with tiered access
const ProjectFeatures = () => {
  const user = getCurrentUser();
  const userTier = user?.subscription_tier || 'free';

  return (
    <div className="features-container">
      {/* Basic features - available to all */}
      <BasicFeatures />

      {/* Pro features */}
      {hasSubscriptionAccess(userTier, 'pro') && (
        <div className="pro-features">
          <AdvancedAnalytics />
          <CustomBranding />
        </div>
      )}

      {/* Enterprise features */}
      {hasSubscriptionAccess(userTier, 'enterprise') && (
        <div className="enterprise-features">
          <TeamManagement />
          <ApiAccess />
        </div>
      )}

      {/* Feature-specific checks */}
      {userTier === 'enterprise' ? (
        <UnlimitedProjects />
      ) : (
        <ProjectLimitWarning />
      )}

      {/* Upgrade prompts */}
      {userTier === 'free' && (
        <UpgradePrompt 
          currentTier={userTier}
          features={proFeatures}
          targetTier="pro"
        />
      )}

      {userTier === 'pro' && (
        <UpgradePrompt
          currentTier={userTier}
          features={enterpriseFeatures}
          targetTier="enterprise"
        />
      )}
    </div>
  );
};


```

## Toggle Implementation Patterns

### 1. Basic Boolean Toggle (Best for: Simple show/hide UI elements)
```typescript
const [isVisible, setIsVisible] = useState(false);

// Toggle section visibility
{isVisible && (
  <section>
    Content here...
  </section>
)}

// Toggle button
<button onClick={() => setIsVisible(!isVisible)}>
  Toggle Section
</button>
```

### 2. Feature Flag Toggle (Best for: Beta features & A/B testing)
```typescript
// Like our waitlist implementation
const SHOW_WAITLIST = false;  // Feature flag

// In component
{SHOW_WAITLIST && (
  <section className="waitlist-section">
    {/* Waitlist content */}
  </section>
)}
```

### 3. Multi-State Toggle (Best for: Complex UI states)
```typescript
type DisplayMode = 'hidden' | 'preview' | 'full';
const [displayMode, setDisplayMode] = useState<DisplayMode>('hidden');

// Usage
{displayMode === 'preview' && <PreviewContent />}
{displayMode === 'full' && <FullContent />}
```

### 4. Auth-Based Toggle (Best for: Protected content & routes)
```typescript
// From our router implementation
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  return isAuthenticated ? children : null;
};

// Usage in router
<Routes>
  <Route path="/" element={<PublicPage />} />
  <Route 
    path="/article/edit/:id" 
    element={
      <ProtectedRoute>
        <ArticleEditPage />
      </ProtectedRoute>
    } 
  />
</Routes>
```

### 5. Permission-Based Toggle (Best for: User-specific actions & content)
```typescript
// From our comments implementation
const CommentInput = ({ entityId, entityType }: CommentInputProps) => {
  const currentUser = getCurrentUser();
  const canComment = !!currentUser;

  return (
    <div className="comment-input">
      {canComment ? (
        <form onSubmit={handleSubmit}>
          <textarea 
            value={comment} 
            onChange={(e) => setComment(e.target.value)}
            placeholder="Write a comment..."
          />
          <Button type="submit">Post Comment</Button>
        </form>
      ) : (
        <div className="login-prompt">
          <Link to="/login">Log in to comment</Link>
        </div>
      )}
    </div>
  );
};
```

### 6. Subscription-Based Toggle (Best for: Feature gating & access levels)
```typescript
// Usage in routes
const ProtectedFeatureRoute = ({ 
  children, 
  requiredTier 
}: { 
  children: React.ReactNode;
  requiredTier: SubscriptionTier;
}) => {
  const user = getCurrentUser();
  const userTier = user?.subscription_tier || 'free';
  const navigate = useNavigate();

  useEffect(() => {
    if (!hasSubscriptionAccess(userTier, requiredTier)) {
      navigate('/upgrade');
    }
  }, [userTier, requiredTier, navigate]);

  return hasSubscriptionAccess(userTier, requiredTier) ? children : null;
};

// Router implementation
<Routes>
  <Route path="/basic" element={<BasicFeatures />} />
  <Route 
    path="/pro-features" 
    element={
      <ProtectedFeatureRoute requiredTier="pro">
        <ProFeatures />
      </ProtectedFeatureRoute>
    } 
  />
  <Route 
    path="/enterprise" 
    element={
      <ProtectedFeatureRoute requiredTier="enterprise">
        <EnterpriseFeatures />
      </ProtectedFeatureRoute>
    } 
  />
</Routes>
```

## Comparison Operators Guide

### 1. Equality Operators
```typescript
// Loose equality (type coercion)
a == b   // Checks value only
a != b   // Not equal (with coercion)

// Strict equality (no type coercion)
a === b  // Checks value AND type
a !== b  // Not equal (strict)
```

### 2. Common Patterns
```typescript
// Check for null or undefined
{value && <Component />}  // Only renders if value is truthy

// Check specific value
{type === 'admin' && <AdminPanel />}  // Strict equality check

// Multiple conditions
{(isAdmin && isLoggedIn) && <RestrictedContent />}
```

### 3. Best Practices
```typescript
// ✅ Good: Use strict equality
if (status === 'active') { }

// ❌ Bad: Avoid loose equality
if (status == 'active') { }

// ✅ Good: Null checks
{user?.name && <UserGreeting />}

// ✅ Good: Default values
{count ?? 0}  // Nullish coalescing
```

## Toggle Implementation Examples

### 1. Waitlist Toggle (Like in our app)
```typescript
// Feature flag at top of file
const SHOW_WAITLIST = false;

// In component
{SHOW_WAITLIST && (
  <section className="waitlist-section">
    {/* Waitlist content */}
  </section>
)}

// Alternative with replacement
{SHOW_WAITLIST ? (
  <section className="waitlist-section">
    {/* Waitlist content */}
  </section>
) : (
  <section className="signup-section">
    {/* Regular signup content */}
  </section>
)}
```

### 2. Environment-based Toggle
```typescript
// In config file
export const FEATURES = {
  SHOW_WAITLIST: process.env.REACT_APP_ENV === 'preview',
  SHOW_BETA: process.env.REACT_APP_ENV === 'staging'
};

// In component
{FEATURES.SHOW_WAITLIST && (
  <WaitlistSection />
)}
```

### 3. User Role Toggle
```typescript
const userHasAccess = user?.role === 'admin' || user?.role === 'moderator';

{userHasAccess && (
  <AdminPanel />
)}
```

## Common Gotchas

### 1. Falsy Values
```typescript
// ❌ Problem: 0 is falsy
{count && <Display />}  // Won't render when count is 0

// ✅ Solution: Explicit comparison
{count >= 0 && <Display />}
```

### 2. Undefined Properties
```typescript
// ❌ Problem: Potential undefined error
{user.name && <Greeting />}

// ✅ Solution: Optional chaining
{user?.name && <Greeting />}
```

### 3. Multiple Conditions
```typescript
// ❌ Hard to read
{isLoggedIn && hasPermission && !isLoading && <Component />}

// ✅ Better organization
const canShowComponent = isLoggedIn && hasPermission && !isLoading;
{canShowComponent && <Component />}
```

## Toggle State Management

### 1. Local Component State
```typescript
const [isVisible, setIsVisible] = useState(false);

// Toggle function
const toggleVisibility = () => setIsVisible(prev => !prev);

// Usage
<button onClick={toggleVisibility}>
  {isVisible ? 'Hide' : 'Show'}
</button>
```

### 2. Global Feature Flags
```typescript
// features.ts
export const FEATURES = {
  WAITLIST: false,
  BETA_FEATURES: false,
  NEW_UI: false
} as const;

// Component
import { FEATURES } from '@/config/features';

{FEATURES.WAITLIST && <WaitlistSection />}
```

### 3. Environment Variables
```typescript
// .env files
REACT_APP_SHOW_WAITLIST=true

// Usage
const showWaitlist = process.env.REACT_APP_SHOW_WAITLIST === 'true';
{showWaitlist && <WaitlistSection />}
```

Remember:
- Use `&&` for simple conditional rendering
- Use ternary (`?:`) when you need both true/false cases
- Use strict equality (`===`) for comparisons
- Consider environment and configuration for feature flags
- Keep toggle logic simple and readable 