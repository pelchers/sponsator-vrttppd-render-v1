"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from 'react-router-dom'
import { Button } from "@/components/ui/button"
import { createPost, updatePost, fetchPost, uploadPostCoverImage } from "@/api/posts"
import TagInput from "@/components/input/forms/TagInput"
import PostImageUpload from "@/components/input/forms/PostImageUpload"
import { API_URL } from '@/config'

interface Post {
  id?: string
  title: string
  description: string
  post_image_url?: string
  post_image_upload?: string
  post_image_display?: 'url' | 'upload'
  tags: string[]
}

export default function PostEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState<Post>({
    title: "",
    description: "",
    post_image_url: "",
    post_image_upload: "",
    post_image_display: "url",
    tags: []
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

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
              post_image_url: data.post_image_url || '',
              post_image_upload: data.post_image_upload || '',
              post_image_display: data.post_image_display || 'url',
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

  const handleImageSelect = async (file: File) => {
    try {
      if (id) {
        const result = await uploadPostCoverImage(id, file);
        setPost(prev => ({
          ...prev,
          post_image_upload: result.path,
          post_image_url: '',
          post_image_display: 'upload'
        }));
      }
    } catch (error) {
      console.error('Failed to upload image:', error);
      // Handle error (show message to user)
    }
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
      const postData = {
        title: post.title,
        description: post.description,
        post_image_url: post.post_image_url || '',
        post_image_upload: post.post_image_upload || '',
        post_image_display: post.post_image_display || 'url',
        tags: post.tags
      };
      
      console.log('Submitting post data:', postData);
      
      let response;
      if (id && id !== 'new') {
        response = await updatePost(id, postData);
      } else {
        response = await createPost(postData);
      }
      
      console.log('API response:', response);
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
            
            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700">Post Image</label>
              
              <div className="flex items-center space-x-4">
                <button
                  type="button"
                  className={`px-4 py-2 rounded transition-colors ${
                    post.post_image_display === "url" 
                      ? "bg-blue-500 text-white" 
                      : "bg-gray-200 hover:bg-gray-300"
                  }`}
                  onClick={() => setPost(prev => ({ 
                    ...prev, 
                    post_image_display: "url",
                    post_image_upload: "" 
                  }))}
                >
                  Use URL Image
                </button>
                <button
                  type="button"
                  className={`px-4 py-2 rounded transition-colors ${
                    post.post_image_display === "upload" 
                      ? "bg-blue-500 text-white" 
                      : "bg-gray-200 hover:bg-gray-300"
                  }`}
                  onClick={() => setPost(prev => ({ 
                    ...prev, 
                    post_image_display: "upload",
                    post_image_url: "" 
                  }))}
                >
                  Use Uploaded Image
                </button>
              </div>

              {post.post_image_display === "url" ? (
                <div className="w-full max-w-md">
                  <label className="block text-sm font-medium text-gray-700">
                    Image URL
                  </label>
                  <input
                    type="url"
                    name="post_image_url"
                    value={post.post_image_url || ''}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    placeholder="https://example.com/image.jpg"
                  />
                  {post.post_image_url && (
                    <div className="mt-2">
                      <img
                        src={post.post_image_url}
                        alt="Post preview"
                        className="max-h-64 rounded-md object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = 'https://via.placeholder.com/640x360?text=Invalid+Image+URL';
                        }}
                      />
                    </div>
                  )}
                </div>
              ) : (
                <PostImageUpload 
                  onImageSelect={handleImageSelect}
                  currentImage={
                    post.post_image_upload 
                      ? `${API_URL.replace("/api", "")}/uploads/${post.post_image_upload}`
                      : undefined
                  }
                  showPreview={true}
                />
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

