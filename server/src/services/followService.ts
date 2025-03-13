import prisma from '../lib/prisma';

/**
 * Create a new follow
 */
export const createFollow = async (userId: string, entityType: string, entityId: string) => {
  console.log(`[FOLLOW SERVICE] Creating follow: user=${userId}, type=${entityType}, id=${entityId}`);
  
  // Check if follow already exists
  const existingFollow = await prisma.follows.findFirst({
    where: {
      user_id: userId,
      entity_type: entityType,
      entity_id: entityId
    }
  });
  
  if (existingFollow) {
    console.log(`[FOLLOW SERVICE] Follow already exists for user=${userId}, type=${entityType}, id=${entityId}`);
    return { alreadyExists: true, follow: existingFollow };
  }
  
  // Create the follow
  const follow = await prisma.follows.create({
    data: {
      user_id: userId,
      entity_type: entityType,
      entity_id: entityId
    }
  });
  
  console.log(`[FOLLOW SERVICE] Follow created: ${follow.id}`);
  
  // Increment follow count on the entity
  await incrementFollowCount(entityType, entityId);
  
  return { follow };
};

/**
 * Delete a follow
 */
export const deleteFollow = async (userId: string, entityType: string, entityId: string) => {
  console.log(`[FOLLOW SERVICE] Deleting follow: user=${userId}, type=${entityType}, id=${entityId}`);
  
  // Find the follow
  const follow = await prisma.follows.findFirst({
    where: {
      user_id: userId,
      entity_type: entityType,
      entity_id: entityId
    }
  });
  
  if (!follow) {
    console.log(`[FOLLOW SERVICE] Follow not found for user=${userId}, type=${entityType}, id=${entityId}`);
    return null;
  }
  
  // Delete the follow
  await prisma.follows.delete({
    where: {
      id: follow.id
    }
  });
  
  console.log(`[FOLLOW SERVICE] Follow deleted: ${follow.id}`);
  
  // Decrement follow count on the entity
  await decrementFollowCount(entityType, entityId);
  
  return follow;
};

/**
 * Get a follow
 */
export const getFollow = async (userId: string, entityType: string, entityId: string) => {
  console.log(`[FOLLOW SERVICE] Getting follow: user=${userId}, type=${entityType}, id=${entityId}`);
  
  const follow = await prisma.follows.findFirst({
    where: {
      user_id: userId,
      entity_type: entityType,
      entity_id: entityId
    }
  });
  
  return follow;
};

/**
 * Get follow count for an entity
 */
export const getFollowCount = async (entityType: string, entityId: string) => {
  console.log(`[FOLLOW SERVICE] Getting follow count: type=${entityType}, id=${entityId}`);
  
  const count = await prisma.follows.count({
    where: {
      entity_type: entityType,
      entity_id: entityId
    }
  });
  
  return count;
};

/**
 * Increment follow count on an entity
 */
export const incrementFollowCount = async (entityType: string, entityId: string) => {
  console.log(`[FOLLOW SERVICE] Incrementing follow count: type=${entityType}, id=${entityId}`);
  
  let result;
  
  switch (entityType) {
    case 'user':
      result = await prisma.users.update({
        where: { id: entityId },
        data: { followers_count: { increment: 1 } }
      });
      console.log(`[FOLLOW SERVICE] User followers count updated: ${result.followers_count}`);
      break;
    case 'project':
      result = await prisma.projects.update({
        where: { id: entityId },
        data: { follows_count: { increment: 1 } }
      });
      console.log(`[FOLLOW SERVICE] Project follows count updated: ${result.follows_count}`);
      break;
    case 'article':
      result = await prisma.articles.update({
        where: { id: entityId },
        data: { follows_count: { increment: 1 } }
      });
      console.log(`[FOLLOW SERVICE] Article follows count updated: ${result.follows_count}`);
      break;
    default:
      console.log(`[FOLLOW SERVICE] Unknown entity type: ${entityType}, no count updated`);
      return null;
  }
  
  return result;
};

/**
 * Decrement follow count on an entity
 */
export const decrementFollowCount = async (entityType: string, entityId: string) => {
  console.log(`[FOLLOW SERVICE] Decrementing follow count: type=${entityType}, id=${entityId}`);
  
  let result;
  
  switch (entityType) {
    case 'user':
      result = await prisma.users.update({
        where: { id: entityId },
        data: { followers_count: { decrement: 1 } }
      });
      console.log(`[FOLLOW SERVICE] User followers count updated: ${result.followers_count}`);
      break;
    case 'project':
      result = await prisma.projects.update({
        where: { id: entityId },
        data: { follows_count: { decrement: 1 } }
      });
      console.log(`[FOLLOW SERVICE] Project follows count updated: ${result.follows_count}`);
      break;
    case 'article':
      result = await prisma.articles.update({
        where: { id: entityId },
        data: { follows_count: { decrement: 1 } }
      });
      console.log(`[FOLLOW SERVICE] Article follows count updated: ${result.follows_count}`);
      break;
    default:
      console.log(`[FOLLOW SERVICE] Unknown entity type: ${entityType}, no count updated`);
      return null;
  }
  
  return result;
};

/**
 * Get count of entities a user is following by type
 */
export const getUserFollowsCount = async (userId: string, entityType: string) => {
  console.log(`[FOLLOW SERVICE] Getting count of ${entityType}s user ${userId} is following`);
  
  const count = await prisma.follows.count({
    where: {
      user_id: userId,
      entity_type: entityType
    }
  });
  
  return count;
}; 