import { Request, Response } from 'express';
import * as postService from '../services/postService';

// Get all posts with pagination
export const getPosts = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    
    const result = await postService.getPosts(page, limit);
    
    res.json({
      data: result.posts,
      total: result.total,
      page,
      limit,
      totalPages: Math.ceil(result.total / limit)
    });
  } catch (error) {
    console.error('Error in getPosts controller:', error);
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
};

// Get a single post by ID
export const getPost = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const post = await postService.getPostById(id);
    
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }
    
    res.json(post);
  } catch (error) {
    console.error(`Error in getPost controller for id ${req.params.id}:`, error);
    res.status(500).json({ error: 'Failed to fetch post' });
  }
};

// Create a new post
export const createPost = async (req: Request, res: Response) => {
  try {
    // Get user ID from authenticated request
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    const postData = {
      ...req.body,
      user_id: userId
    };
    
    const newPost = await postService.createPost(postData);
    res.status(201).json(newPost);
  } catch (error) {
    console.error('Error in createPost controller:', error);
    res.status(500).json({ error: 'Failed to create post' });
  }
};

// Update an existing post
export const updatePost = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    // Check if post exists and belongs to the user
    const existingPost = await postService.getPostById(id);
    
    if (!existingPost) {
      return res.status(404).json({ error: 'Post not found' });
    }
    
    if (existingPost.user_id !== userId) {
      return res.status(403).json({ error: 'You do not have permission to update this post' });
    }
    
    const updatedPost = await postService.updatePost(id, req.body);
    res.json(updatedPost);
  } catch (error) {
    console.error(`Error in updatePost controller for id ${req.params.id}:`, error);
    res.status(500).json({ error: 'Failed to update post' });
  }
};

// Delete a post
export const deletePost = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    // Check if post exists and belongs to the user
    const existingPost = await postService.getPostById(id);
    
    if (!existingPost) {
      return res.status(404).json({ error: 'Post not found' });
    }
    
    if (existingPost.user_id !== userId) {
      return res.status(403).json({ error: 'You do not have permission to delete this post' });
    }
    
    await postService.deletePost(id);
    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error(`Error in deletePost controller for id ${req.params.id}:`, error);
    res.status(500).json({ error: 'Failed to delete post' });
  }
};

// Like a post
export const likePost = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    const post = await postService.likePost(id);
    
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }
    
    res.json(post);
  } catch (error) {
    console.error(`Error in likePost controller for id ${req.params.id}:`, error);
    res.status(500).json({ error: 'Failed to like post' });
  }
};

// Comment on a post
export const commentOnPost = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const { content } = req.body;
    
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    if (!content || typeof content !== 'string') {
      return res.status(400).json({ error: 'Comment content is required' });
    }
    
    const post = await postService.commentOnPost(id);
    
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }
    
    // In a real implementation, we would store the comment in a separate table
    // For now, we're just incrementing the comments count
    
    // Create a mock comment response
    const comment = {
      id: `comment-${Date.now()}`,
      user_id: userId,
      username: req.user?.username || 'Anonymous',
      content,
      created_at: new Date().toISOString()
    };
    
    res.json({ 
      post,
      comment
    });
  } catch (error) {
    console.error(`Error in commentOnPost controller for id ${req.params.id}:`, error);
    res.status(500).json({ error: 'Failed to comment on post' });
  }
};

export const uploadCoverImage = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Check if user owns the post
    const post = await postService.getPostById(id);
    if (!post || post.user_id !== userId) {
      return res.status(403).json({ error: 'Not authorized to update this post' });
    }
    
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    // Log the upload attempt
    console.log('Attempting to upload post image:', {
      postId: id,
      userId,
      file: req.file.filename
    });

    const result = await postService.postService.uploadPostImage(id, req.file);
    
    // Log the response being sent
    console.log('Upload successful, sending response:', result);
    
    res.status(200).json(result);
  } catch (error) {
    console.error('Error in uploadCoverImage:', error);
    res.status(500).json({ error: 'Failed to upload post image' });
  }
};

export const updatePostHandler = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const post = await postService.updatePost(id, userId, req.body);
    
    if (!post) {
      return res.status(404).json({ error: 'Post not found or you do not have permission to update it' });
    }
    
    res.status(200).json(postService.mapPostToFrontend(post));
  } catch (error) {
    console.error('Error updating post:', error);
    res.status(500).json({ error: 'Failed to update post' });
  }
}; 