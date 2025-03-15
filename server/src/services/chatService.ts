import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

/**
 * Get all chats for a user
 */
export const getUserChats = async (userId: string) => {
  const chats = await prisma.chats.findMany({
    where: {
      participants: {
        some: {
          user_id: userId,
          left_at: null // Only include chats the user hasn't left
        }
      }
    },
    include: {
      participants: {
        where: {
          left_at: null // Only include active participants
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
      },
      messages: {
        orderBy: {
          created_at: 'desc'
        },
        take: 1
      }
    },
    orderBy: {
      last_message_at: 'desc'
    }
  });

  // Transform the data for the frontend
  return chats.map(chat => {
    const participants = chat.participants.map(p => ({
      id: p.id,
      chat_id: p.chat_id,
      user_id: p.user_id,
      role_id: p.role_id,
      role_name: p.role.name,
      username: p.user.username,
      profile_image: p.user.profile_image,
      joined_at: p.joined_at.toISOString()
    }));

    // Get unread count for this user
    const unreadCount = 0; // This would be calculated based on last_read_at

    return {
      id: chat.id,
      name: chat.name,
      type: chat.type,
      created_at: chat.created_at.toISOString(),
      updated_at: chat.updated_at.toISOString(),
      last_message_at: chat.last_message_at.toISOString(),
      created_by: chat.created_by,
      last_message: chat.messages[0]?.content || null,
      unread_count: unreadCount,
      participants
    };
  });
};

/**
 * Get a specific chat by ID
 */
export const getChatById = async (chatId: string, userId: string) => {
  // First check if the user is a participant in this chat
  const participant = await prisma.chat_participants.findFirst({
    where: {
      chat_id: chatId,
      user_id: userId,
      left_at: null
    }
  });

  if (!participant) {
    throw new Error('User is not a participant in this chat');
  }

  const chat = await prisma.chats.findUnique({
    where: { id: chatId },
    include: {
      participants: {
        where: {
          left_at: null
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
      }
    }
  });

  if (!chat) {
    throw new Error('Chat not found');
  }

  // Transform the data for the frontend
  const participants = chat.participants.map(p => ({
    id: p.id,
    chat_id: p.chat_id,
    user_id: p.user_id,
    role_id: p.role_id,
    role_name: p.role.name,
    username: p.user.username,
    profile_image: p.user.profile_image,
    joined_at: p.joined_at.toISOString()
  }));

  return {
    id: chat.id,
    name: chat.name,
    type: chat.type,
    created_at: chat.created_at.toISOString(),
    updated_at: chat.updated_at.toISOString(),
    last_message_at: chat.last_message_at.toISOString(),
    created_by: chat.created_by,
    participants
  };
};

/**
 * Create a new chat
 */
export const createChat = async (
  userId: string,
  data: {
    type: 'direct' | 'group';
    name?: string;
    participants: string[];
  }
) => {
  const { type, name, participants } = data;

  // For direct chats, ensure there are exactly 2 participants (including the creator)
  if (type === 'direct' && participants.length !== 1) {
    throw new Error('Direct chats must have exactly one other participant');
  }

  // For group chats, ensure there's a name
  if (type === 'group' && !name) {
    throw new Error('Group chats must have a name');
  }

  // Get the owner and chatter roles first
  const [ownerRole, chatterRole] = await Promise.all([
    prisma.chat_roles.findUnique({ where: { name: 'owner' } }),
    prisma.chat_roles.findUnique({ where: { name: 'chatter' } })
  ]);

  if (!ownerRole || !chatterRole) {
    throw new Error('Required roles not found');
  }

  // Create the chat
  const chat = await prisma.chats.create({
    data: {
      type,
      name,
      created_by: userId,
      participants: {
        create: [
          // Creator with owner role
          {
            user_id: userId,
            role_id: ownerRole.id
          },
          // Other participants with chatter role
          ...participants.map(participantId => ({
            user_id: participantId,
            role_id: chatterRole.id
          }))
        ]
      }
    },
    include: {
      participants: {
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
      }
    }
  });

  return {
    id: chat.id,
    name: chat.name,
    type: chat.type,
    created_at: chat.created_at.toISOString(),
    updated_at: chat.updated_at.toISOString(),
    last_message_at: chat.last_message_at.toISOString(),
    created_by: chat.created_by,
    participants: chat.participants.map(p => ({
      id: p.id,
      chat_id: p.chat_id,
      user_id: p.user_id,
      role_id: p.role_id,
      role_name: p.role.name,
      username: p.user.username,
      profile_image: p.user.profile_image,
      joined_at: p.joined_at.toISOString()
    }))
  };
};

/**
 * Update a chat
 */
export const updateChat = async (
  chatId: string,
  userId: string,
  data: { name?: string }
) => {
  // Check if the user has permission to update the chat
  const participant = await prisma.chat_participants.findFirst({
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

  if (!participant) {
    throw new Error('User does not have permission to update this chat');
  }

  // Update the chat
  const chat = await prisma.chats.update({
    where: { id: chatId },
    data: {
      name: data.name,
      updated_at: new Date()
    },
    include: {
      participants: {
        where: {
          left_at: null
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
      }
    }
  });

  // Transform the data for the frontend
  const participants = chat.participants.map(p => ({
    id: p.id,
    chat_id: p.chat_id,
    user_id: p.user_id,
    role_id: p.role_id,
    role_name: p.role.name,
    username: p.user.username,
    profile_image: p.user.profile_image,
    joined_at: p.joined_at.toISOString()
  }));

  return {
    id: chat.id,
    name: chat.name,
    type: chat.type,
    created_at: chat.created_at.toISOString(),
    updated_at: chat.updated_at.toISOString(),
    last_message_at: chat.last_message_at.toISOString(),
    created_by: chat.created_by,
    participants
  };
};

/**
 * Delete a chat
 */
export const deleteChat = async (chatId: string, userId: string) => {
  // Check if the user has permission to delete the chat
  const participant = await prisma.chat_participants.findFirst({
    where: {
      chat_id: chatId,
      user_id: userId,
      left_at: null,
      role: {
        permissions: {
          some: {
            permission: {
              name: 'delete_chat'
            }
          }
        }
      }
    }
  });

  if (!participant) {
    throw new Error('User does not have permission to delete this chat');
  }

  // Delete the chat
  await prisma.chats.delete({
    where: { id: chatId }
  });

  return { success: true };
};

/**
 * Leave a chat
 */
export const leaveChat = async (chatId: string, userId: string) => {
  // Check if the user is a participant in this chat
  const participant = await prisma.chat_participants.findFirst({
    where: {
      chat_id: chatId,
      user_id: userId,
      left_at: null
    }
  });

  if (!participant) {
    throw new Error('User is not a participant in this chat');
  }

  // Update the participant record to mark as left
  await prisma.chat_participants.update({
    where: { id: participant.id },
    data: {
      left_at: new Date()
    }
  });

  return { success: true };
}; 