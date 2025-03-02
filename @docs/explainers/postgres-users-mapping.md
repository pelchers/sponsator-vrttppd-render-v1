# PostgreSQL to React: Data Flow Explainer

## Overview

This document explains how data flows from a PostgreSQL database to your React frontend, using a users table as an example. We'll cover the entire process from database connection to rendering user data in React components.

🌟 **New Dev Friendly Explanation**:
Data flows through several layers in our application:
1. PostgreSQL stores the data (users, posts, etc.)
2. Prisma connects to the database and provides a type-safe API
3. Express routes handle API requests and responses
4. React components fetch data and render it in the UI

## Database Schema

Our PostgreSQL database includes a `users` table with the following structure:

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'user', 'guest')),
  password_hash VARCHAR(255) NOT NULL,
  join_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  last_login TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT TRUE
);
```

## Server-Side Implementation

### 1. Database Connection (Prisma)

We use Prisma as our ORM to connect to PostgreSQL:

```typescript
// server/prisma/schema.prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id          String    @id @default(uuid())
  name        String
  email       String    @unique
  role        Role      @default(USER)
  passwordHash String    @map("password_hash")
  joinDate    DateTime  @default(now()) @map("join_date")
  lastLogin   DateTime? @map("last_login")
  isActive    Boolean   @default(true) @map("is_active")

  @@map("users")
}

enum Role {
  ADMIN @map("admin")
  USER  @map("user")
  GUEST @map("guest")
}
```

The connection string is defined in `.env`:

```
DATABASE_URL="postgresql://username:password@localhost:5432/mydb?schema=public"
```

### 2. Prisma Client Setup

```typescript
// server/src/lib/prisma.ts
import { PrismaClient } from '@prisma/client';

// Create a singleton instance of PrismaClient
const prisma = new PrismaClient();

export default prisma;
```

### 3. User Model/Types

```typescript
// server/src/types/user.ts
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user' | 'guest';
  joinDate: Date;
  lastLogin: Date | null;
  isActive: boolean;
}

// Omit sensitive fields for client response
export type UserResponse = Omit<User, 'passwordHash'>;

// For creating a new user
export interface CreateUserInput {
  name: string;
  email: string;
  password: string;
  role?: 'admin' | 'user' | 'guest';
}

// For updating a user
export interface UpdateUserInput {
  name?: string;
  email?: string;
  role?: 'admin' | 'user' | 'guest';
  isActive?: boolean;
}
```

### 4. User Service Layer

The service layer handles business logic and database operations:

```typescript
// server/src/services/userService.ts
import prisma from '../lib/prisma';
import { CreateUserInput, UpdateUserInput, UserResponse } from '../types/user';
import { hashPassword } from '../utils/auth';

export async function getAllUsers(): Promise<UserResponse[]> {
  const users = await prisma.user.findMany({
    where: {
      isActive: true
    },
    orderBy: {
      joinDate: 'desc'
    }
  });

  // Remove passwordHash from response
  return users.map(({ passwordHash, ...user }) => user);
}

export async function getUserById(id: string): Promise<UserResponse | null> {
  const user = await prisma.user.findUnique({
    where: { id }
  });

  if (!user) return null;
  
  // Remove passwordHash from response
  const { passwordHash, ...userWithoutPassword } = user;
  return userWithoutPassword;
}

export async function createUser(data: CreateUserInput): Promise<UserResponse> {
  const passwordHash = await hashPassword(data.password);
  
  const user = await prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      role: data.role || 'user',
      passwordHash
    }
  });

  // Remove passwordHash from response
  const { passwordHash: _, ...userWithoutPassword } = user;
  return userWithoutPassword;
}

export async function updateUser(id: string, data: UpdateUserInput): Promise<UserResponse | null> {
  const user = await prisma.user.update({
    where: { id },
    data
  });

  // Remove passwordHash from response
  const { passwordHash, ...userWithoutPassword } = user;
  return userWithoutPassword;
}

export async function deleteUser(id: string): Promise<void> {
  // Soft delete by setting isActive to false
  await prisma.user.update({
    where: { id },
    data: { isActive: false }
  });
}
```

### 5. API Controllers

Controllers handle HTTP requests and responses:

```typescript
// server/src/controllers/userController.ts
import { Request, Response } from 'express';
import * as userService from '../services/userService';

export async function getUsers(req: Request, res: Response) {
  try {
    // Handle pagination
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    // Get users with pagination
    const users = await userService.getAllUsers();
    const paginatedUsers = users.slice(skip, skip + limit);
    
    res.json({
      users: paginatedUsers,
      totalPages: Math.ceil(users.length / limit),
      currentPage: page
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Error fetching users' });
  }
}

export async function getUserById(req: Request, res: Response) {
  try {
    const { id } = req.params;
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

export async function createUser(req: Request, res: Response) {
  try {
    const userData = req.body;
    const newUser = await userService.createUser(userData);
    res.status(201).json(newUser);
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ message: 'Error creating user' });
  }
}

export async function updateUser(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const userData = req.body;
    const updatedUser = await userService.updateUser(id, userData);
    
    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(updatedUser);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Error updating user' });
  }
}

export async function deleteUser(req: Request, res: Response) {
  try {
    const { id } = req.params;
    await userService.deleteUser(id);
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Error deleting user' });
  }
}
```

### 6. API Routes

Routes define the API endpoints:

```typescript
// server/src/routes/userRoutes.ts
import express from 'express';
import * as userController from '../controllers/userController';
import { authenticate, authorize } from '../middleware/auth';

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

### 7. Express Server Setup

```typescript
// server/src/index.ts
import express from 'express';
import cors from 'cors';
import userRoutes from './routes/userRoutes';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api', userRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

## Frontend Implementation

### 1. API Client

```typescript
// client/src/api/users.ts
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "user" | "guest";
  joinDate: string;
  lastLogin: string | null;
  isActive: boolean;
}

export interface UsersResponse {
  users: User[];
  totalPages: number;
  currentPage: number;
}

export async function fetchUsers(page = 1, limit = 10): Promise<UsersResponse> {
  const response = await axios.get(`${API_URL}/users`, {
    params: { page, limit }
  });
  return response.data;
}

export async function fetchUserById(id: string): Promise<User> {
  const response = await axios.get(`${API_URL}/users/${id}`);
  return response.data;
}

export async function createUser(userData: Omit<User, 'id' | 'joinDate' | 'lastLogin' | 'isActive'> & { password: string }): Promise<User> {
  const response = await axios.post(`${API_URL}/users`, userData, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`
    }
  });
  return response.data;
}

export async function updateUser(id: string, userData: Partial<User>): Promise<User> {
  const response = await axios.put(`${API_URL}/users/${id}`, userData, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`
    }
  });
  return response.data;
}

export async function deleteUser(id: string): Promise<void> {
  await axios.delete(`${API_URL}/users/${id}`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`
    }
  });
}
```

### 2. React Types

```typescript
// client/src/types/user.ts
export interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "user" | "guest";
  joinDate: string;
  lastLogin: string | null;
  isActive: boolean;
}

// Different user types with specific properties
export interface AdminUser extends User {
  role: "admin";
  permissions: string[];
}

export interface StandardUser extends User {
  role: "user";
  subscription: "free" | "premium";
}

export interface GuestUser extends User {
  role: "guest";
  expiryDate: string;
}

// Type guard functions to check user types
export function isAdmin(user: User): user is AdminUser {
  return user.role === "admin";
}

export function isStandardUser(user: User): user is StandardUser {
  return user.role === "user";
}

export function isGuest(user: User): user is GuestUser {
  return user.role === "guest";
}
```

### 3. User Context (State Management)

```typescript
// client/src/contexts/UserContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { fetchUsers, User, UsersResponse } from '../api/users';

interface UserContextType {
  users: User[];
  loading: boolean;
  error: string | null;
  totalPages: number;
  currentPage: number;
  fetchUserData: (page?: number) => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchUserData = async (page = 1) => {
    try {
      setLoading(true);
      setError(null);
      const data: UsersResponse = await fetchUsers(page);
      setUsers(data.users);
      setTotalPages(data.totalPages);
      setCurrentPage(data.currentPage);
    } catch (err) {
      setError('Failed to fetch users');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  return (
    <UserContext.Provider value={{ 
      users, 
      loading, 
      error, 
      totalPages, 
      currentPage, 
      fetchUserData 
    }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUsers() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUsers must be used within a UserProvider');
  }
  return context;
}
```

### 4. User Components

#### User Card Component

```tsx
// client/src/components/users/UserCard.tsx
import React from 'react';
import { User, isAdmin, isStandardUser, isGuest } from '../../types/user';
import { formatDate } from '../../utils/date';

interface UserCardProps {
  user: User;
}

export default function UserCard({ user }: UserCardProps) {
  // Determine card style based on user role
  const cardStyle = {
    admin: "border-purple-500 bg-purple-50",
    user: "border-blue-500 bg-blue-50",
    guest: "border-gray-500 bg-gray-50"
  }[user.role];

  return (
    <div className={`p-4 rounded-lg shadow border-l-4 ${cardStyle}`}>
      <h3 className="text-lg font-bold">{user.name}</h3>
      <p className="text-gray-600">{user.email}</p>
      
      <div className="mt-2">
        <span className="inline-block px-2 py-1 text-xs rounded-full bg-gray-200">
          {user.role}
        </span>
      </div>
      
      <div className="mt-3 text-sm">
        <p>Joined: {formatDate(user.joinDate)}</p>
        {user.lastLogin && <p>Last login: {formatDate(user.lastLogin)}</p>}
      </div>
      
      {/* Render role-specific information */}
      {isAdmin(user) && (
        <div className="mt-2 p-2 bg-purple-100 rounded">
          <h4 className="font-semibold">Permissions:</h4>
          <ul className="list-disc list-inside text-sm">
            {user.permissions.map(perm => (
              <li key={perm}>{perm}</li>
            ))}
          </ul>
        </div>
      )}
      
      {isStandardUser(user) && (
        <div className="mt-2 p-2 bg-blue-100 rounded">
          <p className="text-sm">
            <span className="font-semibold">Subscription:</span> {user.subscription}
          </p>
        </div>
      )}
      
      {isGuest(user) && (
        <div className="mt-2 p-2 bg-gray-100 rounded">
          <p className="text-sm">
            <span className="font-semibold">Expires:</span> {formatDate(user.expiryDate)}
          </p>
        </div>
      )}
    </div>
  );
}
```

#### User List Component

```tsx
// client/src/components/users/UserList.tsx
import React from 'react';
import { useUsers } from '../../contexts/UserContext';
import UserCard from './UserCard';
import Pagination from '../ui/Pagination';

export default function UserList() {
  const { users, loading, error, totalPages, currentPage, fetchUserData } = useUsers();

  if (loading) return <div className="text-center p-4">Loading users...</div>;
  if (error) return <div className="text-center p-4 text-red-500">{error}</div>;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Users</h2>
      
      {users.length === 0 ? (
        <p>No users found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {users.map(user => (
            <UserCard key={user.id} user={user} />
          ))}
        </div>
      )}
      
      <div className="mt-6">
        <Pagination 
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={(page) => fetchUserData(page)}
        />
      </div>
    </div>
  );
}
```

### 5. User Page

```tsx
// client/src/pages/UsersPage.tsx
import React from 'react';
import Layout from '../components/layout/layout';
import UserList from '../components/users/UserList';
import { UserProvider } from '../contexts/UserContext';

export default function UsersPage() {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <UserProvider>
          <UserList />
        </UserProvider>
      </div>
    </Layout>
  );
}
```

### 6. Router Configuration

```tsx
// client/src/router/index.tsx
import { createBrowserRouter } from 'react-router-dom';
import HomePage from '../pages/HomePage';
import UsersPage from '../pages/UsersPage';
import UserDetailPage from '../pages/UserDetailPage';
import NotFoundPage from '../pages/NotFoundPage';
import { ProtectedRoute } from './ProtectedRoute';

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
    path: "/users/:id",
    element: <UserDetailPage />,
  },
  {
    path: "/admin/users",
    element: (
      <ProtectedRoute requiredRole="admin">
        <UsersPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "*",
    element: <NotFoundPage />,
  },
]);
```

## Data Flow Summary

1. **Database Layer**:
   - PostgreSQL stores user data in the `users` table
   - Prisma provides the ORM interface to the database

2. **Server Layer**:
   - Prisma client queries the database
   - Service layer implements business logic
   - Controllers handle HTTP requests/responses
   - Routes define API endpoints

3. **API Communication**:
   - Frontend makes HTTP requests to the API
   - API returns JSON data
   - Axios handles request/response in the frontend

4. **Frontend Layer**:
   - API client functions fetch data from the server
   - Context API manages global state
   - React components consume the context
   - Components render user data with appropriate styling

5. **User Interface**:
   - Different card styles based on user role
   - Conditional rendering of role-specific information
   - Pagination for large datasets

## Best Practices

1. **Type Safety**:
   - Define consistent types across backend and frontend
   - Use TypeScript interfaces to ensure data consistency
   - Implement type guards for specialized user types

2. **Separation of Concerns**:
   - Database operations in service layer
   - HTTP handling in controllers
   - UI rendering in React components

3. **Security**:
   - Never expose sensitive data (like password hashes)
   - Implement authentication and authorization
   - Validate input data on both client and server

4. **Performance**:
   - Implement pagination for large datasets
   - Use proper indexing in the database
   - Consider caching frequently accessed data

5. **Error Handling**:
   - Implement comprehensive error handling
   - Provide meaningful error messages
   - Log errors for debugging

By following this architecture, your application maintains a clean separation of concerns while providing a type-safe and efficient data flow from the database to the user interface. 