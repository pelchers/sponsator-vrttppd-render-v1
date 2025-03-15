import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

/**
 * Get all available chat roles
 */
export const getChatRoles = async () => {
  const roles = await prisma.chat_roles.findMany();
  return roles;
};

/**
 * Get all available chat permissions
 */
export const getChatPermissions = async () => {
  const permissions = await prisma.chat_permissions.findMany();
  return permissions;
};

/**
 * Get a user's permissions in a chat
 */
export const getUserChatPermissions = async (chatId: string, userId: string) => {
  // Get the user's role in this chat
  const participant = await prisma.chat_participants.findFirst({
    where: {
      chat_id: chatId,
      user_id: userId,
      left_at: null
    },
    include: {
      role: {
        include: {
          permissions: {
            include: {
              permission: true
            }
          }
        }
      }
    }
  });

  if (!participant) {
    throw new Error('User is not a participant in this chat');
  }

  // Extract permission names
  const permissions = participant.role.permissions.map(rp => rp.permission.name);
  
  return permissions;
}; 