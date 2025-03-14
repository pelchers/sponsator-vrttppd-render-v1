# Tracing the API Call Flow from UserCard to Backend and Back

Let's trace the complete flow of a like action from the UserCard component through the frontend API, to the backend, and back to the view. This will help you understand how all the pieces connect.

## 1. UserCard Component to Frontend API

In the UserCard component, the key line that initiates communication with the frontend API is:

```typescript
// When liking
await likeEntity('user', user.id);
// When getting the count
newCount = await getLikeCount('user', user.id);
```

These functions (`likeEntity` and `getLikeCount`) are imported from:

```typescript
import { likeEntity, unlikeEntity, checkLikeStatus, getLikeCount } from '@/api/likes';
```

## 2. Frontend API to Backend

Looking at `client/src/api/likes.ts`, these functions make HTTP requests to the backend:

```typescript
// client/src/api/likes.ts
export const likeEntity = async (entityType: string, entityId: string) => {
  try {
    const response = await fetch(`/api/likes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      },
      body: JSON.stringify({ entityType, entityId })
    });
    
    if (!response.ok) {
      throw new Error('Failed to like entity');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error liking entity:', error);
    throw error;
  }
};

export const getLikeCount = async (entityType: string, entityId: string) => {
  try {
    const response = await fetch(`/api/likes/count?entityType=${entityType}&entityId=${entityId}`, {
      headers: getAuthHeaders()
    });
    
    if (!response.ok) {
      throw new Error('Failed to get like count');
    }
    
    const data = await response.json();
    return data.count;
  } catch (error) {
    console.error('Error getting like count:', error);
    return 0;
  }
};
```

These functions make HTTP requests to:
- POST `/api/likes` for liking an entity
- GET `/api/likes/count` for getting the like count

## 3. Backend Routes

On the backend, these requests are handled by routes defined in a file like `server/src/routes/likeRoutes.ts`:

```typescript
// server/src/routes/likeRoutes.ts
import express from 'express';
import * as likeController from '../controllers/likeController';
import { authenticate } from '../middlewares/auth';

const router = express.Router();

// Like an entity (requires authentication)
router.post('/', authenticate, likeController.likeEntity);

// Unlike an entity (requires authentication)
router.delete('/:entityType/:entityId', authenticate, likeController.unlikeEntity);

// Check if user has liked an entity (requires authentication)
router.get('/check', authenticate, likeController.checkLikeStatus);

// Get like count for an entity (public)
router.get('/count', likeController.getLikeCount);

export default router;
```

And these routes are registered in the main `server/src/index.ts` file:

```typescript
// server/src/index.ts
import likeRoutes from './routes/likeRoutes';

// ...

app.use('/api/likes', likeRoutes);
```

## 4. Backend Controllers

The routes call controller methods in `server/src/controllers/likeController.ts`:

```typescript
// server/src/controllers/likeController.ts
import { Request, Response } from 'express';
import * as likeService from '../services/likeService';

export const likeEntity = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    const { entityType, entityId } = req.body;
    
    if (!entityType || !entityId) {
      return res.status(400).json({ message: 'Entity type and ID are required' });
    }
    
    const result = await likeService.likeEntity(userId, entityType, entityId);
    res.status(201).json(result);
  } catch (error) {
    console.error('Error in likeEntity controller:', error);
    
    // Check for specific error types
    if (error.message === 'Already liked') {
      return res.status(409).json({ message: 'Entity already liked by user' });
    }
    
    res.status(500).json({ message: 'Failed to like entity' });
  }
};

export const getLikeCount = async (req: Request, res: Response) => {
  try {
    const { entityType, entityId } = req.query;
    
    if (!entityType || !entityId) {
      return res.status(400).json({ message: 'Entity type and ID are required' });
    }
    
    const count = await likeService.getLikeCount(
      entityType as string, 
      entityId as string
    );
    
    res.json({ count });
  } catch (error) {
    console.error('Error in getLikeCount controller:', error);
    res.status(500).json({ message: 'Failed to get like count' });
  }
};
```

## 5. Backend Services

The controllers call service methods in `server/src/services/likeService.ts`:

```typescript
// server/src/services/likeService.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const likeEntity = async (
  userId: string, 
  entityType: string, 
  entityId: string
) => {
  // Check if already liked
  const existingLike = await prisma.likes.findFirst({
    where: {
      user_id: userId,
      entity_type: entityType,
      entity_id: entityId
    }
  });
  
  if (existingLike) {
    throw new Error('Already liked');
  }
  
  // Create like
  const like = await prisma.likes.create({
    data: {
      user_id: userId,
      entity_type: entityType,
      entity_id: entityId
    }
  });
  
  // Update like count in the respective entity table
  await updateEntityLikeCount(entityType, entityId);
  
  return like;
};

export const getLikeCount = async (entityType: string, entityId: string) => {
  const count = await prisma.likes.count({
    where: {
      entity_type: entityType,
      entity_id: entityId
    }
  });
  
  return count;
};

// Helper function to update like count in the entity table
async function updateEntityLikeCount(entityType: string, entityId: string) {
  const count = await getLikeCount(entityType, entityId);
  
  switch (entityType) {
    case 'user':
      await prisma.users.update({
        where: { id: entityId },
        data: { likes_count: count }
      });
      break;
    case 'post':
      await prisma.posts.update({
        where: { id: entityId },
        data: { likes_count: count }
      });
      break;
    // Other entity types...
  }
}
```

## 6. Database Interaction

The service uses Prisma to interact with the database:

```typescript
const prisma = new PrismaClient();

// Create a like
const like = await prisma.likes.create({
  data: {
    user_id: userId,
    entity_type: entityType,
    entity_id: entityId
  }
});

// Get like count
const count = await prisma.likes.count({
  where: {
    entity_type: entityType,
    entity_id: entityId
  }
});
```

## 7. Response Flow Back to the View

The data flows back through the same chain in reverse:

1. Database query returns results to the service
2. Service returns data to the controller
3. Controller sends HTTP response
4. Frontend API receives the response
5. UserCard component updates its state with the new data:
   ```typescript
   // Update with the actual count from the server
   setLikeCount(newCount);
   ```

## Complete Flow Diagram

```
UserCard Component
    ↓ likeEntity('user', user.id)
    ↓ getLikeCount('user', user.id)
Frontend API (client/src/api/likes.ts)
    ↓ fetch('/api/likes', { method: 'POST', ... })
    ↓ fetch('/api/likes/count?entityType=user&entityId=...', ...)
Backend Routes (server/src/routes/likeRoutes.ts)
    ↓ router.post('/', authenticate, likeController.likeEntity)
    ↓ router.get('/count', likeController.getLikeCount)
Backend Controllers (server/src/controllers/likeController.ts)
    ↓ likeService.likeEntity(userId, entityType, entityId)
    ↓ likeService.getLikeCount(entityType, entityId)
Backend Services (server/src/services/likeService.ts)
    ↓ prisma.likes.create({ data: { ... } })
    ↓ prisma.likes.count({ where: { ... } })
Database
    ↑ Query results
Backend Services
    ↑ Return data
Backend Controllers
    ↑ res.json({ ... })
Frontend API
    ↑ response.json()
UserCard Component
    ↑ setLikeCount(newCount)
    ↑ UI updates
```

## Key Lines of Code in Each File

### 1. UserCard Component (client/src/components/cards/UserCard.tsx)
```typescript
// Import API functions
import { likeEntity, unlikeEntity, checkLikeStatus, getLikeCount } from '@/api/likes';

// Call API functions
await likeEntity('user', user.id);
newCount = await getLikeCount('user', user.id);

// Update UI with response
setLikeCount(newCount);

/**
 * KEY IDENTIFIERS:
 * - likeEntity: Function imported from API to like an entity
 * - getLikeCount: Function imported from API to get like count
 * - user.id: ID of the user entity being liked
 * - newCount: Variable that stores the returned like count
 * - setLikeCount: React state setter function to update UI
 */

// IMPORT CODE:
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { DefaultAvatar } from '@/components/icons/DefaultAvatar';
import FollowButton from '@/components/buttons/FollowButton';
import WatchButton from '@/components/buttons/WatchButton';
import { HeartIcon } from '@/components/icons/HeartIcon';
import { likeEntity, unlikeEntity, checkLikeStatus, getLikeCount } from '@/api/likes';
```

### 2. Frontend API (client/src/api/likes.ts)
```typescript
// Make HTTP requests to backend
const response = await fetch(`/api/likes`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
  body: JSON.stringify({ entityType, entityId })
});

// Parse response
return await response.json();

/**
 * KEY IDENTIFIERS:
 * - likeEntity: Exported function that makes the API call
 * - getLikeCount: Exported function that fetches the count
 * - entityType: Parameter specifying the type of entity (e.g., 'user')
 * - entityId: Parameter with the ID of the entity being liked
 * - response: Variable holding the fetch response
 * - getAuthHeaders: Helper function to get authentication headers
 */

// IMPORT CODE:
// This file typically doesn't have imports for the API functions since it defines them
// But it might import helper functions:
import { getAuthHeaders } from '@/utils/auth';
```

### 3. Backend Routes (server/src/routes/likeRoutes.ts)
```typescript
// Define routes that map to controller methods
router.post('/', authenticate, likeController.likeEntity);
router.get('/count', likeController.getLikeCount);

// Export router
export default router;

/**
 * KEY IDENTIFIERS:
 * - router: Express router instance
 * - authenticate: Middleware to verify user is logged in
 * - likeController.likeEntity: Controller method for liking
 * - likeController.getLikeCount: Controller method for count
 */

// IMPORT CODE:
import express from 'express';
import * as likeController from '../controllers/likeController';
import { authenticate } from '../middlewares/auth';
```

### 4. Route Registration (server/src/index.ts)
```typescript
// Register routes with the Express app
app.use('/api/likes', likeRoutes);

/**
 * KEY IDENTIFIERS:
 * - app: Express application instance
 * - '/api/likes': Base URL path for like-related endpoints
 * - likeRoutes: Imported router from likeRoutes.ts
 */

// IMPORT CODE:
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import likeRoutes from './routes/likeRoutes';
// ... other imports
```

### 5. Backend Controllers (server/src/controllers/likeController.ts)
```typescript
// Import service
import * as likeService from '../services/likeService';

// Call service methods
const result = await likeService.likeEntity(userId, entityType, entityId);

// Send response
res.status(201).json(result);

/**
 * KEY IDENTIFIERS:
 * - likeEntity: Exported controller function
 * - getLikeCount: Exported controller function
 * - likeService: Imported service module
 * - userId: User ID extracted from request
 * - entityType: Entity type from request body/query
 * - entityId: Entity ID from request body/query
 * - result: Response from service layer
 * - res: Express response object
 */

// IMPORT CODE:
import { Request, Response } from 'express';
import * as likeService from '../services/likeService';
```

### 6. Backend Services (server/src/services/likeService.ts)
```typescript
// Import Prisma
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// Query database
const like = await prisma.likes.create({
  data: { user_id: userId, entity_type: entityType, entity_id: entityId }
});

// Return data
return like;

/**
 * KEY IDENTIFIERS:
 * - likeEntity: Exported service function
 * - getLikeCount: Exported service function
 * - prisma: Prisma client instance
 * - userId: Parameter passed from controller
 * - entityType: Parameter passed from controller
 * - entityId: Parameter passed from controller
 * - like: Database record created
 * - count: Like count retrieved from database
 * - updateEntityLikeCount: Helper function to update counts
 */

// IMPORT CODE:
import { PrismaClient } from '@prisma/client';
```

This is the complete flow of data from the UserCard component to the database and back, with the key lines of code in each file that facilitate communication with the next file in the flow.
