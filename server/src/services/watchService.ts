import prisma from '../lib/prisma';

/**
 * Create a new watch
 */
export const createWatch = async (userId: string, entityType: string, entityId: string) => {
  console.log(`[WATCH SERVICE] Creating watch: user=${userId}, type=${entityType}, id=${entityId}`);
  
  // Check if watch already exists
  const existingWatch = await prisma.watches.findFirst({
    where: {
      user_id: userId,
      entity_type: entityType,
      entity_id: entityId
    }
  });
  
  if (existingWatch) {
    console.log(`[WATCH SERVICE] Watch already exists for user=${userId}, type=${entityType}, id=${entityId}`);
    return { alreadyExists: true, watch: existingWatch };
  }
  
  // Create the watch
  const watch = await prisma.watches.create({
    data: {
      user_id: userId,
      entity_type: entityType,
      entity_id: entityId
    }
  });
  
  console.log(`[WATCH SERVICE] Watch created: ${watch.id}`);
  
  // Increment watch count on the entity
  await incrementWatchCount(entityType, entityId);
  
  return { watch };
};

/**
 * Delete a watch
 */
export const deleteWatch = async (userId: string, entityType: string, entityId: string) => {
  console.log(`[WATCH SERVICE] Deleting watch: user=${userId}, type=${entityType}, id=${entityId}`);
  
  // Find the watch
  const watch = await prisma.watches.findFirst({
    where: {
      user_id: userId,
      entity_type: entityType,
      entity_id: entityId
    }
  });
  
  if (!watch) {
    console.log(`[WATCH SERVICE] Watch not found for user=${userId}, type=${entityType}, id=${entityId}`);
    return null;
  }
  
  // Delete the watch
  await prisma.watches.delete({
    where: {
      id: watch.id
    }
  });
  
  console.log(`[WATCH SERVICE] Watch deleted: ${watch.id}`);
  
  // Decrement watch count on the entity
  await decrementWatchCount(entityType, entityId);
  
  return watch;
};

/**
 * Get a watch
 */
export const getWatch = async (userId: string, entityType: string, entityId: string) => {
  console.log(`[WATCH SERVICE] Getting watch: user=${userId}, type=${entityType}, id=${entityId}`);
  
  const watch = await prisma.watches.findFirst({
    where: {
      user_id: userId,
      entity_type: entityType,
      entity_id: entityId
    }
  });
  
  return watch;
};

/**
 * Get watch count for an entity
 */
export const getWatchCount = async (entityType: string, entityId: string) => {
  console.log(`[WATCH SERVICE] Getting watch count: type=${entityType}, id=${entityId}`);
  
  const count = await prisma.watches.count({
    where: {
      entity_type: entityType,
      entity_id: entityId
    }
  });
  
  return count;
};

/**
 * Increment watch count on an entity
 */
export const incrementWatchCount = async (entityType: string, entityId: string) => {
  console.log(`[WATCH SERVICE] Incrementing watch count: type=${entityType}, id=${entityId}`);
  
  let result;
  
  switch (entityType) {
    case 'project':
      result = await prisma.projects.update({
        where: { id: entityId },
        data: { watches_count: { increment: 1 } }
      });
      console.log(`[WATCH SERVICE] Project watches count updated: ${result.watches_count}`);
      break;
    case 'article':
      result = await prisma.articles.update({
        where: { id: entityId },
        data: { watches_count: { increment: 1 } }
      });
      console.log(`[WATCH SERVICE] Article watches count updated: ${result.watches_count}`);
      break;
    default:
      console.log(`[WATCH SERVICE] Unknown entity type: ${entityType}, no count updated`);
      return null;
  }
  
  return result;
};

/**
 * Decrement watch count on an entity
 */
export const decrementWatchCount = async (entityType: string, entityId: string) => {
  console.log(`[WATCH SERVICE] Decrementing watch count: type=${entityType}, id=${entityId}`);
  
  let result;
  
  switch (entityType) {
    case 'project':
      result = await prisma.projects.update({
        where: { id: entityId },
        data: { watches_count: { decrement: 1 } }
      });
      console.log(`[WATCH SERVICE] Project watches count updated: ${result.watches_count}`);
      break;
    case 'article':
      result = await prisma.articles.update({
        where: { id: entityId },
        data: { watches_count: { decrement: 1 } }
      });
      console.log(`[WATCH SERVICE] Article watches count updated: ${result.watches_count}`);
      break;
    default:
      console.log(`[WATCH SERVICE] Unknown entity type: ${entityType}, no count updated`);
      return null;
  }
  
  return result;
};

/**
 * Get count of entities a user is watching by type
 */
export const getUserWatchesCount = async (userId: string, entityType: string) => {
  console.log(`[WATCH SERVICE] Getting count of ${entityType}s user ${userId} is watching`);
  
  const count = await prisma.watches.count({
    where: {
      user_id: userId,
      entity_type: entityType
    }
  });
  
  return count;
}; 