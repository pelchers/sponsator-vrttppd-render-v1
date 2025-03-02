# Project Architecture Explainer

## Overview

This document explains the overall architecture of our monorepo project, including the file structure, key components, and how they interact with each other.

🌟 **New Dev Friendly Explanation**:
Our project uses a monorepo structure, which means we keep both frontend (client) and backend (server) code in the same repository. This makes it easier to develop and deploy the entire application as a cohesive unit. The frontend is built with React, TypeScript, and Tailwind CSS, while the backend uses Express, TypeScript, and Prisma with PostgreSQL.

## Repository Structure

```
my-monorepo/
├── client/                 # Frontend React application
│   ├── src/                # Source code
│   │   ├── components/     # React components
│   │   │   ├── ui/         # UI components (shadcn)
│   │   │   ├── layout/     # Layout components
│   │   │   ├── sections/   # Section components
│   │   │   └── navigation/ # Navigation components
│   │   ├── pages/          # Page components
│   │   ├── router/         # React Router configuration
│   │   ├── lib/            # Utility functions
│   │   ├── api/            # API client functions
│   │   ├── contexts/       # React context providers
│   │   ├── types/          # TypeScript type definitions
│   │   ├── styles/         # CSS and style-related files
│   │   ├── App.tsx         # Main App component
│   │   └── main.tsx        # Entry point
│   ├── public/             # Static assets
│   ├── components.json     # shadcn components configuration
│   ├── tailwind.config.cjs # Tailwind CSS configuration
│   ├── vite.config.ts      # Vite configuration
│   └── package.json        # Frontend dependencies
│
├── server/                 # Backend Express application
│   ├── src/                # Source code
│   │   ├── controllers/    # Request handlers
│   │   ├── services/       # Business logic
│   │   ├── routes/         # API route definitions
│   │   ├── middlewares/    # Express middlewares
│   │   ├── utils/          # Utility functions
│   │   ├── types/          # TypeScript type definitions
│   │   └── index.ts        # Entry point
│   ├── prisma/             # Prisma ORM
│   │   └── schema.prisma   # Database schema
│   └── package.json        # Backend dependencies
│
├── @docs/                  # Project documentation
│   └── explainers/         # Detailed explanations of concepts
│
├── turbo.json              # Turborepo configuration
└── package.json            # Root dependencies and scripts
```

## Key Components and Their Interactions

### 1. Frontend (Client)

#### Component Structure

The frontend follows a hierarchical component structure:

```
Layout (layout.tsx)
  └── SectionFull (section-full.tsx)
      └── Navbar (navbar.tsx)
  └── Main Content
      └── Page Components (from pages/)
```

- **Layout Components** (`components/layout/`): Define the overall structure of pages
- **Section Components** (`components/sections/`): Define content sections within layouts
- **UI Components** (`components/ui/`): Reusable UI elements from shadcn
- **Navigation Components** (`components/navigation/`): Navigation-related components
- **Page Components** (`pages/`): Components that represent entire routes

#### Routing System

The routing system is defined in `router/index.tsx` using React Router:

```tsx
// client/src/router/index.tsx
import { createBrowserRouter } from 'react-router-dom';
import HomePage from '../pages/HomePage';
import UsersPage from '../pages/UsersPage';
// ...other imports

export const router = createBrowserRouter([
  {
    path: "/",
    element: <HomePage />,
  },
  {
    path: "/users",
    element: <UsersPage />,
  },
  // ...other routes
]);
```

#### API Communication

API client functions in the `api/` directory handle communication with the backend:

```tsx
// client/src/api/users.ts
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export async function fetchUsers(page = 1, limit = 10) {
  const response = await axios.get(`${API_URL}/users`, {
    params: { page, limit }
  });
  return response.data;
}
```

#### State Management

React Context is used for state management:

```tsx
// client/src/contexts/UserContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { fetchUsers } from '../api/users';

export const UserContext = createContext();

export function UserProvider({ children }) {
  const [users, setUsers] = useState([]);
  // ...other state

  // Fetch users on component mount
  useEffect(() => {
    fetchUsers().then(data => setUsers(data.users));
  }, []);

  return (
    <UserContext.Provider value={{ users, /* ...other values */ }}>
      {children}
    </UserContext.Provider>
  );
}
```

#### Styling

The project uses Tailwind CSS for styling, configured in `tailwind.config.cjs`:

```js
// client/tailwind.config.cjs
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      // Custom theme extensions
    },
  },
  plugins: [],
}
```

### 2. Backend (Server)

#### Express Application

The main Express application is defined in `index.ts`:

```typescript
// server/src/index.ts
import express from 'express';
import cors from 'cors';
import userRoutes from './routes/userRoutes';
// ...other imports

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api', userRoutes);
// ...other routes

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

#### Routes

Routes define the API endpoints:

```typescript
// server/src/routes/userRoutes.ts
import express from 'express';
import * as userController from '../controllers/userController';
import { authenticate } from '../middlewares/auth';

const router = express.Router();

router.get('/users', userController.getUsers);
router.get('/users/:id', userController.getUserById);
router.post('/users', authenticate, userController.createUser);
// ...other routes

export default router;
```

#### Controllers vs Services

**Controllers** handle HTTP requests and responses:

```typescript
// server/src/controllers/userController.ts
import { Request, Response } from 'express';
import * as userService from '../services/userService';

export async function getUsers(req: Request, res: Response) {
  try {
    const users = await userService.getAllUsers();
    res.json({ users });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users' });
  }
}
```

**Services** contain business logic and database operations:

```typescript
// server/src/services/userService.ts
import prisma from '../lib/prisma';

export async function getAllUsers() {
  return prisma.user.findMany({
    where: { isActive: true },
    orderBy: { joinDate: 'desc' }
  });
}
```

#### Database Connection

Prisma is used to connect to PostgreSQL:

```typescript
// server/prisma/schema.prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id        String   @id @default(uuid())
  name      String
  email     String   @unique
  // ...other fields
}
```

## Routing System in Detail

Routing is a critical part of our application architecture, handling how URLs map to content on both the frontend and backend.

### Frontend Routing (React Router)

Our frontend uses React Router for client-side routing, which allows navigation between different views without full page reloads.

#### 1. Router Configuration

The main router configuration is defined in `client/src/router/index.tsx`:

```tsx
// client/src/router/index.tsx
import { createBrowserRouter } from 'react-router-dom';
import HomePage from '../pages/HomePage';
import UsersPage from '../pages/UsersPage';
import UserDetailPage from '../pages/UserDetailPage';
import NotFoundPage from '../pages/NotFoundPage';
import Layout from '../components/layout/layout';

export const router = createBrowserRouter([
  {
    path: "/",
    element: <HomePage />,
  },
  {
    path: "/users",
    element: <UsersPage />,
  },
  {
    path: "/users/:id", // Dynamic route with parameter
    element: <UserDetailPage />,
  },
  {
    path: "*", // Catch-all route for 404
    element: <NotFoundPage />,
  },
]);
```

#### 2. Router Integration

The router is integrated in the application's entry point:

```tsx
// client/src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { router } from './router';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
```

#### 3. Route Parameters and Navigation

React Router provides hooks for accessing route parameters and navigating programmatically:

```tsx
// client/src/pages/UserDetailPage.tsx
import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { fetchUserById } from '../api/users';

export default function UserDetailPage() {
  const { id } = useParams(); // Access route parameters
  const navigate = useNavigate(); // For programmatic navigation
  const [user, setUser] = useState(null);
  
  useEffect(() => {
    if (!id) return;
    
    fetchUserById(id)
      .then(data => setUser(data))
      .catch(() => navigate('/not-found')); // Redirect on error
  }, [id, navigate]);
  
  // Render user details...
}
```

#### 4. Link Component

For declarative navigation, we use the `Link` component:

```tsx
// client/src/components/navigation/navbar.tsx
import { Link } from 'react-router-dom';

export default function Navbar() {
  return (
    <nav>
      <Link to="/">Home</Link>
      <Link to="/users">Users</Link>
      {/* Other navigation links */}
    </nav>
  );
}
```

#### 5. Nested Routes and Layouts

For consistent layouts across routes, we can use nested routes:

```tsx
// Alternative router configuration with nested routes
export const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />, // Parent layout component
    children: [
      {
        path: "", // Index route (/)
        element: <HomePage />,
      },
      {
        path: "users",
        element: <UsersPage />,
      },
      {
        path: "users/:id",
        element: <UserDetailPage />,
      },
    ],
  },
  // Routes outside the main layout
  {
    path: "/login",
    element: <LoginPage />,
  },
]);
```

With this approach, the `Layout` component must include an `Outlet` component where child routes will be rendered:

```tsx
// client/src/components/layout/layout.tsx
import { Outlet } from 'react-router-dom';
import Navbar from '../navigation/navbar';

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Outlet /> {/* Child routes render here */}
      </main>
    </div>
  );
}
```

### Backend Routing (Express)

Our backend uses Express for defining API routes that handle HTTP requests.

#### 1. Route Definition

Routes are defined in dedicated files within the `server/src/routes/` directory:

```typescript
// server/src/routes/userRoutes.ts
import express from 'express';
import * as userController from '../controllers/userController';
import { authenticate, authorize } from '../middlewares/auth';

const router = express.Router();

// Public routes
router.get('/users', userController.getUsers);
router.get('/users/:id', userController.getUserById);

// Protected routes (require authentication)
router.post('/users', authenticate, authorize(['admin']), userController.createUser);
router.put('/users/:id', authenticate, authorize(['admin']), userController.updateUser);
router.delete('/users/:id', authenticate, authorize(['admin']), userController.deleteUser);

export default router;
```

#### 2. Route Registration

Routes are registered in the main Express application:

```typescript
// server/src/index.ts
import express from 'express';
import cors from 'cors';
import userRoutes from './routes/userRoutes';
import authRoutes from './routes/authRoutes';
import postRoutes from './routes/postRoutes';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Register routes with a base path
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

#### 3. Route Parameters

Express routes can include parameters, accessed via `req.params`:

```typescript
// server/src/controllers/userController.ts
import { Request, Response } from 'express';
import * as userService from '../services/userService';

export async function getUserById(req: Request, res: Response) {
  try {
    const { id } = req.params; // Access route parameters
    const user = await userService.getUserById(id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Error fetching user' });
  }
}
```

#### 4. Query Parameters

Query parameters are accessed via `req.query`:

```typescript
// server/src/controllers/userController.ts
export async function getUsers(req: Request, res: Response) {
  try {
    // Access query parameters with defaults
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const role = req.query.role as string | undefined;
    
    // Use parameters in service call
    const users = await userService.getAllUsers({ page, limit, role });
    
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Error fetching users' });
  }
}
```

#### 5. Middleware

Middleware functions can be applied to routes for authentication, logging, etc.:

```typescript
// server/src/middlewares/auth.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export function authenticate(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  
  const token = authHeader.split(' ')[1];
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    req.user = decoded; // Attach user to request
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
}

export function authorize(roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    next();
  };
}
```

### Connecting Frontend and Backend Routes

The frontend and backend routes work together to create a complete application:

1. **Frontend Route** (`/users`) renders the `UsersPage` component
2. **Component** makes API request to backend route (`/api/users`)
3. **Backend Route** processes the request and returns data
4. **Component** receives data and renders UI

This separation allows for:
- Independent development of frontend and backend
- Clear separation of concerns
- Potential for different deployment strategies
- Ability to version the API independently of the UI

### Route Naming Conventions

We follow these conventions for route naming:

1. **Frontend Routes**:
   - Use lowercase, kebab-case for multi-word routes (`/user-settings`)
   - Use descriptive names that reflect the content (`/dashboard` not `/d`)
   - Use parameters for dynamic content (`/users/:id`)

2. **Backend Routes**:
   - Use RESTful conventions where appropriate
   - Use plural nouns for collections (`/api/users`)
   - Use singular nouns with IDs for specific resources (`/api/users/:id`)
   - Use nested routes for relationships (`/api/users/:id/posts`)

## Data Flow

The data flows through the application as follows:

1. **Database → Backend → Frontend**:
   - PostgreSQL stores the data
   - Prisma queries the database
   - Services process the data
   - Controllers format and send responses
   - Frontend API clients fetch the data
   - React components render the data

2. **Frontend → Backend → Database**:
   - User interacts with React components
   - API clients send requests to the backend
   - Controllers receive and validate requests
   - Services process the data and perform business logic
   - Prisma updates the database

## Key Technologies

### Frontend
- **React**: UI library
- **TypeScript**: Type-safe JavaScript
- **Tailwind CSS**: Utility-first CSS framework
- **shadcn/ui**: Component library
- **React Router**: Routing library
- **Axios**: HTTP client

### Backend
- **Express**: Web framework
- **TypeScript**: Type-safe JavaScript
- **Prisma**: ORM for database access
- **PostgreSQL**: Relational database

### Development Tools
- **Vite**: Frontend build tool
- **Turborepo**: Monorepo build system
- **ESLint**: Code linting
- **Prettier**: Code formatting

## Props and Component Communication

Components communicate using props:

```tsx
// Example of props usage
interface ButtonProps {
  text: string;
  onClick: () => void;
  variant?: "primary" | "secondary";
}

function Button({ text, onClick, variant = "primary" }: ButtonProps) {
  return (
    <button 
      className={`btn btn-${variant}`}
      onClick={onClick}
    >
      {text}
    </button>
  );
}
```

For more details on props, see the [Props Explainer](@docs/explainers/props.md).

## Layout System

The layout system uses composition to create consistent page structures:

```tsx
// client/src/components/layout/layout.tsx
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

For more details on layouts, see the [Layout Conventions Explainer](@docs/explainers/layout-conventions.md).

## Database to UI Flow

For a detailed explanation of how data flows from the database to the UI, see the [PostgreSQL to React Data Flow Explainer](@docs/explainers/postgres-users-mapping.md).

## Best Practices

1. **Component Organization**:
   - Keep components focused on a single responsibility
   - Use composition over inheritance
   - Follow the layout conventions

2. **Type Safety**:
   - Define interfaces for props and state
   - Use TypeScript to catch errors at compile time
   - Share types between frontend and backend when possible

3. **API Communication**:
   - Use services for business logic
   - Use controllers for HTTP handling
   - Keep API client functions separate from components

4. **State Management**:
   - Use React Context for global state
   - Use local state for component-specific state
   - Consider more robust solutions (Redux, Zustand) for complex state

5. **Styling**:
   - Use Tailwind CSS utility classes
   - Follow the design system
   - Use shadcn components for consistent UI

## Summary

Our monorepo architecture provides a clean separation of concerns while enabling efficient development of both frontend and backend. The component-based structure of the frontend and the layered architecture of the backend make the codebase maintainable and scalable.

By understanding how these pieces fit together, you'll be able to navigate the codebase more effectively and contribute to the project with confidence. 