# Authentication Routing Implementation Guide

## Current Auth Utilities
We already have:
- `useAuth` hook in `client/src/hooks/useAuth.ts`
- Auth API in `client/src/api/auth.ts`
- Basic routing in `client/src/router/index.tsx`

## Auth Gate Components

We have two components for handling auth protection:

### 1. AuthGatePage
For full-page protection:
```typescript
import { AuthGatePage } from '@/components/auth/AuthGatePage';

export default function ProtectedPage() {
  return (
    <AuthGatePage pageName="Protected Content">
      <div className="container mx-auto py-8">
        <h1>Protected Content</h1>
        {/* Page content */}
      </div>
    </AuthGatePage>
  );
}
```

### 2. AuthGateModal
For feature-level protection:
```typescript
import { AuthGateModal } from '@/components/auth/AuthGateModal';

export function ProtectedFeature() {
  return (
    <AuthGateModal feature="commenting">
      <button className="btn">
        Add Comment
      </button>
    </AuthGateModal>
  );
}
```

## Implementation Strategy

### 1. Default Route Protection
Update router for basic landing/home page routing:

```typescript
export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        index: true,
        element: <Navigate to="/landing" replace />
      },
      {
        path: 'landing',
        element: <Landing />  // Public
      },
      {
        path: 'home',
        element: <AuthGatePage><Home /></AuthGatePage>  // Protected
      }
    ]
  }
]);
```

### 2. Protecting Pages
Use `AuthGatePage` for any page requiring authentication:
```typescript
// Example protected dashboard
export default function Dashboard() {
  return (
    <AuthGatePage pageName="Dashboard">
      <DashboardContent />
    </AuthGatePage>
  );
}
```

### 3. Protecting Features
Use `AuthGateModal` for interactive features:
```typescript
// Example protected feature
export function CommentSection() {
  return (
    <AuthGateModal feature="commenting">
      <CommentForm />
    </AuthGateModal>
  );
}
```

## Public vs Protected Content

### Public Pages (No Gate Required)
- Landing page
- About page
- FAQ page
- Login/Signup pages
- Features page
- Pricing page

### Protected Pages (Use AuthGatePage)
- Dashboard
- Profile
- Settings
- Any user-specific content

### Protected Features (Use AuthGateModal)
- Commenting
- Liking
- Following
- Any interactive features

## Benefits

1. **Simple Implementation**
   - Component-based protection
   - No complex route configuration
   - Easy to add/remove protection

2. **Flexible Protection**
   - Full page protection with `AuthGatePage`
   - Feature-level protection with `AuthGateModal`
   - Clear user feedback

3. **Consistent UX**
   - Standard auth messages
   - Clear login prompts
   - Non-disruptive modals

## Testing Checklist

- [ ] Public pages accessible to all
- [ ] Protected pages show auth gate when logged out
- [ ] Protected features show modal when clicked
- [ ] Login links work correctly
- [ ] Auth state properly maintained

## Notes

- Use `AuthGatePage` for full pages needing protection
- Use `AuthGateModal` for interactive features
- Keep public routes simple and accessible
- Maintain consistent user experience 