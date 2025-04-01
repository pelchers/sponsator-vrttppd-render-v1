# Testimonials Implementation Guide

This guide documents the complete implementation of a testimonials system, including database schema, backend API, frontend components, and data flow.

## 1. Database Schema

First, we added a new table to the Prisma schema:

```prisma
model testimonials {
  id              String    @id @default(uuid())
  user_id         String
  title           String?
  content         String
  rating          Int       @default(5)
  company         String?
  position        String?
  created_at      DateTime  @default(now())
  is_approved     Boolean   @default(false)
  is_featured     Boolean   @default(false)
  
  // Relationship to users
  users           users     @relation(fields: [user_id], references: [id], onDelete: Cascade)

  @@map("testimonials")
}
```

After adding this to the schema, we ran the migration:
```bash
cd server
npx prisma migrate dev --name add_testimonials
```

## 2. Frontend Components

### A. API Service
Created `client/src/api/testimonials.ts` to handle API interactions:

```typescript
import axios from 'axios';
import { API_URL } from '@/config';

export interface Testimonial {
  id: string;
  user_id: string;
  title?: string;
  content: string;
  rating: number;
  company?: string;
  position?: string;
  created_at: string;
  is_approved: boolean;
  is_featured: boolean;
  user?: {
    id: string;
    username: string;
    profile_image_url?: string;
    profile_image_upload?: string;
    profile_image_display?: string;
  };
}

export interface TestimonialFormData {
  title?: string;
  content: string;
  rating: number;
  company?: string;
  position?: string;
}

export const createTestimonial = async (data: TestimonialFormData) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await axios.post(`${API_URL}/testimonials`, data, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    return response.data;
  } catch (error) {
    console.error('Error creating testimonial:', error);
    throw error;
  }
};

export const fetchTestimonials = async (params?: { featured?: boolean, limit?: number }) => {
  try {
    const response = await axios.get(`${API_URL}/testimonials`, {
      params
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching testimonials:', error);
    throw error;
  }
};
```

### B. Testimonial Form Component
Created `client/src/components/testimonials/TestimonialForm.tsx`:

```typescript
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { createTestimonial, TestimonialFormData } from '@/api/testimonials';

export default function TestimonialForm() {
  const [formData, setFormData] = useState<TestimonialFormData>({
    title: '',
    content: '',
    rating: 5,
    company: '',
    position: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleRatingChange = (rating: number) => {
    setFormData(prev => ({ ...prev, rating }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      await createTestimonial(formData);
      setSuccess(true);
      setFormData({
        title: '',
        content: '',
        rating: 5,
        company: '',
        position: ''
      });
    } catch (err) {
      setError('Failed to submit testimonial. Please try again.');
      console.error('Error submitting testimonial:', err);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">Share Your Success Story</h2>
      
      {success ? (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          Thank you for sharing your story! Your testimonial has been submitted for review.
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Form fields */}
        </form>
      )}
    </div>
  );
}
```

### C. Testimonial Card Component
Created `client/src/components/testimonials/TestimonialCard.tsx`:

```typescript
import React from 'react';
import { UserImage } from '@/components/UserImage';
import { DefaultAvatar } from '@/components/icons/DefaultAvatar';
import { Testimonial } from '@/api/testimonials';

interface TestimonialCardProps {
  testimonial: Testimonial;
}

export default function TestimonialCard({ testimonial }: TestimonialCardProps) {
  // Function to render stars based on rating
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} className="text-yellow-400">
        {i < rating ? "★" : "☆"}
      </span>
    ));
  };
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex items-center mb-4">
        {testimonial.user && (
          <UserImage
            user={{
              profile_image_url: testimonial.user.profile_image_url,
              profile_image_upload: testimonial.user.profile_image_upload,
              profile_image_display: testimonial.user.profile_image_display
            }}
            className="w-12 h-12 rounded-full object-cover mr-4"
            fallback={<DefaultAvatar className="w-12 h-12 mr-4" />}
          />
        )}
        
        <div>
          <h3 className="font-semibold">{testimonial.user?.username}</h3>
          {(testimonial.company || testimonial.position) && (
            <p className="text-sm text-gray-600">
              {testimonial.position}
              {testimonial.position && testimonial.company && ', '}
              {testimonial.company}
            </p>
          )}
        </div>
      </div>
      
      {testimonial.title && (
        <h4 className="font-bold text-lg mb-2">{testimonial.title}</h4>
      )}
      
      <div className="flex mb-2">
        {renderStars(testimonial.rating)}
      </div>
      
      <p className="text-gray-700">
        {testimonial.content}
      </p>
      
      <div className="mt-4 text-xs text-gray-500">
        {new Date(testimonial.created_at).toLocaleDateString()}
      </div>
    </div>
  );
}
```

### D. Testimonials List Component
Created `client/src/components/testimonials/TestimonialsList.tsx`:

```typescript
import React, { useState, useEffect } from 'react';
import { fetchTestimonials, Testimonial } from '@/api/testimonials';
import TestimonialCard from '@/components/testimonials/TestimonialCard';

interface TestimonialsListProps {
  featured?: boolean;
  limit?: number;
  className?: string;
}

export default function TestimonialsList({ 
  featured = false, 
  limit = 6,
  className = ''
}: TestimonialsListProps) {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const loadTestimonials = async () => {
      try {
        setLoading(true);
        const data = await fetchTestimonials({ featured, limit });
        setTestimonials(data);
      } catch (err) {
        console.error('Error loading testimonials:', err);
        setError('Failed to load testimonials');
      } finally {
        setLoading(false);
      }
    };
    
    loadTestimonials();
  }, [featured, limit]);
  
  // Render loading, error, empty, or testimonials list
  // ...
}
```

## 3. Backend Implementation

### A. Controller
Created `server/src/controllers/testimonialController.ts`:

```typescript
import { Request, Response } from 'express';
import { testimonialService } from '../services/testimonialService';

interface AuthRequest extends Request {
  user?: {
    id: string;
    // ... other user fields
  };
}

export const testimonialController = {
  async createTestimonial(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
      }
      
      const testimonialData = {
        ...req.body,
        user_id: userId
      };
      
      const testimonial = await testimonialService.createTestimonial(testimonialData);
      
      res.status(201).json(testimonial);
    } catch (error) {
      console.error('Error creating testimonial:', error);
      res.status(500).json({ error: 'Failed to create testimonial' });
    }
  },
  
  // Other controller methods...
};
```

### B. Service
Created `server/src/services/testimonialService.ts`:

```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const testimonialService = {
  async createTestimonial(data: any) {
    try {
      const testimonial = await prisma.testimonials.create({
        data,
        include: {
          users: {
            select: {
              id: true,
              username: true,
              profile_image_url: true,
              profile_image_upload: true,
              profile_image_display: true
            }
          }
        }
      });
      
      return this.mapTestimonialToFrontend(testimonial);
    } catch (error) {
      console.error('Error creating testimonial:', error);
      throw error;
    }
  },
  
  // Other service methods...
  
  mapTestimonialToFrontend(testimonial: any) {
    return {
      id: testimonial.id,
      user_id: testimonial.user_id,
      title: testimonial.title,
      content: testimonial.content,
      rating: testimonial.rating,
      company: testimonial.company,
      position: testimonial.position,
      created_at: testimonial.created_at.toISOString(),
      is_approved: testimonial.is_approved,
      is_featured: testimonial.is_featured,
      user: testimonial.users ? {
        id: testimonial.users.id,
        username: testimonial.users.username,
        profile_image_url: testimonial.users.profile_image_url,
        profile_image_upload: testimonial.users.profile_image_upload,
        profile_image_display: testimonial.users.profile_image_display
      } : undefined
    };
  }
};
```

### C. Routes
Created `server/src/routes/testimonialRoutes.ts`:

```typescript
import express from 'express';
import { testimonialController } from '../controllers/testimonialController';
import { authenticate } from '../middlewares/auth';

const router = express.Router();

// Public routes
router.get('/', testimonialController.getTestimonials);
router.get('/:id', testimonialController.getTestimonialById);

// Protected routes
router.post('/', authenticate, testimonialController.createTestimonial);
router.put('/:id', authenticate, testimonialController.updateTestimonial);
router.delete('/:id', authenticate, testimonialController.deleteTestimonial);

// Admin routes
router.put('/:id/approve', authenticate, testimonialController.approveTestimonial);
router.put('/:id/feature', authenticate, testimonialController.featureTestimonial);

export default router;
```

### D. Register Routes
Updated `server/src/routes/index.ts` to include testimonial routes:

```typescript
import testimonialRoutes from './testimonialRoutes';

// ...

router.use('/testimonials', testimonialRoutes);
```

## 4. Success Stories Page Integration

Updated `client/src/pages/success-stories.tsx` to include our new components:

```typescript
import React from 'react';
import TestimonialsList from '@/components/testimonials/TestimonialsList';
import TestimonialForm from '@/components/testimonials/TestimonialForm';

export default function SuccessStoriesPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Success Stories</h1>
      
      {/* Featured testimonials section */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold mb-6">Featured Success Stories</h2>
        <TestimonialsList featured={true} limit={3} />
      </section>
      
      {/* Additional details section with white background */}
      <section className="bg-white p-8 rounded-lg shadow-md mb-16">
        <h2 className="text-2xl font-bold mb-6">Why Our Platform Works</h2>
        
        {/* Stats and details */}
      </section>
      
      {/* All testimonials section */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold mb-6">All Success Stories</h2>
        <TestimonialsList limit={12} />
      </section>
      
      {/* Submit testimonial form */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold mb-6">Share Your Story</h2>
        <TestimonialForm />
      </section>
    </div>
  );
}
```

## 5. Data Flow

1. **User Submits Testimonial**:
   - User fills out form in `TestimonialForm` component
   - Form data is sent to `createTestimonial` API function
   - API call is made to `POST /testimonials` endpoint
   - Backend controller validates user authentication
   - Service creates record in database
   - Response is sent back to frontend
   - Success message is displayed to user

2. **Displaying Testimonials**:
   - `TestimonialsList` component mounts
   - Component calls `fetchTestimonials` API function
   - API call is made to `GET /testimonials` endpoint
   - Backend controller retrieves approved testimonials
   - Service formats data for frontend
   - Response is sent back to frontend
   - `TestimonialsList` renders `TestimonialCard` for each item

3. **Admin Approval Flow**:
   - Admin accesses admin interface (not implemented yet)
   - Admin reviews pending testimonials
   - Admin approves testimonial via API call
   - Backend updates testimonial status
   - Testimonial becomes visible in public lists

## 6. Key Features

1. **User Authentication**:
   - Only logged-in users can submit testimonials
   - Users can only edit/delete their own testimonials

2. **Approval Workflow**:
   - Testimonials are not publicly visible until approved
   - Admin interface for reviewing submissions

3. **Featured Testimonials**:
   - Special flag for highlighting important testimonials
   - Separate section on success stories page

4. **Rating System**:
   - 5-star rating display
   - Interactive star selection in form

5. **User Information**:
   - Displays user profile image
   - Shows username and company/position
   - Links to user profile (future enhancement)

## 7. Testing Checklist

1. ✅ Database Schema
   - Add testimonials table
   - Run migration

2. ✅ Backend Implementation
   - Create testimonial service
   - Create testimonial controller
   - Set up routes
   - Register routes

3. ✅ Frontend Components
   - Create TestimonialForm component
   - Create TestimonialCard component
   - Create TestimonialsList component
   - Update success stories page

4. ✅ Testing
   - Submit a new testimonial
   - View testimonials list
   - Test approval flow (admin)
   - Test featured testimonials

## 8. Future Enhancements

1. **Admin Interface**:
   - Create dedicated admin panel for testimonial management
   - Add bulk approval/rejection functionality

2. **Rich Text Content**:
   - Allow formatting in testimonial content
   - Support for links and basic styling

3. **Media Attachments**:
   - Allow users to upload images with testimonials
   - Support for video testimonials

4. **Social Sharing**:
   - Add ability to share testimonials on social media
   - Generate shareable links/cards

5. **Filtering and Sorting**:
   - Allow users to filter testimonials by rating, date, etc.
   - Implement different sorting options

This implementation provides a complete testimonials system with user submission, admin approval, and public display capabilities.
