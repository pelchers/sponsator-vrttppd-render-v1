# Suggestions Implementation Guide

This guide documents the complete implementation of a suggestions system, allowing users to submit site improvement ideas and administrators to provide feedback.

## 1. Database Schema

First, add a new table to the Prisma schema:

```prisma
model suggestions {
  id              String    @id @default(uuid())
  user_id         String
  title           String
  description     String
  category        String?
  priority        String?   @default("medium")
  status          String?   @default("pending")
  admin_comments  String?
  created_at      DateTime  @default(now())
  updated_at      DateTime  @default(now())
  is_public       Boolean   @default(true)
  
  // Relationship to users
  users           users     @relation(fields: [user_id], references: [id], onDelete: Cascade)

  @@map("suggestions")
}
```

After adding this to the schema, run the migration:
```bash
cd server
npx prisma migrate dev --name add_suggestions
```

## 2. Frontend Components

### A. API Service
Create `client/src/api/suggestions.ts` to handle API interactions:

```typescript
import axios from 'axios';
import { API_URL } from '@/config';

export interface Suggestion {
  id: string;
  user_id: string;
  title: string;
  description: string;
  category?: string;
  priority?: string;
  status?: string;
  admin_comments?: string;
  created_at: string;
  updated_at: string;
  is_public: boolean;
  user?: {
    id: string;
    username: string;
    profile_image_url?: string;
    profile_image_upload?: string;
    profile_image_display?: string;
  };
}

export interface SuggestionFormData {
  title: string;
  description: string;
  category?: string;
  is_public?: boolean;
}

export const createSuggestion = async (data: SuggestionFormData) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await axios.post(`${API_URL}/suggestions`, data, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    return response.data;
  } catch (error) {
    console.error('Error creating suggestion:', error);
    throw error;
  }
};

export const fetchSuggestions = async (params?: { 
  status?: string, 
  category?: string,
  limit?: number,
  showAll?: boolean
}) => {
  try {
    const response = await axios.get(`${API_URL}/suggestions`, {
      params
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching suggestions:', error);
    throw error;
  }
};

export const fetchSuggestion = async (id: string) => {
  try {
    const response = await axios.get(`${API_URL}/suggestions/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching suggestion ${id}:`, error);
    throw error;
  }
};
```

### B. Suggestion Form Component
Create `client/src/components/suggestions/SuggestionForm.tsx`:

```typescript
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { createSuggestion, SuggestionFormData } from '@/api/suggestions';

const categories = [
  { value: 'feature', label: 'New Feature' },
  { value: 'improvement', label: 'Improvement' },
  { value: 'bug', label: 'Bug Fix' },
  { value: 'design', label: 'Design Change' },
  { value: 'other', label: 'Other' }
];

export default function SuggestionForm() {
  const [formData, setFormData] = useState<SuggestionFormData>({
    title: '',
    description: '',
    category: 'feature',
    is_public: true
  });
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: checked }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      await createSuggestion(formData);
      setSuccess(true);
      setFormData({
        title: '',
        description: '',
        category: 'feature',
        is_public: true
      });
    } catch (err) {
      setError('Failed to submit suggestion. Please try again.');
      console.error('Error submitting suggestion:', err);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">Submit a Suggestion</h2>
      
      {success ? (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          Thank you for your suggestion! Our team will review it soon.
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Brief title for your suggestion"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              {categories.map(category => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows={5}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Describe your suggestion in detail..."
            />
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="is_public"
              name="is_public"
              checked={formData.is_public}
              onChange={handleCheckboxChange}
              className="h-4 w-4 text-blue-600 border-gray-300 rounded"
            />
            <label htmlFor="is_public" className="ml-2 block text-sm text-gray-700">
              Make this suggestion visible to other users
            </label>
          </div>
          
          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={loading}
              className="bg-spring text-black px-6 py-2 rounded-full border-2 border-black"
            >
              {loading ? 'Submitting...' : 'Submit Suggestion'}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
```

### C. Suggestion Card Component
Create `client/src/components/suggestions/SuggestionCard.tsx`:

```typescript
import React from 'react';
import { UserImage } from '@/components/UserImage';
import { DefaultAvatar } from '@/components/icons/DefaultAvatar';
import { Suggestion } from '@/api/suggestions';
import { Link } from 'react-router-dom';

interface SuggestionCardProps {
  suggestion: Suggestion;
}

export default function SuggestionCard({ suggestion }: SuggestionCardProps) {
  // Function to get status badge color
  const getStatusColor = (status: string = 'pending') => {
    switch (status.toLowerCase()) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-purple-100 text-purple-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };
  
  // Function to get category badge color
  const getCategoryColor = (category: string = 'other') => {
    switch (category.toLowerCase()) {
      case 'feature': return 'bg-blue-100 text-blue-800';
      case 'improvement': return 'bg-green-100 text-green-800';
      case 'bug': return 'bg-red-100 text-red-800';
      case 'design': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex items-center mb-4">
        {suggestion.user && (
          <UserImage
            user={{
              profile_image_url: suggestion.user.profile_image_url,
              profile_image_upload: suggestion.user.profile_image_upload,
              profile_image_display: suggestion.user.profile_image_display
            }}
            className="w-10 h-10 rounded-full object-cover mr-3"
            fallback={<DefaultAvatar className="w-10 h-10 mr-3" />}
          />
        )}
        
        <div>
          <h3 className="font-semibold">{suggestion.user?.username || 'Anonymous'}</h3>
          <p className="text-xs text-gray-500">
            {new Date(suggestion.created_at).toLocaleDateString()}
          </p>
        </div>
      </div>
      
      <Link to={`/suggestions/${suggestion.id}`} className="block hover:opacity-90">
        <h4 className="font-bold text-lg mb-2">{suggestion.title}</h4>
      </Link>
      
      <div className="flex flex-wrap gap-2 mb-3">
        {suggestion.category && (
          <span className={`px-2 py-1 text-xs rounded-full ${getCategoryColor(suggestion.category)}`}>
            {suggestion.category}
          </span>
        )}
        
        <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(suggestion.status)}`}>
          {suggestion.status || 'Pending'}
        </span>
      </div>
      
      <p className="text-gray-700 mb-4 line-clamp-3">
        {suggestion.description}
      </p>
      
      {suggestion.admin_comments && (
        <div className="mt-4 border-t pt-3">
          <h5 className="text-sm font-semibold text-gray-700 mb-1">Admin Response:</h5>
          <p className="text-sm text-gray-600 italic">
            {suggestion.admin_comments}
          </p>
        </div>
      )}
    </div>
  );
}
```

### D. Suggestions List Component
Create `client/src/components/suggestions/SuggestionsList.tsx`:

```typescript
import React, { useState, useEffect } from 'react';
import { fetchSuggestions, Suggestion } from '@/api/suggestions';
import SuggestionCard from '@/components/suggestions/SuggestionCard';

interface SuggestionsListProps {
  status?: string;
  category?: string;
  limit?: number;
  className?: string;
  showAll?: boolean;
}

export default function SuggestionsList({ 
  status,
  category,
  limit = 10,
  className = '',
  showAll = false
}: SuggestionsListProps) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const loadSuggestions = async () => {
      try {
        setLoading(true);
        const data = await fetchSuggestions({ status, category, limit, showAll });
        setSuggestions(data);
      } catch (err) {
        console.error('Error loading suggestions:', err);
        setError('Failed to load suggestions');
      } finally {
        setLoading(false);
      }
    };
    
    loadSuggestions();
  }, [status, category, limit, showAll]);
  
  if (loading) {
    return (
      <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 ${className}`}>
        {[...Array(limit)].map((_, i) => (
          <div key={i} className="bg-white p-6 rounded-lg shadow-md animate-pulse">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-gray-200 rounded-full mr-3"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        {error}
      </div>
    );
  }
  
  if (suggestions.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-medium text-gray-900">No suggestions yet</h3>
        <p className="mt-2 text-sm text-gray-500">
          Be the first to submit a suggestion!
        </p>
      </div>
    );
  }
  
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 ${className}`}>
      {suggestions.map((suggestion) => (
        <SuggestionCard key={suggestion.id} suggestion={suggestion} />
      ))}
    </div>
  );
}
```

### E. Suggestion Detail Component
Create `client/src/pages/suggestions/suggestion-detail.tsx`:

```typescript
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchSuggestion, Suggestion } from '@/api/suggestions';
import { UserImage } from '@/components/UserImage';
import { DefaultAvatar } from '@/components/icons/DefaultAvatar';
import { Button } from '@/components/ui/button';

export default function SuggestionDetail() {
  const { id } = useParams<{ id: string }>();
  const [suggestion, setSuggestion] = useState<Suggestion | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const loadSuggestion = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const data = await fetchSuggestion(id);
        setSuggestion(data);
      } catch (err) {
        console.error('Error loading suggestion:', err);
        setError('Failed to load suggestion details');
      } finally {
        setLoading(false);
      }
    };
    
    loadSuggestion();
  }, [id]);
  
  // Function to get status badge color
  const getStatusColor = (status: string = 'pending') => {
    switch (status.toLowerCase()) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-purple-100 text-purple-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };
  
  // Function to get category badge color
  const getCategoryColor = (category: string = 'other') => {
    switch (category.toLowerCase()) {
      case 'feature': return 'bg-blue-100 text-blue-800';
      case 'improvement': return 'bg-green-100 text-green-800';
      case 'bug': return 'bg-red-100 text-red-800';
      case 'design': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto bg-white p-8 rounded-lg shadow-md animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-3/4 mb-6"></div>
          <div className="flex items-center mb-6">
            <div className="w-12 h-12 bg-gray-200 rounded-full mr-4"></div>
            <div>
              <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-24"></div>
            </div>
          </div>
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    );
  }
  
  if (error || !suggestion) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error || 'Suggestion not found'}
        </div>
        <div className="text-center mt-6">
          <Link to="/suggestions">
            <Button variant="outline">Back to Suggestions</Button>
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <Link to="/suggestions" className="text-blue-600 hover:underline mb-6 inline-block">
          ← Back to Suggestions
        </Link>
        
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h1 className="text-2xl font-bold mb-6">{suggestion.title}</h1>
          
          <div className="flex items-center mb-6">
            {suggestion.user && (
              <UserImage
                user={{
                  profile_image_url: suggestion.user.profile_image_url,
                  profile_image_upload: suggestion.user.profile_image_upload,
                  profile_image_display: suggestion.user.profile_image_display
                }}
                className="w-12 h-12 rounded-full object-cover mr-4"
                fallback={<DefaultAvatar className="w-12 h-12 mr-4" />}
              />
            )}
            
            <div>
              <h3 className="font-semibold">{suggestion.user?.username || 'Anonymous'}</h3>
              <p className="text-sm text-gray-500">
                {new Date(suggestion.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2 mb-6">
            {suggestion.category && (
              <span className={`px-3 py-1 text-sm rounded-full ${getCategoryColor(suggestion.category)}`}>
                {suggestion.category}
              </span>
            )}
            
            <span className={`px-3 py-1 text-sm rounded-full ${getStatusColor(suggestion.status)}`}>
              {suggestion.status || 'Pending'}
            </span>
            
            {suggestion.priority && (
              <span className="px-3 py-1 text-sm rounded-full bg-gray-100 text-gray-800">
                Priority: {suggestion.priority}
              </span>
            )}
          </div>
          
          <div className="prose max-w-none mb-8">
            <p className="whitespace-pre-line">{suggestion.description}</p>
          </div>
          
          {suggestion.admin_comments && (
            <div className="mt-8 border-t pt-6">
              <h3 className="text-lg font-semibold mb-3">Admin Response:</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="whitespace-pre-line">{suggestion.admin_comments}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
```

## 3. Backend Implementation

### A. Controller
Create `server/src/controllers/suggestionController.ts`:

```typescript
import { Request, Response } from 'express';
import { suggestionService } from '../services/suggestionService';

interface AuthRequest extends Request {
  user?: {
    id: string;
    // ... other user fields
  };
}

export const suggestionController = {
  async createSuggestion(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
      }
      
      const suggestionData = {
        ...req.body,
        user_id: userId
      };
      
      const suggestion = await suggestionService.createSuggestion(suggestionData);
      
      res.status(201).json(suggestion);
    } catch (error) {
      console.error('Error creating suggestion:', error);
      res.status(500).json({ error: 'Failed to create suggestion' });
    }
  },
  
  async getSuggestions(req: Request, res: Response) {
    try {
      const status = req.query.status as string | undefined;
      const category = req.query.category as string | undefined;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const showAll = req.query.showAll === 'true';
      
      const suggestions = await suggestionService.getSuggestions({ 
        status, 
        category, 
        limit,
        showAll
      });
      
      res.json(suggestions);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      res.status(500).json({ error: 'Failed to fetch suggestions' });
    }
  },
  
  async getSuggestionById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      const suggestion = await suggestionService.getSuggestionById(id);
      
      if (!suggestion) {
        return res.status(404).json({ error: 'Suggestion not found' });
      }
      
      res.json(suggestion);
    } catch (error) {
      console.error('Error fetching suggestion:', error);
      res.status(500).json({ error: 'Failed to fetch suggestion' });
    }
  },
  
  async updateSuggestion(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
      }
      
      // Check if user is admin (for admin_comments)
      const isAdmin = await suggestionService.isUserAdmin(userId);
      
      // If not admin, check if user owns the suggestion
      if (!isAdmin) {
        const suggestion = await suggestionService.getSuggestionById(id);
        
        if (!suggestion) {
          return res.status(404).json({ error: 'Suggestion not found' });
        }
        
        if (suggestion.user_id !== userId) {
          return res.status(403).json({ error: 'Not authorized to update this suggestion' });
        }
        
        // Non-admins can't update admin_comments
        if (req.body.admin_comments !== undefined) {
          delete req.body.admin_comments;
        }
        
        // Non-admins can't update status
        if (req.body.status !== undefined) {
          delete req.body.status;
        }
      }
      
      const updatedSuggestion = await suggestionService.updateSuggestion(id, req.body);
      
      res.json(updatedSuggestion);
    } catch (error) {
      console.error('Error updating suggestion:', error);
      res.status(500).json({ error: 'Failed to update suggestion' });
    }
  },
  
  async deleteSuggestion(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
      }
      
      // Check if user is admin
      const isAdmin = await suggestionService.isUserAdmin(userId);
      
      // If not admin, check if user owns the suggestion
      if (!isAdmin) {
        const suggestion = await suggestionService.getSuggestionById(id);
        
        if (!suggestion) {
          return res.status(404).json({ error: 'Suggestion not found' });
        }
        
        if (suggestion.user_id !== userId) {
          return res.status(403).json({ error: 'Not authorized to delete this suggestion' });
        }
      }
      
      await suggestionService.deleteSuggestion(id);
      
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting suggestion:', error);
      res.status(500).json({ error: 'Failed to delete suggestion' });
    }
  }
};
```

### B. Service
Create `server/src/services/suggestionService.ts`:

```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const suggestionService = {
  async createSuggestion(data: any) {
    try {
      const suggestion = await prisma.suggestions.create({
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
      
      return this.mapSuggestionToFrontend(suggestion);
    } catch (error) {
      console.error('Error creating suggestion:', error);
      throw error;
    }
  },
  
  async getSuggestions({ 
    status, 
    category, 
    limit,
    showAll = false
  }: { 
    status?: string, 
    category?: string, 
    limit?: number,
    showAll?: boolean
  }) {
    try {
      const suggestions = await prisma.suggestions.findMany({
        where: {
          ...(status && { status }),
          ...(category && { category }),
          ...(!showAll && { is_public: true })
        },
        take: limit,
        orderBy: {
          created_at: 'desc'
        },
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
      
      return suggestions.map(this.mapSuggestionToFrontend);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      throw error;
    }
  },
  
  async getSuggestionById(id: string) {
    try {
      const suggestion = await prisma.suggestions.findUnique({
        where: { id },
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
      
      if (!suggestion) return null;
      
      return this.mapSuggestionToFrontend(suggestion);
    } catch (error) {
      console.error('Error fetching suggestion:', error);
      throw error;
    }
  },
  
  async updateSuggestion(id: string, data: any) {
    try {
      const updatedSuggestion = await prisma.suggestions.update({
        where: { id },
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
      
      return this.mapSuggestionToFrontend(updatedSuggestion);
    } catch (error) {
      console.error('Error updating suggestion:', error);
      throw error;
    }
  },
  
  async deleteSuggestion(id: string) {
    try {
      await prisma.suggestions.delete({
        where: { id }
      });
      
      return { success: true };
    } catch (error) {
      console.error('Error deleting suggestion:', error);
      throw error;
    }
  },
  
  async isUserAdmin(userId: string) {
    try {
      const user = await prisma.users.findUnique({
        where: { id: userId },
        select: { user_type: true }
      });
      
      return user?.user_type === 'admin';
    } catch (error) {
      console.error('Error checking if user is admin:', error);
      return false;
    }
  },
  
  mapSuggestionToFrontend(suggestion: any) {
    return {
      id: suggestion.id,
      user_id: suggestion.user_id,
      title: suggestion.title,
      description: suggestion.description,
      category: suggestion.category,
      priority: suggestion.priority,
      status: suggestion.status,
      admin_comments: suggestion.admin_comments,
      created_at: suggestion.created_at.toISOString(),
      updated_at: suggestion.updated_at.toISOString(),
      is_public: suggestion.is_public,
      user: suggestion.users ? {
        id: suggestion.users.id,
        username: suggestion.users.username,
        profile_image_url: suggestion.users.profile_image_url,
        profile_image_upload: suggestion.users.profile_image_upload,
        profile_image_display: suggestion.users.profile_image_display
      } : undefined
    };
  }
};
```

### C. Routes
Created `server/src/routes/suggestionRoutes.ts`:

```typescript
import express from 'express';
import { suggestionController } from '../controllers/suggestionController';
import { authenticate } from '../middlewares/auth';

const router = express.Router();

// Public routes
router.get('/', suggestionController.getSuggestions);
router.get('/:id', suggestionController.getSuggestionById);

// Protected routes
router.post('/', authenticate, suggestionController.createSuggestion);
router.put('/:id', authenticate, suggestionController.updateSuggestion);
router.delete('/:id', authenticate, suggestionController.deleteTestimonial);

// Admin routes
router.put('/:id/approve', authenticate, suggestionController.approveSuggestion);
router.put('/:id/feature', authenticate, suggestionController.featureSuggestion);

export default router;
```

### D. Register Routes
Updated `server/src/routes/index.ts` to include suggestion routes:

```typescript
import suggestionRoutes from './suggestionRoutes';

// ...

router.use('/suggestions', suggestionRoutes);
```

## 4. Suggestions Page Integration

Created `client/src/pages/suggestions.tsx` to include our new components:

```typescript
import React, { useState } from 'react';
import SuggestionsList from '@/components/suggestions/SuggestionsList';
import SuggestionForm from '@/components/suggestions/SuggestionForm';
import { Button } from '@/components/ui/button';

export default function SuggestionsPage() {
  const [activeTab, setActiveTab] = useState<'all' | 'approved' | 'pending' | 'completed'>('all');
  const [showForm, setShowForm] = useState(false);
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Suggestions</h1>
        <Button 
          onClick={() => setShowForm(!showForm)}
          className="bg-spring text-black px-6 py-2 rounded-full border-2 border-black"
        >
          {showForm ? 'Hide Form' : 'Submit Suggestion'}
        </Button>
      </div>
      
      {/* Suggestion form */}
      {showForm && (
        <div className="mb-12">
          <SuggestionForm onSuccess={() => setShowForm(false)} />
        </div>
      )}
      
      {/* Tabs for filtering */}
      <div className="flex border-b mb-8">
        <button
          className={`px-4 py-2 ${activeTab === 'all' ? 'border-b-2 border-blue-500 font-semibold' : ''}`}
          onClick={() => setActiveTab('all')}
        >
          All Suggestions
        </button>
        <button
          className={`px-4 py-2 ${activeTab === 'approved' ? 'border-b-2 border-blue-500 font-semibold' : ''}`}
          onClick={() => setActiveTab('approved')}
        >
          Approved
        </button>
        <button
          className={`px-4 py-2 ${activeTab === 'pending' ? 'border-b-2 border-blue-500 font-semibold' : ''}`}
          onClick={() => setActiveTab('pending')}
        >
          Pending
        </button>
        <button
          className={`px-4 py-2 ${activeTab === 'completed' ? 'border-b-2 border-blue-500 font-semibold' : ''}`}
          onClick={() => setActiveTab('completed')}
        >
          Completed
        </button>
      </div>
      
      {/* Suggestions list */}
      <SuggestionsList 
        status={activeTab === 'all' ? undefined : activeTab}
        limit={20}
      />
      
      {/* Additional information section */}
      <section className="mt-16 bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-6">About Suggestions</h2>
        <p className="text-gray-700 mb-4">
          We value your input! Use this page to submit suggestions for improving our platform.
          Our team reviews all suggestions and will provide feedback on implementation plans.
        </p>
        <p className="text-gray-700 mb-4">
          Approved suggestions will be added to our development roadmap, and you'll be notified
          when your suggestion is implemented.
        </p>
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="border border-gray-200 rounded p-4">
            <h3 className="font-semibold mb-2">Submit</h3>
            <p className="text-sm text-gray-600">
              Share your ideas for new features or improvements to existing ones.
            </p>
          </div>
          <div className="border border-gray-200 rounded p-4">
            <h3 className="font-semibold mb-2">Review</h3>
            <p className="text-sm text-gray-600">
              Our team reviews all suggestions and provides feedback.
            </p>
          </div>
          <div className="border border-gray-200 rounded p-4">
            <h3 className="font-semibold mb-2">Implement</h3>
            <p className="text-sm text-gray-600">
              Approved suggestions are added to our development roadmap.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
```

## 5. Data Flow

1. **User Submits Suggestion**:
   - User fills out form in `SuggestionForm` component
   - Form data is sent to `createSuggestion` API function
   - API call is made to `POST /suggestions` endpoint
   - Backend controller validates user authentication
   - Service creates record in database
   - Response is sent back to frontend
   - Success message is displayed to user

2. **Displaying Suggestions**:
   - `SuggestionsList` component mounts
   - Component calls `fetchSuggestions` API function
   - API call is made to `GET /suggestions` endpoint
   - Backend controller retrieves approved suggestions
   - Service formats data for frontend
   - Response is sent back to frontend
   - `SuggestionsList` renders `SuggestionCard` for each item

3. **Admin Feedback Flow**:
   - Admin accesses admin interface or Prisma Studio
   - Admin reviews pending suggestions
   - Admin adds comments via API call or Prisma Studio
   - Backend updates suggestion status and admin_comments
   - Updated suggestion becomes visible to users

## 6. Key Features

1. **User Authentication**:
   - Only logged-in users can submit suggestions
   - Users can only edit/delete their own suggestions

2. **Admin Feedback**:
   - Admin comments field for providing feedback
   - Status tracking (pending, approved, completed, rejected)
   - Priority assignment for implementation planning

3. **Public/Private Toggle**:
   - Users can choose whether their suggestion is visible to others
   - Private suggestions only visible to admins and the submitter

4. **Categorization**:
   - Suggestions can be categorized (feature, improvement, bug, etc.)
   - Filtering by category and status

5. **User Information**:
   - Displays user profile image
   - Shows username
   - Links to user profile

## 7. Testing Checklist

1. ✅ Database Schema
   - Add suggestions table
   - Run migration

2. ✅ Backend Implementation
   - Create suggestion service
   - Create suggestion controller
   - Set up routes
   - Register routes

3. ✅ Frontend Components
   - Create SuggestionForm component
   - Create SuggestionCard component
   - Create SuggestionsList component
   - Create suggestions page

4. ✅ Testing
   - Submit a new suggestion
   - View suggestions list
   - Test filtering by status
   - Test admin comments functionality

## 8. Future Enhancements

1. **Admin Interface**:
   - Create dedicated admin panel for suggestion management
   - Add bulk approval/rejection functionality

2. **User Voting**:
   - Allow users to upvote/downvote suggestions
   - Sort suggestions by popularity

3. **Status Updates**:
   - Notify users when their suggestion status changes
   - Add progress tracking for approved suggestions

4. **Rich Text Content**:
   - Allow formatting in suggestion descriptions
   - Support for links and basic styling

5. **Attachments**:
   - Allow users to upload screenshots or other files
   - Support for image attachments to better illustrate suggestions

This implementation provides a complete suggestions system with user submission, admin feedback, and public display capabilities.