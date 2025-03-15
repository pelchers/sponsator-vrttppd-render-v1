import { PrismaClient } from '@prisma/client';
import { uploadFile } from '../utils/fileUpload';
const prisma = new PrismaClient();

/**
 * Get messages for a chat
 */
export const getChatMessages = async (chatId: string, userId: string, options: { page?: number; limit?: number } = {}) => {
  const { page = 1, limit = 50 } = options;
  const skip = (page - 1) * limit;

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

  // Get messages
  const messages = await prisma.messages.findMany({
    where: {
      chat_id: chatId
    },
    orderBy: {
      created_at: 'desc'
    },
    skip,
    take: limit,
    include: {
      sender: {
        select: {
          id: true,
          username: true,
          profile_image: true
        }
      }
    }
  });

  // Update last_read_at for this participant
  await prisma.chat_participants.update({
    where: { id: participant.id },
    data: {
      last_read_at: new Date()
    }
  });

  // Transform the data for the frontend
  return messages.map(message => ({
    id: message.id,
    chat_id: message.chat_id,
    sender_id: message.sender_id,
    parent_id: message.parent_id,
    content: message.content,
    is_edited: message.is_edited,
    is_pinned: false, // This would be determined by checking if there's a pinned_messages record
    created_at: message.created_at.toISOString(),
    updated_at: message.updated_at.toISOString(),
    media_url: message.media_url,
    media_type: message.media_type
  })).reverse(); // Reverse to get oldest first
};

/**
 * Send a message
 */
export const sendMessage = async (
  chatId: string,
  userId: string,
  data: {
    content: string;
    parentId?: string;
    mediaFile?: Express.Multer.File;
  }
) => {
  const { content, parentId, mediaFile } = data;

  // Check if the user is a participant in this chat
  const participant = await prisma.chat_participants.findFirst({
    where: {
      chat_id: chatId,
      user_id: userId,
      left_at: null,
      role: {
        permissions: {
          some: {
            permission: {
              name: 'send_messages'
            }
          }
        }
      }
    }
  });

  if (!participant) {
    throw new Error('User does not have permission to send messages in this chat');
  }

  // Handle media upload if present
  let mediaUrl = null;
  let mediaType = null;

  if (mediaFile) {
    // Check if user has permission to send media
    const canSendMedia = await prisma.chat_participants.findFirst({
      where: {
        chat_id: chatId,
        user_id: userId,
        left_at: null,
        role: {
          permissions: {
            some: {
              permission: {
                name: 'send_media'
              }
            }
          }
        }
      }
    });

    if (!canSendMedia) {
      throw new Error('User does not have permission to send media in this chat');
    }

    // Upload the file
    const uploadResult = await uploadFile(mediaFile);
    mediaUrl = uploadResult.url;
    mediaType = mediaFile.mimetype;
  }

  // Create the message
  const message = await prisma.messages.create({
    data: {
      chat_id: chatId,
      sender_id: userId,
      content,
      parent_id: parentId || null,
      media_url: mediaUrl,
      media_type: mediaType
    }
  });

  // Update the chat's last_message_at
  await prisma.chats.update({
    where: { id: chatId },
    data: {
      last_message_at: new Date()
    }
  });

  return {
    id: message.id,
    chat_id: message.chat_id,
    sender_id: message.sender_id,
    parent_id: message.parent_id,
    content: message.content,
    is_edited: message.is_edited,
    is_pinned: false,
    created_at: message.created_at.toISOString(),
    updated_at: message.updated_at.toISOString(),
    media_url: message.media_url,
    media_type: message.media_type
  };
};

/**
 * Edit a message
 */
export const editMessage = async (
  chatId: string,
  messageId: string,
  userId: string,
  content: string
) => {
  // Get the message
  const message = await prisma.messages.findUnique({
    where: { id: messageId }
  });

  if (!message || message.chat_id !== chatId) {
    throw new Error('Message not found');
  }

  // Check if the user is the sender or has edit_messages permission
  const isOwner = message.sender_id === userId;
  
  if (!isOwner) {
    // Check if user has edit_messages permission
    const hasPermission = await prisma.chat_participants.findFirst({
      where: {
        chat_id: chatId,
        user_id: userId,
        left_at: null,
        role: {
          permissions: {
            some: {
              permission: {
                name: 'edit_messages'
              }
            }
          }
        }
      }
    });

    if (!hasPermission) {
      throw new Error('User does not have permission to edit this message');
    }
  }

  // Update the message
  const updatedMessage = await prisma.messages.update({
    where: { id: messageId },
    data: {
      content,
      is_edited: true,
      updated_at: new Date()
    }
  });

  return {
    id: updatedMessage.id,
    chat_id: updatedMessage.chat_id,
    sender_id: updatedMessage.sender_id,
    parent_id: updatedMessage.parent_id,
    content: updatedMessage.content,
    is_edited: updatedMessage.is_edited,
    is_pinned: false, // This would be determined by checking if there's a pinned_messages record
    created_at: updatedMessage.created_at.toISOString(),
    updated_at: updatedMessage.updated_at.toISOString(),
    media_url: updatedMessage.media_url,
    media_type: updatedMessage.media_type
  };
};

/**
 * Delete a message
 */
export const deleteMessage = async (
  chatId: string,
  messageId: string,
  userId: string
) => {
  // Get the message
  const message = await prisma.messages.findUnique({
    where: { id: messageId }
  });

  if (!message || message.chat_id !== chatId) {
    throw new Error('Message not found');
  }

  // Check if the user is the sender or has delete_messages permission
  const isOwner = message.sender_id === userId;
  
  if (!isOwner) {
    // Check if user has delete_messages permission
    const hasPermission = await prisma.chat_participants.findFirst({
      where: {
        chat_id: chatId,
        user_id: userId,
        left_at: null,
        role: {
          permissions: {
            some: {
              permission: {
                name: 'delete_messages'
              }
            }
          }
        }
      }
    });

    if (!hasPermission) {
      throw new Error('User does not have permission to delete this message');
    }
  }

  // Delete the message
  await prisma.messages.delete({
    where: { id: messageId }
  });

  return { success: true };
};

/**
 * Pin a message
 */
export const pinMessage = async (
  chatId: string,
  messageId: string,
  userId: string
) => {
  // Check if the message exists and belongs to this chat
  const message = await prisma.messages.findFirst({
    where: {
      id: messageId,
      chat_id: chatId
    },
    include: {
      sender: {
        select: {
          id: true,
          username: true,
          profile_image: true
        }
      }
    }
  });

  if (!message) {
    throw new Error('Message not found');
  }

  // Check if the user has permission to pin messages
  const hasPermission = await prisma.chat_participants.findFirst({
    where: {
      chat_id: chatId,
      user_id: userId,
      left_at: null,
      role: {
        permissions: {
          some: {
            permission: {
              name: 'pin_messages'
            }
          }
        }
      }
    }
  });

  if (!hasPermission) {
    throw new Error('User does not have permission to pin messages');
  }

  // Update the message to set is_pinned to true
  const updatedMessage = await prisma.messages.update({
    where: { id: messageId },
    data: { is_pinned: true },
    include: {
      sender: {
        select: {
          id: true,
          username: true,
          profile_image: true
        }
      }
    }
  });

  return {
    ...updatedMessage,
    created_at: updatedMessage.created_at.toISOString(),
    updated_at: updatedMessage.updated_at.toISOString()
  };
};

/**
 * Unpin a message
 */
export const unpinMessage = async (
  chatId: string,
  messageId: string,
  userId: string
) => {
  // Check if the message exists and belongs to this chat
  const message = await prisma.messages.findFirst({
    where: {
      id: messageId,
      chat_id: chatId
    },
    include: {
      sender: {
        select: {
          id: true,
          username: true,
          profile_image: true
        }
      }
    }
  });

  if (!message) {
    throw new Error('Message not found');
  }

  // Check if the user has permission to pin messages
  const hasPermission = await prisma.chat_participants.findFirst({
    where: {
      chat_id: chatId,
      user_id: userId,
      left_at: null,
      role: {
        permissions: {
          some: {
            permission: {
              name: 'pin_messages'
            }
          }
        }
      }
    }
  });

  if (!hasPermission) {
    throw new Error('User does not have permission to unpin messages');
  }

  // Update the message to set is_pinned to false
  const updatedMessage = await prisma.messages.update({
    where: { id: messageId },
    data: { is_pinned: false },
    include: {
      sender: {
        select: {
          id: true,
          username: true,
          profile_image: true
        }
      }
    }
  });

  return {
    ...updatedMessage,
    created_at: updatedMessage.created_at.toISOString(),
    updated_at: updatedMessage.updated_at.toISOString()
  };
}; 