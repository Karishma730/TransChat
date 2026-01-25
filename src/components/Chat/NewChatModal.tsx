import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { getAllUsers, createOrGetChat } from '../../services/chatService';
import { User } from '../../types';

interface NewChatModalProps {
  onClose: () => void;
  onChatCreated: (chatId: string, otherUser: User) => void;
}

export const NewChatModal: React.FC<NewChatModalProps> = ({
  onClose,
  onChatCreated,
}) => {
  const { currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const allUsers = await getAllUsers();
        const filteredUsers = allUsers.filter(
          (user) => user.uid !== currentUser?.uid
        );
        const sortedUsers = filteredUsers.sort((a, b) =>
          a.displayName.localeCompare(b.displayName)
        );
        setUsers(sortedUsers);
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [currentUser]);

  const handleSelectUser = async (otherUser: User) => {
    if (!currentUser || creating) return;

    setCreating(true);
    try {
      const chatId = await createOrGetChat(currentUser.uid, otherUser.uid);
      onChatCreated(chatId, otherUser);
    } catch (error) {
      console.error('Error creating chat:', error);
      alert('Failed to create chat');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            New Chat
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-4">
          {loading ? (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400">Loading users...</p>
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400">
                No other users found. Create more accounts to start chatting!
              </p>
            </div>
          ) : (
            <div className="max-h-96 overflow-y-auto">
              {users.map((user) => (
                <button
                  key={user.uid}
                  onClick={() => handleSelectUser(user)}
                  disabled={creating}
                  className="w-full flex items-center p-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50"
                >
                  <div className="w-12 h-12 rounded-full bg-teal-500 flex items-center justify-center text-white font-semibold">
                    {user.displayName.charAt(0).toUpperCase()}
                  </div>
                  <div className="ml-3 text-left">
                    <h4 className="font-semibold text-gray-900 dark:text-white">
                      {user.displayName}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {user.email}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
