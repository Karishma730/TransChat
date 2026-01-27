import React, { useEffect, useState, useRef } from 'react';
import { ChatHeader } from './ChatHeader';
import { MessageBubble } from './MessageBubble';
import { MessageInput } from './MessageInput';
import { TranslationSettings } from './TranslationSettings';
import { ContactProfileModal } from './ContactProfileModal';
import { DateSeparator } from './DateSeparator';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useChatTranslation } from '../../contexts/ChatTranslationContext';
import { User, Message } from '../../types';
import {
  getChatMessages,
  sendMessage,
  updateTranslationSettings,
  deleteMessageForEveryone,
  markMessagesAsRead,
  canSendMessage,
  getUnreadMessages,
} from '../../services/chatService';
import { translateText } from '../../services/translationService';
import { uploadMedia, validateMediaFile, getMediaType } from '../../services/storageService';
import {
  addLocalDeletedMessage,
  isMessageLocallyDeleted,
  getDeletedMessagesForChat,
} from '../../services/deletionService';

interface ChatWindowProps {
  chatId: string;
  otherUser: User;
  onBack: () => void;
  translationEnabled: boolean;
  targetLanguage: string;
  blockedUsers?: Set<string>;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
  chatId,
  otherUser,
  onBack,
  translationEnabled: initialTranslationEnabled,
  targetLanguage: initialTargetLanguage,
  blockedUsers = new Set(),
}) => {
  const { currentUser } = useAuth();
  const { isDark } = useTheme();
  const { getSettings, setSettings } = useChatTranslation();
  const [messages, setMessages] = useState<Message[]>([]);
  const [translationEnabled, setTranslationEnabled] = useState(initialTranslationEnabled);
  const [targetLanguage, setTargetLanguage] = useState(initialTargetLanguage);
  const [showSettings, setShowSettings] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [showContactProfile, setShowContactProfile] = useState(false);
  const [unreadMessageIds, setUnreadMessageIds] = useState<Set<string>>(new Set());
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const hasMarkedAsReadRef = useRef(false);

  useEffect(() => {
    const settings = getSettings(chatId);
    setTranslationEnabled(settings.enabled);
    setTargetLanguage(settings.targetLanguage);
  }, [chatId, getSettings]);

  useEffect(() => {
    hasMarkedAsReadRef.current = false;
  }, [chatId]);

  useEffect(() => {
    if (!chatId || !currentUser) return;

    if (!hasMarkedAsReadRef.current) {
      getUnreadMessages(chatId, currentUser.uid).then((unreadMsgs) => {
        setUnreadMessageIds(new Set(unreadMsgs.map((msg) => msg.id)));
      });
      hasMarkedAsReadRef.current = true;
    }

    const unsubscribe = getChatMessages(chatId, async (fetchedMessages) => {
      const deletedLocally = getDeletedMessagesForChat(chatId);
      const filteredMessages = fetchedMessages.filter(
        (msg) => !deletedLocally.has(msg.id) && !blockedUsers.has(msg.senderId)
      );

      let processedMessages = filteredMessages;

      if (translationEnabled && currentUser) {
        const translatedMessages = await Promise.all(
          filteredMessages.map(async (msg) => {
            if (msg.senderId !== currentUser.uid && msg.originalText) {
              const translated = await translateText(msg.originalText, targetLanguage);
              return { ...msg, translatedText: translated };
            }
            return msg;
          })
        );
        processedMessages = translatedMessages;
      }

      setMessages(processedMessages);
    });

    return () => unsubscribe();
  }, [chatId, translationEnabled, targetLanguage, currentUser, blockedUsers]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (chatId && currentUser) {
      markMessagesAsRead(chatId, currentUser.uid).then(() => {
        setUnreadMessageIds(new Set());
      });
    }
  }, [chatId, currentUser]);

  const handleSendMessage = async (text: string) => {
    if (!currentUser || !text.trim()) return;

    const validation = await canSendMessage(currentUser.uid, otherUser.uid);
    if (!validation.allowed) {
      alert(validation.reason || 'Cannot send message');
      return;
    }

    await sendMessage(
      chatId,
      currentUser.uid,
      otherUser.uid,
      text,
      undefined,
      undefined,
      undefined,
      undefined,
      replyingTo?.id,
      replyingTo?.senderId === currentUser.uid ? 'You' : otherUser.displayName,
      replyingTo?.originalText
    );

    setReplyingTo(null);
  };

  const handleSendMedia = async (file: File) => {
    if (!currentUser) return;

    const validation = validateMediaFile(file);
    if (!validation.valid) {
      alert(validation.error);
      return;
    }

    const messageValidation = await canSendMessage(currentUser.uid, otherUser.uid);
    if (!messageValidation.allowed) {
      alert(messageValidation.reason || 'Cannot send message');
      return;
    }

    setUploading(true);
    try {
      const mediaUrl = await uploadMedia(file, currentUser.uid, chatId);
      const mediaType = getMediaType(file);
      await sendMessage(
        chatId,
        currentUser.uid,
        otherUser.uid,
        undefined,
        mediaUrl,
        mediaType,
        file.name,
        file.size,
        replyingTo?.id,
        replyingTo?.senderId === currentUser.uid ? 'You' : otherUser.displayName,
        replyingTo?.originalText
      );
      setReplyingTo(null);
    } catch (error) {
      console.error('Media upload error:', error);
      alert('Failed to upload media');
    } finally {
      setUploading(false);
    }
  };

  const handleToggleTranslation = () => {
    if (!translationEnabled) {
      setShowSettings(true);
    } else {
      setTranslationEnabled(false);
      if (currentUser) {
        updateTranslationSettings(chatId, currentUser.uid, false, targetLanguage);
      }
    }
  };

  const handleSaveTranslationSettings = async (enabled: boolean, language: string) => {
    if (!currentUser) return;

    setTranslationEnabled(enabled);
    setTargetLanguage(language);
    setSettings(chatId, { enabled, targetLanguage: language });
    await updateTranslationSettings(chatId, currentUser.uid, enabled, language);
    setShowSettings(false);
  };

  const handleLanguageChange = async (language: string) => {
    if (!currentUser) return;

    setTargetLanguage(language);
    setSettings(chatId, { enabled: translationEnabled, targetLanguage: language });
    await updateTranslationSettings(chatId, currentUser.uid, translationEnabled, language);
  };

  const handleDeleteLocalMessage = (messageId: string) => {
    addLocalDeletedMessage(chatId, messageId);
    setMessages(messages.filter((msg) => msg.id !== messageId));
  };

  const handleDeleteMessageForEveryone = async (messageId: string) => {
    try {
      await deleteMessageForEveryone(messageId);
      setMessages(messages.filter((msg) => msg.id !== messageId));
    } catch (error) {
      console.error('Failed to delete message:', error);
      alert('Failed to delete message');
    }
  };

  const handleReplyToMessage = (messageId: string) => {
    const message = messages.find((msg) => msg.id === messageId);
    if (message) {
      setReplyingTo(message);
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const isSameDay = (date1: Date, date2: Date) => {
    return date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate();
  };

  const getMessagesWithDateSeparators = () => {
    const messagesWithSeparators: Array<{ type: 'message' | 'date' | 'unread'; data: Message | Date | null }> = [];
    let unreadSeparatorAdded = false;

    messages.forEach((message, index) => {
      if (index === 0) {
        messagesWithSeparators.push({ type: 'date', data: message.timestamp });
      } else {
        const previousMessage = messages[index - 1];
        if (!isSameDay(previousMessage.timestamp, message.timestamp)) {
          messagesWithSeparators.push({ type: 'date', data: message.timestamp });
        }
      }

      if (unreadMessageIds.has(message.id) && !unreadSeparatorAdded) {
        messagesWithSeparators.push({ type: 'unread', data: null });
        unreadSeparatorAdded = true;
      }

      messagesWithSeparators.push({ type: 'message', data: message });
    });

    return messagesWithSeparators;
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900">
      <ChatHeader
        user={otherUser}
        onBack={onBack}
        onToggleTranslation={handleToggleTranslation}
        translationEnabled={translationEnabled}
        targetLanguage={targetLanguage}
        onLanguageChange={handleLanguageChange}
        onContactClick={() => setShowContactProfile(true)}
      />

      <div className="flex-1 overflow-y-auto py-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          <>
            {getMessagesWithDateSeparators().map((item, index) => {
              if (item.type === 'date') {
                return <DateSeparator key={`date-${index}`} date={item.data as Date} />;
              } else if (item.type === 'unread') {
                return (
                  <div key={`unread-${index}`} className="flex items-center gap-3 px-4 py-3 my-2">
                    <div className="flex-1 border-t-2 border-dotted border-gray-300 dark:border-gray-600"></div>
                    <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase whitespace-nowrap">
                      Unread Messages
                    </span>
                    <div className="flex-1 border-t-2 border-dotted border-gray-300 dark:border-gray-600"></div>
                  </div>
                );
              } else {
                const message = item.data as Message;
                return (
                  <MessageBubble
                    key={message.id}
                    message={message}
                    sender={message.senderId === currentUser?.uid ? currentUser : otherUser}
                    onDeleteLocal={handleDeleteLocalMessage}
                    onDeleteForEveryone={handleDeleteMessageForEveryone}
                    onReply={handleReplyToMessage}
                  />
                );
              }
            })}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {replyingTo && (
        <div className="bg-teal-50 dark:bg-teal-900/30 border-l-4 border-teal-500 p-3 mx-4 rounded flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-teal-700 dark:text-teal-300">
              Replying to {replyingTo.senderId === currentUser?.uid ? 'yourself' : otherUser.displayName}
            </p>
            <p className="text-sm text-teal-600 dark:text-teal-400 truncate">
              {replyingTo.originalText || `[${replyingTo.mediaType || 'attachment'}]`}
            </p>
          </div>
          <button
            onClick={() => setReplyingTo(null)}
            className="ml-2 text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300"
          >
            ✕
          </button>
        </div>
      )}

      <MessageInput
        onSendMessage={handleSendMessage}
        onSendMedia={handleSendMedia}
        disabled={uploading}
      />

      {showSettings && (
        <TranslationSettings
          currentLanguage={targetLanguage}
          onSave={handleSaveTranslationSettings}
          onClose={() => setShowSettings(false)}
        />
      )}

      <ContactProfileModal
        isOpen={showContactProfile}
        onClose={() => setShowContactProfile(false)}
        contact={otherUser}
        chatId={chatId}
        isDark={isDark}
      />
    </div>
  );
};
