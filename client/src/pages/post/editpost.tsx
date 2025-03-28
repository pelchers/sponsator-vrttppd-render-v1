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
    <div className="min-h-screen w-full bg-[#FFFEFF]">
      <form onSubmit={handleSubmit}>
        <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
          {/* Basic Information */}
          <div className="bg-white p-6 rounded-2xl shadow-lg">
            <h2 className="text-2xl font-bold mb-6">{id === 'new' ? 'Create New Post' : 'Edit Post'}</h2>
            
            {/* Image section container */}
            <div className="flex flex-col items-center space-y-4">
              {/* Image Toggle Buttons */}
              <div className="flex items-center space-x-4">
                <button
                  type="button"
                  className={`
                    relative inline-flex items-center justify-center rounded-full border-2 border-black px-4 py-2 text-sm font-medium
                    transition-all duration-200 transform hover:-translate-y-0.5 active:translate-y-0 active:scale-95
                    shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none
                    ${
                      post.post_image_display === "url" 
                        ? 'bg-spring text-black' 
                        : 'bg-white text-black'
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
                  className={`
                    relative inline-flex items-center justify-center rounded-full border-2 border-black px-4 py-2 text-sm font-medium
                    transition-all duration-200 transform hover:-translate-y-0.5 active:translate-y-0 active:scale-95
                    shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none
                    ${
                      post.post_image_display === "upload" 
                        ? 'bg-spring text-black' 
                        : 'bg-white text-black'
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

              {/* URL Input or Upload Component */}
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
                    className="border border-black p-2 rounded-lg bg-white w-full"
                    placeholder="https://example.com/image.jpg"
                  />
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

            {/* Post Content */}
            <div className="space-y-4 mt-6">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700">Title</label>
                <input
                  id="title"
                  name="title"
                  type="text"
                  value={post.title}
                  onChange={handleInputChange}
                  className="border border-black p-2 rounded-lg bg-white w-full"
                  required
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  id="description"
                  name="description"
                  value={post.description}
                  onChange={handleInputChange}
                  rows={6}
                  className="border border-black p-2 rounded-lg bg-white w-full"
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
                  tagClassName="inline-flex px-1.5 py-0.5 text-[10px] rounded-full bg-turquoise-light text-black border border-black transition-all duration-250 hover:scale-105"
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="bg-white p-6 rounded-2xl shadow-lg">
            <div className="flex justify-end">
              <Button 
                type="submit" 
                className="bg-spring text-black px-6 py-2 rounded-full border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all duration-200" 
                disabled={saving}
              >
                {saving ? 'Saving...' : (id === 'new' ? 'Create Post' : 'Update Post')}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

