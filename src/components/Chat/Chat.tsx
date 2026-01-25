import React, { useState } from 'react';
import { ChatList } from './ChatList';
import { ChatWindow } from './ChatWindow';
import { NewChatModal } from './NewChatModal';
import { useAuth } from '../../contexts/AuthContext';
import { useChatTranslation } from '../../contexts/ChatTranslationContext';
import { ChatWithUser, User } from '../../types';
import { MessageCircle } from 'lucide-react';

export const Chat: React.FC = () => {
  const { currentUser } = useAuth();
  const { getSettings, setSettings } = useChatTranslation();
  const [selectedChat, setSelectedChat] = useState<ChatWithUser | null>(null);
  const [showNewChatModal, setShowNewChatModal] = useState(false);

  const handleSelectChat = (chat: ChatWithUser) => {
    setSelectedChat(chat);
    const stored = chat.translationSettings[currentUser!.uid];
    if (stored) {
      setSettings(chat.id, {
        enabled: stored.enabled,
        targetLanguage: stored.targetLanguage,
      });
    }
  };

  const handleNewChat = () => {
    setShowNewChatModal(true);
  };

  const handleChatCreated = (chatId: string, otherUser: User) => {
    const newChat: ChatWithUser = {
      id: chatId,
      participants: [currentUser!.uid, otherUser.uid],
      lastMessage: '',
      lastMessageTime: new Date(),
      translationSettings: {
        [currentUser!.uid]: {
          enabled: false,
          targetLanguage: 'en',
        },
        [otherUser.uid]: {
          enabled: false,
          targetLanguage: 'en',
        },
      },
      otherUser,
    };
    setSelectedChat(newChat);
    setSettings(chatId, { enabled: false, targetLanguage: 'en' });
    setShowNewChatModal(false);
  };

  const handleBack = () => {
    setSelectedChat(null);
  };

  const getChatSettings = () => {
    if (!selectedChat || !currentUser) {
      return { enabled: false, targetLanguage: 'en' };
    }
    return getSettings(selectedChat.id);
  };

  const settings = getChatSettings();

  return (
    <div className="h-screen flex">
      <div className={`w-full md:w-96 ${selectedChat ? 'hidden md:block' : 'block'}`}>
        <ChatList
          onSelectChat={handleSelectChat}
          selectedChatId={selectedChat?.id || null}
          onNewChat={handleNewChat}
        />
      </div>

      <div className={`flex-1 ${selectedChat ? 'block' : 'hidden md:block'}`}>
        {selectedChat ? (
          <ChatWindow
            chatId={selectedChat.id}
            otherUser={selectedChat.otherUser}
            onBack={handleBack}
            translationEnabled={settings.enabled}
            targetLanguage={settings.targetLanguage}
          />
        ) : (
          <div className="h-full flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 text-gray-400 dark:text-gray-500">
            <MessageCircle size={80} className="mb-4" />
            <h2 className="text-2xl font-semibold mb-2">Welcome to ChatApp</h2>
            <p className="text-center px-4">
              Select a chat from the list or start a new conversation
            </p>
          </div>
        )}
      </div>

      {showNewChatModal && (
        <NewChatModal
          onClose={() => setShowNewChatModal(false)}
          onChatCreated={handleChatCreated}
        />
      )}
    </div>
  );
};
