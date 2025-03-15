export type ChatType = 'direct' | 'group';

export interface Chat {
  id: string;
  name: string | null;
  type: ChatType;
  created_at: string;
  updated_at: string;
  last_message_at: string;
  created_by: string;
  last_message: string | null;
  unread_count: number;
  participants: ChatParticipant[];
}

export interface ChatParticipant {
  id: string;
  chat_id: string;
  user_id: string;
  role_id: string;
  role_name?: string;
  username?: string;
  profile_image?: string;
  is_online?: boolean;
  joined_at: string;
}

export interface Message {
  id: string;
  chat_id: string;
  sender_id: string;
  parent_id: string | null;
  content: string;
  is_edited: boolean;
  is_pinned: boolean;
  created_at: string;
  updated_at: string;
  media_url?: string;
  media_type?: string;
}

export interface MessageReadReceipt {
  id: string;
  message_id: string;
  user_id: string;
  read_at: string;
}

export interface MessageMedia {
  id: string;
  message_id: string;
  url: string;
  type: string;
  filename?: string;
  size?: number;
  width?: number;
  height?: number;
  duration?: number;
} 