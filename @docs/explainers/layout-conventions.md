# Layout Conventions

## Overview

This document explains the layout system used in our application, including the component hierarchy, folder structure, and best practices for creating consistent layouts across the application.

🌟 **New Dev Friendly Explanation**:
Our layout system is like a set of nested containers that organize content on the page. Think of it as a series of boxes inside boxes - the outermost box is the layout, which contains sections, which contain components. This structure makes it easy to maintain consistent spacing, alignment, and responsive behavior across the application.

## Component Hierarchy

```
Layout
  └── SectionFull (full-width sections)
      └── Navbar (navigation component)
  └── Main Content Area
      └── Various page components
```

This hierarchy creates a consistent structure where:
1. The `Layout` component provides the overall page structure
2. `SectionFull` components create full-width areas
3. Specialized components like `Navbar` provide specific functionality
4. The main content area renders the current page's content

## Understanding Children Props

### What are Props?

Props (short for "properties") are how React components receive data from their parent components. They are passed as attributes in JSX:

```jsx
<Button color="blue" size="large">Click Me</Button>
```

In this example, `color` and `size` are props passed to the `Button` component.

### What is the Children Prop?

The `children` prop is a special prop in React that allows components to render content passed between their opening and closing tags:

```jsx
<Layout>
  <h1>Welcome to our app</h1>
  <p>This content will be passed as the "children" prop</p>
</Layout>
```

In this example, the `<h1>` and `<p>` elements become the `children` prop of the `Layout` component.

### How to Implement Children Props

To use the children prop in your component:

1. Include `children` in your component's props interface:
   ```tsx
   interface LayoutProps {
     children: React.ReactNode;
   }
   ```

2. Render the children where you want them to appear:
   ```tsx
   export default function Layout({ children }: LayoutProps) {
     return (
       <div className="container">
         <header>My App</header>
         <main>{children}</main>
         <footer>© 2023</footer>
       </div>
     );
   }
   ```

The `React.ReactNode` type is used because children can be almost anything: elements, strings, numbers, arrays, or even functions.

### Why Children Props are Important for Layouts

Children props are especially important for layout components because they:

1. Enable component composition (nesting components within each other)
2. Allow layout components to wrap and structure content without knowing what that content will be
3. Create a clear separation between structure (layout) and content (pages)
4. Make layouts reusable across different pages with different content

## Folder Structure

```
src/
├── components/
│   ├── layout/           # Layout components
│   │   └── layout.tsx    # Main layout wrapper
│   ├── navigation/       # Navigation components
│   │   └── navbar.tsx    # Main navigation bar
│   └── sections/         # Section components
│       └── section-full.tsx  # Full-width section
├── pages/                # Page components
│   ├── HomePage.tsx      # Home page
│   └── ProfilePage.tsx   # Profile page
└── router/
    └── index.tsx         # Router configuration
```

Each folder has a specific purpose:
- `layout/`: Contains components that define the overall page structure
- `navigation/`: Contains components for navigation (navbar, sidebar, etc.)
- `sections/`: Contains components that define content sections within layouts
- `pages/`: Contains page components that represent specific routes

## Page Files vs Layout Files

### Page Files

**Purpose**: Page files represent specific routes or views in your application.

**Characteristics**:
- Contain the actual content specific to a particular route
- Are rendered inside layout components
- Handle page-specific logic and state
- Often fetch and display data relevant to that page
- Map directly to routes in your router configuration

**Example**:
```tsx
// src/pages/ProfilePage.tsx
import { useState, useEffect } from "react";
import Layout from "@/components/layout/layout";
import UserProfile from "@/components/profile/UserProfile";
import { fetchUserData } from "@/api/users";

export default function ProfilePage() {
  const [userData, setUserData] = useState(null);
  
  useEffect(() => {
    fetchUserData().then(data => setUserData(data));
  }, []);
  
  return (
    <Layout>
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold">User Profile</h1>
        {userData ? (
          <UserProfile user={userData} />
        ) : (
          <p>Loading profile...</p>
        )}
      </div>
    </Layout>
  );
}
```

### Layout Files

**Purpose**: Layout files define the structure and arrangement of UI elements that remain consistent across multiple pages.

**Characteristics**:
- Provide a consistent structure for multiple pages
- Handle navigation, headers, footers, sidebars
- Don't contain page-specific content
- Accept `children` props to render page content
- Focus on structure rather than content

**Example**:
```tsx
// src/components/layout/layout.tsx
import Navbar from "@/components/navigation/navbar";
import SectionFull from "@/components/sections/section-full";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <SectionFull>
        <Navbar />
      </SectionFull>
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}
```

### Key Differences

1. **Content vs Structure**
   - Pages contain specific content for a route
   - Layouts define the structure around that content

2. **Reusability**
   - Pages are typically used for a single route
   - Layouts are reused across multiple pages

3. **Responsibility**
   - Pages handle data fetching and page-specific logic
   - Layouts handle consistent UI elements and navigation

4. **Composition**
   - Pages are composed within layouts
   - Layouts accept pages as children

Think of layouts as picture frames and pages as the pictures themselves. The frame (layout) provides structure and consistency, while the picture (page) contains the unique content that changes from route to route.

## Component Definitions

### Layout Component

The `Layout` component serves as the main wrapper for all pages, providing consistent structure:

```tsx
// src/components/layout/layout.tsx
import Navbar from "@/components/navigation/navbar";
import SectionFull from "@/components/sections/section-full";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <SectionFull>
        <Navbar />
      </SectionFull>
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}
```

Key features:
- Wraps the entire page content
- Includes the navbar in a full-width section
- Provides a main content area for page-specific content
- Uses flexbox for layout structure

### SectionFull Component

The `SectionFull` component creates a full-width container:

```tsx
// src/components/sections/section-full.tsx
import React from "react";

interface SectionFullProps {
  children: React.ReactNode;
  className?: string;
}

export default function SectionFull({ children, className = "" }: SectionFullProps) {
  return (
    <section className={`w-full ${className}`}>
      {children}
    </section>
  );
}
```

Key features:
- Creates a container that spans the full width of the viewport
- Accepts additional classes for customization
- Simple and focused on a single responsibility

### Navbar Component

The `Navbar` component provides navigation functionality:

```tsx
// src/components/navigation/navbar.tsx
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Menu } from "lucide-react";
import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background shadow-sm">
      <div className="container mx-auto h-16 px-4 flex items-center justify-between">
        <Link to="/" className="font-bold text-xl">
          My App
        </Link>
        
        <div className="flex items-center space-x-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem>
                <Link to="/" className="w-full">Home</Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Link to="/landing" className="w-full">Landing Page</Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Link to="/app" className="w-full">App</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  );
}
```

Key features:
- Provides navigation links
- Uses shadcn components for styling
- Implements responsive design patterns
- Includes dropdown menu for additional links

## Usage in Pages

To use the layout system in a page component:

```tsx
// src/pages/HomePage.tsx
import Layout from "@/components/layout/layout";

export default function HomePage() {
  return (
    <Layout>
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold">Welcome to the Home Page</h1>
        <p className="mt-4">This is the home page content.</p>
      </div>
    </Layout>
  );
}
```

## Integration with Router

The layout system integrates with React Router:

```tsx
// src/router/index.tsx
import { createBrowserRouter } from 'react-router-dom';
import HomePage from '@/pages/HomePage';
import ProfilePage from '@/pages/ProfilePage';

export const router = createBrowserRouter([
  {
    path: "/",
    element: <HomePage />,
  },
  {
    path: "/profile",
    element: <ProfilePage />,
  },
]);
```

Each page component wraps itself in the appropriate layout, allowing for different layouts per route if needed.

## Layout Variations

The system supports multiple layout variations:

### 1. Standard Layout (shown above)
- Navbar at the top
- Full-width content area

### 2. Dashboard Layout (example)
```tsx
// src/components/layout/dashboard-layout.tsx
import Navbar from "@/components/navigation/navbar";
import Sidebar from "@/components/navigation/sidebar";
import SectionFull from "@/components/sections/section-full";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <SectionFull>
        <Navbar />
      </SectionFull>
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-4">
          {children}
        </main>
      </div>
    </div>
  );
}
```

### 3. Auth Layout (example)
```tsx
// src/components/layout/auth-layout.tsx
import { Link } from "react-router-dom";

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
}

export default function AuthLayout({ children, title }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full p-6 bg-white rounded-lg shadow-md">
        <div className="text-center mb-6">
          <Link to="/" className="text-2xl font-bold">
            My App
          </Link>
          <h1 className="text-xl font-semibold mt-2">{title}</h1>
        </div>
        {children}
      </div>
    </div>
  );
}
```

## Best Practices

1. **Consistent Container Usage**
   - Use the `container` class for centered, width-constrained content
   - Example: `<div className="container mx-auto px-4">`

2. **Responsive Considerations**
   - Design layouts to work on all screen sizes
   - Use Tailwind's responsive prefixes (sm:, md:, lg:, etc.)
   - Test layouts on multiple device sizes

3. **Component Composition**
   - Keep layout components focused on structure, not content
   - Compose smaller components to build complex layouts
   - Use props to customize layout behavior when needed

4. **Semantic HTML**
   - Use appropriate HTML elements (`<header>`, `<main>`, `<footer>`, etc.)
   - Ensure proper accessibility attributes
   - Maintain logical document structure

5. **Layout Consistency**
   - Maintain consistent spacing using Tailwind's spacing scale
   - Use the same layout components across similar pages
   - Create new layout variations only when necessary

## Common Layout Patterns

### Content with Sidebar
```tsx
<div className="flex flex-col md:flex-row">
  <aside className="w-full md:w-64 p-4 border-r">
    {/* Sidebar content */}
  </aside>
  <main className="flex-1 p-4">
    {/* Main content */}
  </main>
</div>
```

### Card Grid
```tsx
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
  {items.map(item => (
    <Card key={item.id} item={item} />
  ))}
</div>
```

### Two-Column Layout
```tsx
<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
  <div>
    {/* Left column */}
  </div>
  <div>
    {/* Right column */}
  </div>
</div>
```

## Summary

Our layout system provides a structured approach to page composition through:

1. A clear component hierarchy (Layout → Sections → Content)
2. Organized folder structure (layout/, navigation/, sections/)
3. Reusable, composable components
4. Consistent styling with Tailwind CSS
5. Support for multiple layout variations
6. Clear separation between page content and layout structure

By following these conventions, we maintain a consistent user experience across the application while allowing for flexibility in page design. 