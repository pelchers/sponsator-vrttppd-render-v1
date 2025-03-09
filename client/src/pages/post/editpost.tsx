"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from 'react-router-dom'
import { Button } from "@/components/ui/button"
import { createPost, updatePost, fetchPost } from "@/api/posts"
import TagInput from "@/components/input/forms/TagInput"

interface Post {
  id?: string
  title: string
  description: string
  mediaUrl?: string
  tags: string[]
}

export default function PostEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState<Post>({
    title: "",
    description: "",
    mediaUrl: "",
    tags: []
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Fetch post data if editing an existing post
  useEffect(() => {
    if (id && id !== 'new') {
      setLoading(true);
      fetchPost(id)
        .then(data => {
          if (data) {
            setPost({
              id: data.id,
              title: data.title || '',
              description: data.description || '',
              mediaUrl: data.mediaUrl || '',
              tags: data.tags || []
            });
          }
        })
        .catch(error => {
          console.error('Error fetching post:', error);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [id]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setPost(prev => ({ ...prev, [name]: value }));
  };

  const handleAddTag = (tag: string) => {
    if (!post.tags.includes(tag)) {
      setPost({
        ...post,
        tags: [...post.tags, tag]
      });
    }
  };

  const handleRemoveTag = (tag: string) => {
    setPost({
      ...post,
      tags: post.tags.filter(t => t !== tag)
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      // Prepare data for API
      const postData = {
        title: post.title,
        description: post.description,
        mediaUrl: post.mediaUrl,
        tags: post.tags
      };
      
      console.log('Submitting post data:', postData);
      
      let response;
      if (id && id !== 'new') {
        // Update existing post
        response = await updatePost(id, postData);
      } else {
        // Create new post
        response = await createPost(postData);
      }
      
      console.log('API response:', response);
      
      // Navigate to post view page
      navigate(`/post/${response.id}`);
    } catch (error) {
      console.error('Error saving post:', error);
      alert('Failed to save post. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="container mx-auto px-4 py-8">Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">{id === 'new' ? 'Create New Post' : 'Edit Post'}</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">Title</label>
              <input
                id="title"
                name="title"
                type="text"
                value={post.title}
                onChange={handleInputChange}
                placeholder="Enter post title"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                required
              />
            </div>
            
            <div>
              <label htmlFor="mediaUrl" className="block text-sm font-medium text-gray-700">Media URL</label>
              <input
                id="mediaUrl"
                name="mediaUrl"
                type="text"
                value={post.mediaUrl}
                onChange={handleInputChange}
                placeholder="Enter media URL"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
              {post.mediaUrl && (
                <div className="mt-2">
                  <img 
                    src={post.mediaUrl} 
                    alt="Post media preview" 
                    className="max-h-64 rounded-md object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = 'https://via.placeholder.com/640x360?text=Image+Not+Found';
                    }}
                  />
                </div>
              )}
            </div>
            
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                id="description"
                name="description"
                value={post.description}
                onChange={handleInputChange}
                placeholder="Write your post description here..."
                rows={6}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                required
              />
            </div>
            
            <div>
              <TagInput
                label="Tags"
                tags={post.tags}
                onAddTag={handleAddTag}
                onRemoveTag={handleRemoveTag}
                placeholder="Add a tag..."
              />
            </div>
          </div>
        </div>
        
        <Button 
          type="submit" 
          className="bg-blue-500 hover:bg-blue-600 text-white" 
          disabled={saving}
        >
          {saving ? 'Saving...' : (id === 'new' ? 'Create Post' : 'Update Post')}
        </Button>
      </form>
    </div>
  );
}

