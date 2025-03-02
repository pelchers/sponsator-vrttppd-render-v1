# Frontend API Services vs. Custom Hooks

This document explains the key differences between frontend API services and custom hooks, their respective responsibilities, and how they work together in a React application.

## Frontend API Services

**Purpose**: API services serve as the communication layer between your frontend and backend.

**Location**: Typically in `client/src/api/` or `client/src/services/`

**Characteristics**:
1. **Direct API Communication**: They contain functions that make HTTP requests (GET, POST, PUT, DELETE) to your backend endpoints
2. **Data Transformation**: They may transform data before sending or after receiving
3. **Error Handling**: They catch and process HTTP errors
4. **Authentication**: They often handle adding auth tokens to requests

**Example** (`users.ts`):
```typescript
// client/src/api/users.ts
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export async function fetchUserProfile(userId: string) {
  try {
    const response = await axios.get(`${API_URL}/users/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
}

export async function updateUserProfile(userId: string, userData: any) {
  try {
    const response = await axios.put(`${API_URL}/users/${userId}`, userData);
    return response.data;
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
}
```

## Frontend Hooks

**Purpose**: Hooks encapsulate component logic, state management, and side effects.

**Location**: Typically in `client/src/hooks/`

**Characteristics**:
1. **State Management**: They use React's useState and other hooks to manage component state
2. **Side Effects**: They use useEffect to handle side effects like data fetching
3. **Reusable Logic**: They extract and encapsulate reusable logic from components
4. **Component Lifecycle**: They handle component lifecycle events
5. **Consume API Services**: They often use the API files to fetch or update data

**Example** (`useProfileForm.ts`):
```typescript
// client/src/hooks/useProfileForm.ts
import { useState, useEffect } from 'react';
import { fetchUserProfile, updateUserProfile } from '@/api/users';

export function useProfileForm(userId: string | undefined) {
  const [formData, setFormData] = useState({/* initial state */});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Load user data when component mounts or userId changes
  useEffect(() => {
    async function loadUserData() {
      if (!userId) return;
      
      try {
        setLoading(true);
        const userData = await fetchUserProfile(userId);
        setFormData(userData);
      } catch (err) {
        setError('Failed to load user data');
      } finally {
        setLoading(false);
      }
    }

    loadUserData();
  }, [userId]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userId) return;
    
    try {
      await updateUserProfile(userId, formData);
      setSuccess(true);
    } catch (err) {
      setError('Failed to update profile');
    }
  };

  return {
    formData,
    setFormData,
    loading,
    error,
    success,
    handleSubmit
  };
}
```

## Key Differences

1. **Responsibility**:
   - **API Files**: Handle communication with the backend
   - **Hooks**: Handle component logic and state management

2. **React Integration**:
   - **API Files**: Not React-specific, could be used in any JavaScript application
   - **Hooks**: React-specific, use React's hook system

3. **State**:
   - **API Files**: Don't maintain state
   - **Hooks**: Manage component state using useState and other React hooks

4. **Relationship**:
   - Hooks often consume API files, not the other way around

5. **Reusability Context**:
   - **API Files**: Reusable across different frameworks or libraries
   - **Hooks**: Reusable only within React applications

## How They Work Together

In a typical React application:

1. **Component** needs to display or update data
2. **Hook** provides the component with state and handlers
3. **API File** is called by the hook to communicate with the backend
4. **Backend** processes the request and returns data
5. **API File** returns the data to the hook
6. **Hook** updates its state
7. **Component** re-renders with the new state

This separation of concerns makes your code more maintainable, testable, and reusable.

## Benefits of This Approach

1. **Cleaner Components**: Components focus on rendering UI, not managing API calls or complex state
2. **Reusable Logic**: The same hook can be used across multiple components
3. **Consistent Error Handling**: Centralized error handling in both API services and hooks
4. **Easier Testing**: API services and hooks can be tested independently
5. **Better Separation of Concerns**: Each part of your code has a clear responsibility

## When to Use Each

- **Use API Services** when you need to:
  - Make HTTP requests to your backend
  - Transform data before sending or after receiving
  - Handle authentication and authorization
  - Share API calls across different parts of your application

- **Use Custom Hooks** when you need to:
  - Share stateful logic between components
  - Manage loading, error, and success states
  - Handle side effects like data fetching
  - Encapsulate complex form logic
  - Provide a clean interface for components to interact with

By properly separating these concerns, you create a more maintainable and scalable application architecture. 