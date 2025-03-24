import { PrismaClient } from '@prisma/client';
import path from 'path';

const prisma = new PrismaClient();

// Get all posts with pagination
export const getPosts = async (page: number, limit: number) => {
  const skip = (page - 1) * limit;
  
  const [posts, total] = await Promise.all([
    prisma.posts.findMany({
      skip,
      take: limit,
      orderBy: {
        created_at: 'desc'
      },
      include: {
        users: {
          select: {
            username: true
          }
        }
      }
    }),
    prisma.posts.count()
  ]);
  
  // Transform posts to include username
  const transformedPosts = posts.map(post => ({
    ...post,
    username: post.users.username
  }));
  
  return {
    posts: transformedPosts,
    total
  };
};

// Get a single post by ID
export const getPostById = async (id: string) => {
  const post = await prisma.posts.findUnique({
    where: { id },
    include: {
      users: {
        select: {
          username: true
        }
      }
    }
  });
  
  if (!post) {
    return null;
  }
  
  // Transform post to include username
  return {
    ...post,
    username: post.users.username,
    // Since we don't have a comments table, we'll return an empty array
    comments: []
  };
};

// Create a new post
export const createPost = async (data: any) => {
  const post = await prisma.posts.create({
    data: {
      user_id: data.user_id,
      title: data.title,
      description: data.description,
      tags: data.tags || [],
      // Add image fields
      post_image_url: data.post_image_url || '',
      post_image_upload: data.post_image_upload || '',
      post_image_display: data.post_image_display || 'url'
    },
    include: {
      users: {
        select: {
          username: true
        }
      }
    }
  });
  
  return {
    ...post,
    username: post.users.username,
    // Ensure image fields are properly returned
    post_image_url: post.post_image_url || '',
    post_image_upload: post.post_image_upload || '',
    post_image_display: post.post_image_display || 'url'
  };
};

// Update an existing post
export const updatePost = async (id: string, data: any) => {
  const post = await prisma.posts.update({
    where: { id },
    data: {
      title: data.title,
      description: data.description,
      tags: data.tags || [],
      // Handle image fields properly
      post_image_url: data.post_image_url || '',
      post_image_upload: data.post_image_upload || '',
      post_image_display: data.post_image_display || 'url',
      updated_at: new Date()
    },
    include: {
      users: {
        select: {
          username: true
        }
      }
    }
  });
  
  return {
    ...post,
    username: post.users.username,
    // Ensure image fields are properly returned
    post_image_url: post.post_image_url || '',
    post_image_upload: post.post_image_upload || '',
    post_image_display: post.post_image_display || 'url'
  };
};

// Delete a post
export const deletePost = async (id: string) => {
  await prisma.posts.delete({
    where: { id }
  });
  
  return true;
};

// Like a post
export const likePost = async (id: string) => {
  const post = await prisma.posts.update({
    where: { id },
    data: {
      likes: {
        increment: 1
      }
    },
    include: {
      users: {
        select: {
          username: true
        }
      }
    }
  });
  
  return {
    ...post,
    username: post.users.username
  };
};

// Comment on a post
export const commentOnPost = async (id: string) => {
  const post = await prisma.posts.update({
    where: { id },
    data: {
      comments: {
        increment: 1
      }
    },
    include: {
      users: {
        select: {
          username: true
        }
      }
    }
  });
  
  return {
    ...post,
    username: post.users.username
  };
};

export const postService = {
  async uploadPostImage(id: string, file: Express.Multer.File) {
    try {
      // Store the path relative to the uploads directory
      const relativePath = `posts/${file.filename}`;
      
      console.log('Uploading post image:', relativePath);
      
      // First check if post exists
      const existingPost = await prisma.posts.findUnique({
        where: { id }
      });

      if (!existingPost) {
        throw new Error('Post not found');
      }
      
      const updatedPost = await prisma.posts.update({
        where: { id },
        data: {
          post_image_upload: relativePath,
          post_image_url: '',
          post_image_display: 'upload',
          updated_at: new Date()
        },
        include: {
          users: {
            select: {
              username: true
            }
          }
        }
      });
      
      // Log the updated post data
      console.log('Updated post image data:', {
        post_image_upload: updatedPost.post_image_upload,
        post_image_display: updatedPost.post_image_display
      });
      
      // Return consistent format
      return {
        path: relativePath,
        post: {
          ...updatedPost,
          username: updatedPost.users.username,
          post_image: `/uploads/${relativePath}`,
          post_image_url: '',
          post_image_upload: relativePath,
          post_image_display: 'upload'
        }
      };
    } catch (error) {
      console.error('Error in uploadPostImage:', error);
      throw error;
    }
  },

  // Helper function to map post data for frontend
  mapPostToFrontend(post: any) {
    return {
      ...post,
      post_image: post.post_image_display === 'url' 
        ? post.post_image_url
        : post.post_image_upload 
          ? `/uploads/${post.post_image_upload}`
          : null,
      post_image_url: post.post_image_url || '',
      post_image_upload: post.post_image_upload || '',
      post_image_display: post.post_image_display || 'url'
    };
  }
}; 