const DELETED_MESSAGES_KEY = 'deleted_messages';

export const getDeletedMessagesForChat = (chatId: string): Set<string> => {
  const storageKey = `${DELETED_MESSAGES_KEY}_${chatId}`;
  const deleted = localStorage.getItem(storageKey);
  return deleted ? new Set(JSON.parse(deleted)) : new Set();
};

export const addLocalDeletedMessage = (chatId: string, messageId: string): void => {
  const storageKey = `${DELETED_MESSAGES_KEY}_${chatId}`;
  const deleted = getDeletedMessagesForChat(chatId);
  deleted.add(messageId);
  localStorage.setItem(storageKey, JSON.stringify(Array.from(deleted)));
};

export const isMessageLocallyDeleted = (chatId: string, messageId: string): boolean => {
  return getDeletedMessagesForChat(chatId).has(messageId);
};

export const canDeleteForEveryone = (sentTimestamp: Date): boolean => {
  const now = new Date();
  const timeDiffMs = now.getTime() - sentTimestamp.getTime();
  const hours24Ms = 24 * 60 * 60 * 1000;
  return timeDiffMs < hours24Ms;
};

export const getTimeUntilExpiry = (sentTimestamp: Date): string => {
  const now = new Date();
  const timeDiffMs = now.getTime() - sentTimestamp.getTime();
  const hours24Ms = 24 * 60 * 60 * 1000;
  const remainingMs = hours24Ms - timeDiffMs;

  if (remainingMs <= 0) return '';

  const hours = Math.floor(remainingMs / (60 * 60 * 1000));
  const minutes = Math.floor((remainingMs % (60 * 60 * 1000)) / (60 * 1000));

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
};
