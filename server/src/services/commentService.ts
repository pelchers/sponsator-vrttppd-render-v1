import { prisma } from '../lib/prisma';

interface CreateCommentData {
  user_id: string;
  entity_type: string;
  entity_id: string;
  text: string;
}

export const createComment = async (data: CreateCommentData) => {
  return prisma.comments.create({
    data: {
      ...data,
      created_at: new Date(),
      updated_at: new Date()
    },
    include: {
      users: {
        select: {
          username: true,
          profile_image: true
        }
      }
    }
  });
};

export const getComments = async (entityType: string, entityId: string) => {
  console.log('Service: Getting comments for:', { entityType, entityId });
  try {
    // First check if the table exists
    const tableExists = await prisma.$queryRaw`
      SELECT EXISTS (
        SELECT FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename = 'comments'
      );
    `;
    console.log('Table exists check:', tableExists);

    // Try to get the first comment to test the query
    const testComment = await prisma.comments.findFirst();
    console.log('Test comment query result:', testComment);

    // If we get here, the table exists and is queryable
    const comments = await prisma.comments.findMany({
      where: {
        entity_type: entityType,
        entity_id: entityId
      },
      include: {
        users: {
          select: {
            username: true,
            profile_image: true
          }
        }
      },
      orderBy: {
        created_at: 'desc'
      }
    });
    console.log('Service: Found comments:', comments);
    return comments;
  } catch (error) {
    // More detailed error logging
    console.error('Service: Error getting comments:', {
      error,
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : 'Unknown error type',
      // If it's a Prisma error, it will have code and meta
      code: (error as any)?.code,
      meta: (error as any)?.meta
    });
    throw error;
  }
};

export const getCommentById = async (id: string) => {
  return prisma.comments.findUnique({
    where: { id }
  });
};

export const deleteComment = async (id: string) => {
  return prisma.comments.delete({
    where: { id }
  });
}; 