export interface User {
  uid: string;
  email: string;
  displayName: string;
  createdAt: Date;
  status?: 'active' | 'deleted' | 'suspended';
  deletedAt?: Date;
  blockList?: string[];
  lastLoginAt?: Date;
  profileUpdatedAt?: Date;
}

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  receiverId: string;
  originalText?: string;
  translatedText?: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'video' | 'file';
  fileName?: string;
  fileSize?: number;
  timestamp: Date;
  deletedForEveryone?: boolean;
  deletedAt?: Date;
  replyTo?: {
    messageId: string;
    senderName: string;
    text: string;
  };
  readBy?: string[];
}

export interface Chat {
  id: string;
  participants: string[];
  lastMessage: string;
  lastMessageTime: Date;
  translationSettings: {
    [userId: string]: {
      enabled: boolean;
      targetLanguage: string;
    };
  };
}

export interface ChatWithUser extends Chat {
  otherUser: User;
  unreadCount?: number;
}
