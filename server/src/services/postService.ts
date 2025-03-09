import { PrismaClient } from '@prisma/client';

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
      mediaUrl: data.mediaUrl,
      description: data.description,
      tags: data.tags || []
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

// Update an existing post
export const updatePost = async (id: string, data: any) => {
  const post = await prisma.posts.update({
    where: { id },
    data: {
      title: data.title,
      mediaUrl: data.mediaUrl,
      description: data.description,
      tags: data.tags || [],
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
    username: post.users.username
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