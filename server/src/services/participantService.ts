import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

/**
 * Add a participant to a chat
 */
export const addParticipant = async (
  chatId: string,
  userId: string,
  data: {
    userId: string;
    roleId: string;
  }
) => {
  const { userId: newUserId, roleId } = data;

  // Check if the user has permission to add participants
  const hasPermission = await prisma.chat_participants.findFirst({
    where: {
      chat_id: chatId,
      user_id: userId,
      left_at: null,
      role: {
        permissions: {
          some: {
            permission: {
              name: 'add_users'
            }
          }
        }
      }
    }
  });

  if (!hasPermission) {
    throw new Error('User does not have permission to add participants');
  }

  // Check if the user is already a participant
  const existingParticipant = await prisma.chat_participants.findFirst({
    where: {
      chat_id: chatId,
      user_id: newUserId,
      left_at: null
    }
  });

  if (existingParticipant) {
    throw new Error('User is already a participant in this chat');
  }

  // Add the participant
  const participant = await prisma.chat_participants.create({
    data: {
      chat_id: chatId,
      user_id: newUserId,
      role_id: roleId
    },
    include: {
      user: {
        select: {
          id: true,
          username: true,
          profile_image: true
        }
      },
      role: {
        select: {
          id: true,
          name: true
        }
      }
    }
  });

  return {
    id: participant.id,
    chat_id: participant.chat_id,
    user_id: participant.user_id,
    role_id: participant.role_id,
    role_name: participant.role.name,
    username: participant.user.username,
    profile_image: participant.user.profile_image,
    joined_at: participant.joined_at.toISOString()
  };
};

/**
 * Update a participant's role
 */
export const updateParticipantRole = async (
  chatId: string,
  userId: string,
  targetUserId: string,
  roleId: string
) => {
  try {
    // Check if the user has permission to change roles
    const hasPermission = await prisma.chat_participants.findFirst({
      where: {
        chat_id: chatId,
        user_id: userId,
        left_at: null,
        role: {
          permissions: {
            some: {
              permission: {
                name: 'change_roles'
              }
            }
          }
        }
      }
    });

    if (!hasPermission) {
      throw new Error('User does not have permission to change roles');
    }

    // Get the target participant
    const targetParticipant = await prisma.chat_participants.findFirst({
      where: {
        chat_id: chatId,
        user_id: targetUserId,
        left_at: null
      }
    });

    if (!targetParticipant) {
      throw new Error('Target user is not a participant in this chat');
    }

    // Get the role to verify it exists
    const role = await prisma.chat_roles.findUnique({
      where: { id: roleId }
    });

    if (!role) {
      throw new Error('Invalid role');
    }

    // Update the participant's role
    const updatedParticipant = await prisma.chat_participants.update({
      where: { id: targetParticipant.id },
      data: { role_id: roleId },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            profile_image: true
          }
        },
        role: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    return {
      id: updatedParticipant.id,
      chat_id: updatedParticipant.chat_id,
      user_id: updatedParticipant.user_id,
      role_id: updatedParticipant.role_id,
      role_name: updatedParticipant.role.name,
      username: updatedParticipant.user.username,
      profile_image: updatedParticipant.user.profile_image,
      joined_at: updatedParticipant.joined_at.toISOString()
    };
  } catch (error) {
    console.error('Error updating participant role:', error);
    throw error;
  }
};

/**
 * Remove a participant from a chat
 */
export const removeParticipant = async (
  chatId: string,
  userId: string,
  targetUserId: string
) => {
  // Check if the user has permission to remove participants
  const hasPermission = await prisma.chat_participants.findFirst({
    where: {
      chat_id: chatId,
      user_id: userId,
      left_at: null,
      role: {
        permissions: {
          some: {
            permission: {
              name: 'remove_users'
            }
          }
        }
      }
    }
  });

  if (!hasPermission) {
    throw new Error('User does not have permission to remove participants');
  }

  // Get the target participant
  const targetParticipant = await prisma.chat_participants.findFirst({
    where: {
      chat_id: chatId,
      user_id: targetUserId,
      left_at: null
    }
  });

  if (!targetParticipant) {
    throw new Error('Target user is not a participant in this chat');
  }

  // Update the participant record to mark as left
  await prisma.chat_participants.update({
    where: { id: targetParticipant.id },
    data: {
      left_at: new Date()
    }
  });

  return { success: true };
}; 