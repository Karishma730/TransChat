import React, { useEffect, useState } from 'react';
import { Moon, Sun, Plus } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { getUserChats, getUser, getAllUsers, createOrGetChat, getUnreadCount } from '../../services/chatService';
import { Chat, ChatWithUser, User } from '../../types';
import { SettingsMenu } from './SettingsMenu';
import { ProfileModal } from './ProfileModal';

interface ChatListProps {
  onSelectChat: (chat: ChatWithUser) => void;
  selectedChatId: string | null;
  onNewChat: () => void;
}

export const ChatList: React.FC<ChatListProps> = ({
  onSelectChat,
  selectedChatId,
  onNewChat,
}) => {
  const { currentUser } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [chats, setChats] = useState<ChatWithUser[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [creatingChat, setCreatingChat] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);

  useEffect(() => {
    if (!currentUser) return;

    const fetchUsers = async () => {
      try {
        const allUsers = await getAllUsers();
        const filteredUsers = allUsers.filter((user) => user.uid !== currentUser.uid);
        setUsers(filteredUsers);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    fetchUsers();
    setLoading(false);

    const unsubscribe = getUserChats(currentUser.uid, (fetchedChats: Chat[]) => {
      Promise.all(
        fetchedChats.map(async (chat) => {
          const otherUserId = chat.participants.find((id) => id !== currentUser.uid);
          if (!otherUserId) return null;

          const otherUser = await getUser(otherUserId);
          if (!otherUser) return null;

          const unreadCount = await getUnreadCount(chat.id, currentUser.uid);

          return {
            ...chat,
            otherUser,
            unreadCount,
          } as ChatWithUser;
        })
      ).then((chatsWithUsers) => {
        setChats(chatsWithUsers.filter((chat): chat is ChatWithUser => chat !== null));
      });
    });

    return () => unsubscribe();
  }, [currentUser]);


  const handleStartChat = async (user: User) => {
    if (!currentUser || creatingChat) return;

    setCreatingChat(true);
    try {
      const chatId = await createOrGetChat(currentUser.uid, user.uid);
      const chatWithUser: ChatWithUser = {
        id: chatId,
        participants: [currentUser.uid, user.uid],
        lastMessage: '',
        lastMessageTime: new Date(),
        translationSettings: {},
        otherUser: user,
      };
      onSelectChat(chatWithUser);
    } catch (error) {
      console.error('Error creating chat:', error);
    } finally {
      setCreatingChat(false);
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      });
    } else if (days === 1) {
      return 'Yesterday';
    } else if (days < 7) {
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
    }
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
      <div className="bg-gray-100 dark:bg-gray-900 px-4 py-3 flex items-center justify-between border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Chats</h2>
        <div className="flex items-center space-x-2">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300"
            title="Toggle theme"
          >
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <button
            onClick={onNewChat}
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300"
            title="New chat"
          >
            <Plus size={20} />
          </button>
          <SettingsMenu onProfileClick={() => setShowProfileModal(true)} isDark={isDark} />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <p className="text-gray-500 dark:text-gray-400">Loading chats...</p>
          </div>
        ) : chats.length === 0 ? (
          <div className="p-4">
            <div className="mb-4">
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">No chats yet. Start a conversation with someone:</p>
            </div>
            {users.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 dark:text-gray-400">No other users found. Create more accounts to start chatting!</p>
              </div>
            ) : (
              <div className="space-y-2">
                {users.map((user) => (
                  <button
                    key={user.uid}
                    onClick={() => handleStartChat(user)}
                    disabled={creatingChat}
                    className="w-full flex items-center p-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50"
                  >
                    <div className="w-12 h-12 rounded-full bg-teal-500 flex items-center justify-center text-white font-semibold flex-shrink-0">
                      {user.displayName.charAt(0).toUpperCase()}
                    </div>
                    <div className="ml-3 flex-1 text-left overflow-hidden">
                      <h4 className="font-semibold text-gray-900 dark:text-white">
                        {user.displayName}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                        {user.email}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          chats.map((chat) => (
            <button
              key={chat.id}
              onClick={() => onSelectChat(chat)}
              className={`w-full px-4 py-3 flex items-center hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                selectedChatId === chat.id
                  ? 'bg-gray-100 dark:bg-gray-700'
                  : ''
              }`}
            >
              <div className="w-12 h-12 rounded-full bg-teal-500 flex items-center justify-center text-white font-semibold flex-shrink-0">
                {chat.otherUser.displayName.charAt(0).toUpperCase()}
              </div>
              <div className="ml-3 flex-1 text-left overflow-hidden">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                    {chat.otherUser.displayName}
                  </h3>
                  <div className="flex items-center gap-2 ml-2 flex-shrink-0">
                    {chat.unreadCount && chat.unreadCount > 0 && (
                      <span className="inline-flex items-center justify-center w-6 h-6 text-xs font-bold text-white bg-teal-500 rounded-full">
                        {chat.unreadCount > 99 ? '99+' : chat.unreadCount}
                      </span>
                    )}
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {formatTime(chat.lastMessageTime)}
                    </span>
                  </div>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                  {chat.lastMessage || 'No messages yet'}
                </p>
              </div>
            </button>
          ))
        )}
      </div>

      <ProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        isDark={isDark}
      />
    </div>
  );
};
