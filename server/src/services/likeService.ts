import prisma from '../lib/prisma';

/**
 * Create a new like
 */
export const createLike = async (userId: string, entityType: string, entityId: string) => {
  console.log(`[LIKE SERVICE] Creating like: user=${userId}, type=${entityType}, id=${entityId}`);
  
  const like = await prisma.likes.create({
    data: {
      user_id: userId,
      entity_type: entityType,
      entity_id: entityId
    }
  });
  
  console.log(`[LIKE SERVICE] Like created successfully: ${like.id}`);
  return like;
};

/**
 * Delete a like
 */
export const deleteLike = async (likeId: string) => {
  console.log(`[LIKE SERVICE] Deleting like: id=${likeId}`);
  
  const deletedLike = await prisma.likes.delete({
    where: { id: likeId }
  });
  
  console.log(`[LIKE SERVICE] Like deleted successfully: ${likeId}`);
  return deletedLike;
};

/**
 * Get a like by user, entity type, and entity ID
 */
export const getLike = async (userId: string, entityType: string, entityId: string) => {
  console.log(`[LIKE SERVICE] Checking like status: user=${userId}, type=${entityType}, id=${entityId}`);
  
  const like = await prisma.likes.findFirst({
    where: {
      user_id: userId,
      entity_type: entityType,
      entity_id: entityId
    }
  });
  
  console.log(`[LIKE SERVICE] Like status: ${like ? 'Liked' : 'Not liked'}`);
  return like;
};

/**
 * Get the like count for an entity
 */
export const getLikeCount = async (entityType: string, entityId: string) => {
  console.log(`[LIKE SERVICE] Getting like count: type=${entityType}, id=${entityId}`);
  
  const count = await prisma.likes.count({
    where: {
      entity_type: entityType,
      entity_id: entityId
    }
  });
  
  console.log(`[LIKE SERVICE] Like count: ${count}`);
  return count;
};

/**
 * Increment the like count on an entity
 */
export const incrementLikeCount = async (entityType: string, entityId: string) => {
  console.log(`[LIKE SERVICE] Incrementing like count: type=${entityType}, id=${entityId}`);
  
  let result;
  // Update like count on the entity based on entity type
  switch (entityType) {
    case 'post':
      result = await prisma.posts.update({
        where: { id: entityId },
        data: { likes_count: { increment: 1 } }
      });
      console.log(`[LIKE SERVICE] Post like count updated: ${result.likes_count}`);
      break;
    case 'article':
      result = await prisma.articles.update({
        where: { id: entityId },
        data: { likes: { increment: 1 } }
      });
      console.log(`[LIKE SERVICE] Article like count updated: ${result.likes}`);
      break;
    case 'project':
      result = await prisma.projects.update({
        where: { id: entityId },
        data: { project_followers: { increment: 1 } }
      });
      console.log(`[LIKE SERVICE] Project followers count updated: ${result.project_followers}`);
      break;
    case 'comment':
      result = await prisma.comments.update({
        where: { id: entityId },
        data: { likes_count: { increment: 1 } }
      });
      console.log(`[LIKE SERVICE] Comment like count updated: ${result.likes_count}`);
      break;
    default:
      console.log(`[LIKE SERVICE] Unknown entity type: ${entityType}, no count updated`);
      return null;
  }
  
  return result;
};

/**
 * Decrement the like count on an entity
 */
export const decrementLikeCount = async (entityType: string, entityId: string) => {
  console.log(`[LIKE SERVICE] Decrementing like count: type=${entityType}, id=${entityId}`);
  
  let result;
  // Update like count on the entity based on entity type
  switch (entityType) {
    case 'post':
      result = await prisma.posts.update({
        where: { id: entityId },
        data: { likes_count: { decrement: 1 } }
      });
      console.log(`[LIKE SERVICE] Post like count updated: ${result.likes_count}`);
      break;
    case 'article':
      result = await prisma.articles.update({
        where: { id: entityId },
        data: { likes: { decrement: 1 } }
      });
      console.log(`[LIKE SERVICE] Article like count updated: ${result.likes}`);
      break;
    case 'project':
      result = await prisma.projects.update({
        where: { id: entityId },
        data: { project_followers: { decrement: 1 } }
      });
      console.log(`[LIKE SERVICE] Project followers count updated: ${result.project_followers}`);
      break;
    case 'comment':
      result = await prisma.comments.update({
        where: { id: entityId },
        data: { likes_count: { decrement: 1 } }
      });
      console.log(`[LIKE SERVICE] Comment like count updated: ${result.likes_count}`);
      break;
    default:
      console.log(`[LIKE SERVICE] Unknown entity type: ${entityType}, no count updated`);
      return null;
  }
  
  return result;
}; 