import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  onSnapshot,
  Timestamp,
  addDoc,
  deleteDoc,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { Chat, Message, User } from '../types';

export const createOrGetChat = async (currentUserId: string, otherUserId: string): Promise<string> => {
  const chatsRef = collection(db, 'chats');
  const q = query(
    chatsRef,
    where('participants', 'array-contains', currentUserId)
  );

  const querySnapshot = await getDocs(q);
  let existingChat: string | null = null;

  querySnapshot.forEach((doc) => {
    const chatData = doc.data();
    if (chatData.participants.includes(otherUserId)) {
      existingChat = doc.id;
    }
  });

  if (existingChat) {
    return existingChat;
  }

  const newChatRef = doc(collection(db, 'chats'));
  await setDoc(newChatRef, {
    participants: [currentUserId, otherUserId],
    lastMessage: '',
    lastMessageTime: Timestamp.now(),
    translationSettings: {
      [currentUserId]: {
        enabled: false,
        targetLanguage: 'en',
      },
      [otherUserId]: {
        enabled: false,
        targetLanguage: 'en',
      },
    },
  });

  return newChatRef.id;
};

export const getUserChats = (userId: string, callback: (chats: Chat[]) => void) => {
  const chatsRef = collection(db, 'chats');
  const q = query(
    chatsRef,
    where('participants', 'array-contains', userId),
    orderBy('lastMessageTime', 'desc')
  );

  return onSnapshot(q, (snapshot) => {
    const chats: Chat[] = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      chats.push({
        id: doc.id,
        participants: data.participants,
        lastMessage: data.lastMessage,
        lastMessageTime: data.lastMessageTime.toDate(),
        translationSettings: data.translationSettings || {},
      });
    });
    callback(chats);
  });
};

export const getChatMessages = (chatId: string, callback: (messages: Message[]) => void) => {
  const messagesRef = collection(db, 'messages');
  const q = query(
    messagesRef,
    where('chatId', '==', chatId),
    orderBy('timestamp', 'asc')
  );

  return onSnapshot(q, (snapshot) => {
    const messages: Message[] = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      messages.push({
        id: doc.id,
        chatId: data.chatId,
        senderId: data.senderId,
        receiverId: data.receiverId,
        originalText: data.originalText,
        translatedText: data.translatedText,
        mediaUrl: data.mediaUrl,
        mediaType: data.mediaType,
        fileName: data.fileName,
        fileSize: data.fileSize,
        timestamp: data.timestamp.toDate(),
        deletedForEveryone: data.deletedForEveryone || false,
        deletedAt: data.deletedAt ? data.deletedAt.toDate() : undefined,
        replyTo: data.replyTo || undefined,
      });
    });
    callback(messages);
  });
};

export const sendMessage = async (
  chatId: string,
  senderId: string,
  receiverId: string,
  text?: string,
  mediaUrl?: string,
  mediaType?: 'image' | 'video' | 'file',
  fileName?: string,
  fileSize?: number,
  replyToId?: string,
  replyToSenderName?: string,
  replyToText?: string
): Promise<void> => {
  const messagesRef = collection(db, 'messages');
  await addDoc(messagesRef, {
    chatId,
    senderId,
    receiverId,
    originalText: text || '',
    translatedText: '',
    mediaUrl: mediaUrl || '',
    mediaType: mediaType || '',
    fileName: fileName || '',
    fileSize: fileSize || 0,
    timestamp: Timestamp.now(),
    replyTo: replyToId ? {
      messageId: replyToId,
      senderName: replyToSenderName || '',
      text: replyToText || '',
    } : null,
  });

  let lastMessage = text;
  if (!lastMessage) {
    if (mediaType === 'image') {
      lastMessage = '📷 Photo';
    } else if (mediaType === 'video') {
      lastMessage = '🎥 Video';
    } else if (mediaType === 'file') {
      lastMessage = `📎 ${fileName}`;
    }
  }

  const chatRef = doc(db, 'chats', chatId);
  await setDoc(
    chatRef,
    {
      lastMessage: lastMessage || 'Message',
      lastMessageTime: Timestamp.now(),
    },
    { merge: true }
  );
};

export const updateTranslationSettings = async (
  chatId: string,
  userId: string,
  enabled: boolean,
  targetLanguage: string
): Promise<void> => {
  const chatRef = doc(db, 'chats', chatId);
  await setDoc(
    chatRef,
    {
      translationSettings: {
        [userId]: {
          enabled,
          targetLanguage,
        },
      },
    },
    { merge: true }
  );
};

export const getAllUsers = async (): Promise<User[]> => {
  const usersRef = collection(db, 'users');
  const querySnapshot = await getDocs(usersRef);
  const users: User[] = [];

  querySnapshot.forEach((doc) => {
    const data = doc.data();
    users.push({
      uid: doc.id,
      email: data.email,
      displayName: data.displayName,
      createdAt: new Date(data.createdAt),
    });
  });

  return users;
};

export const getUser = async (userId: string): Promise<User | null> => {
  const userDoc = await getDoc(doc(db, 'users', userId));
  if (!userDoc.exists()) return null;

  const data = userDoc.data();
  return {
    uid: userDoc.id,
    email: data.email,
    displayName: data.displayName,
    createdAt: new Date(data.createdAt),
    status: data.status || 'active',
  };
};

export const deleteMessageForEveryone = async (messageId: string): Promise<void> => {
  const messageRef = doc(db, 'messages', messageId);
  await setDoc(
    messageRef,
    {
      deletedForEveryone: true,
      deletedAt: Timestamp.now(),
    },
    { merge: true }
  );
};

export const markMessagesAsRead = async (chatId: string, userId: string): Promise<void> => {
  const messagesRef = collection(db, 'messages');
  const q = query(
    messagesRef,
    where('chatId', '==', chatId),
    where('receiverId', '==', userId)
  );

  const querySnapshot = await getDocs(q);
  const promises: Promise<void>[] = [];

  querySnapshot.forEach((doc) => {
    const data = doc.data();
    const readBy = data.readBy || [];

    if (!readBy.includes(userId)) {
      promises.push(
        setDoc(
          doc.ref,
          { readBy: [...readBy, userId] },
          { merge: true }
        )
      );
    }
  });

  await Promise.all(promises);
};

export const getUnreadCount = async (chatId: string, userId: string): Promise<number> => {
  const messagesRef = collection(db, 'messages');
  const q = query(
    messagesRef,
    where('chatId', '==', chatId),
    where('receiverId', '==', userId)
  );

  const querySnapshot = await getDocs(q);
  let unreadCount = 0;

  querySnapshot.forEach((doc) => {
    const data = doc.data();
    const readBy = data.readBy || [];

    if (!readBy.includes(userId)) {
      unreadCount++;
    }
  });

  return unreadCount;
};

export const updateUserProfile = async (
  userId: string,
  displayName: string
): Promise<void> => {
  const userRef = doc(db, 'users', userId);
  await setDoc(
    userRef,
    {
      displayName,
      profileUpdatedAt: Timestamp.now(),
    },
    { merge: true }
  );
};

export const deleteUserAccount = async (userId: string): Promise<void> => {
  const userRef = doc(db, 'users', userId);
  await setDoc(
    userRef,
    {
      status: 'deleted',
      deletedAt: Timestamp.now(),
    },
    { merge: true }
  );
};

export const blockUser = async (userId: string, blockedUserId: string): Promise<void> => {
  const userRef = doc(db, 'users', userId);
  const userData = await getDoc(userRef);
  const blockList = userData.data()?.blockList || [];

  if (!blockList.includes(blockedUserId)) {
    await setDoc(
      userRef,
      {
        blockList: [...blockList, blockedUserId],
      },
      { merge: true }
    );
  }
};

export const unblockUser = async (userId: string, blockedUserId: string): Promise<void> => {
  const userRef = doc(db, 'users', userId);
  const userData = await getDoc(userRef);
  const blockList = userData.data()?.blockList || [];

  await setDoc(
    userRef,
    {
      blockList: blockList.filter((id: string) => id !== blockedUserId),
    },
    { merge: true }
  );
};

export const isUserBlocked = async (userId: string, otherUserId: string): Promise<boolean> => {
  const user = await getUser(userId);
  const otherUser = await getUser(otherUserId);

  const isBothBlocked = (user?.blockList?.includes(otherUserId) || false) ||
    (otherUser?.blockList?.includes(userId) || false);

  return isBothBlocked;
};

export const canSendMessage = async (
  senderId: string,
  recipientId: string
): Promise<{ allowed: boolean; reason?: string }> => {
  const sender = await getUser(senderId);
  const recipient = await getUser(recipientId);

  if (!recipient) {
    return { allowed: false, reason: 'User not found' };
  }

  if (recipient.status === 'deleted') {
    return { allowed: false, reason: 'This user account has been deleted' };
  }

  if (recipient.status === 'suspended') {
    return { allowed: false, reason: 'This account is temporarily unavailable' };
  }

  if (recipient.blockList?.includes(senderId)) {
    return { allowed: false, reason: 'This user has blocked you' };
  }

  if (sender?.blockList?.includes(recipientId)) {
    return { allowed: false, reason: 'You have blocked this user' };
  }

  return { allowed: true };
};

export const clearChatHistory = async (chatId: string, userId: string): Promise<void> => {
  const messagesRef = collection(db, 'messages');
  const q = query(
    messagesRef,
    where('chatId', '==', chatId)
  );

  const querySnapshot = await getDocs(q);
  const promises: Promise<void>[] = [];

  querySnapshot.forEach((doc) => {
    promises.push(deleteDoc(doc.ref));
  });

  await Promise.all(promises);
};
