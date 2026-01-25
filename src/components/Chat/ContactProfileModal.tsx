import React, { useEffect, useState } from 'react';
import { X, Ban, Trash2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { blockUser, unblockUser, isUserBlocked, clearChatHistory } from '../../services/chatService';
import { User } from '../../types';

interface ContactProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  contact: User | null;
  chatId: string;
  isDark: boolean;
}

export const ContactProfileModal: React.FC<ContactProfileModalProps> = ({
  isOpen,
  onClose,
  contact,
  chatId,
  isDark,
}) => {
  const { currentUser } = useAuth();
  const [isBlocked, setIsBlocked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [clearing, setClearing] = useState(false);

  useEffect(() => {
    if (isOpen && contact && currentUser) {
      checkBlockStatus();
    }
  }, [isOpen, contact, currentUser]);

  const checkBlockStatus = async () => {
    try {
      const blocked = await isUserBlocked(currentUser?.uid || '', contact?.uid || '');
      setIsBlocked(blocked);
    } catch (err) {
      console.error('Error checking block status:', err);
    }
  };

  const handleBlockToggle = async () => {
    if (!currentUser || !contact) return;

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (isBlocked) {
        await unblockUser(currentUser.uid, contact.uid);
        setSuccess('User unblocked');
      } else {
        await blockUser(currentUser.uid, contact.uid);
        setSuccess('User blocked');
      }
      setIsBlocked(!isBlocked);
      setTimeout(() => setSuccess(''), 2000);
    } catch (err) {
      setError('Failed to update block status');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleClearChat = async () => {
    setClearing(true);
    setError('');

    try {
      await clearChatHistory(chatId, currentUser?.uid || '');
      setSuccess('Chat cleared');
      setTimeout(() => {
        setShowClearConfirm(false);
        onClose();
      }, 1500);
    } catch (err) {
      setError('Failed to clear chat');
      console.error(err);
      setClearing(false);
    }
  };

  if (!isOpen || !contact) return null;

  const isAccountDeleted = contact.status === 'deleted';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div
        className={`w-full max-w-md rounded-lg shadow-xl ${
          isDark ? 'bg-gray-800' : 'bg-white'
        }`}
      >
        <div
          className={`flex items-center justify-between p-4 border-b ${
            isDark ? 'border-gray-700' : 'border-gray-200'
          }`}
        >
          <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Contact Info
          </h2>
          <button
            onClick={onClose}
            className={`p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
              isDark ? 'text-gray-400' : 'text-gray-600'
            }`}
          >
            <X size={20} />
          </button>
        </div>

        <div className={`p-6 space-y-6`}>
          {isAccountDeleted && (
            <div className="p-4 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded border border-red-400 dark:border-red-700">
              <p className="font-semibold">Account Deleted</p>
              <p className="text-sm mt-1">This account no longer exists.</p>
            </div>
          )}
          {error && (
            <div className="p-3 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded">
              {error}
            </div>
          )}
          {success && (
            <div className="p-3 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded">
              {success}
            </div>
          )}

          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-full bg-teal-500 flex items-center justify-center text-white text-2xl font-semibold">
              {contact.displayName.charAt(0).toUpperCase()}
            </div>
          </div>

          <div>
            <h3 className={`text-sm font-semibold mb-2 ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>
              Display Name
            </h3>
            <p className={`text-sm px-3 py-2 rounded ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'}`}>
              {contact.displayName}
            </p>
          </div>

          <div>
            <h3 className={`text-sm font-semibold mb-2 ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>
              Email
            </h3>
            <p className={`text-sm px-3 py-2 rounded ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'}`}>
              {contact.email}
            </p>
          </div>

          <div className="border-t pt-4" style={{ borderColor: isDark ? '#374151' : '#e5e7eb' }}>
            <button
              onClick={handleBlockToggle}
              disabled={loading}
              className={`w-full px-4 py-2 rounded font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50 ${
                isBlocked
                  ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-200 hover:bg-green-200 dark:hover:bg-green-800'
                  : 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 hover:bg-red-200 dark:hover:bg-red-800'
              }`}
            >
              <Ban size={16} />
              {isBlocked ? 'Unblock User' : 'Block User'}
            </button>
          </div>

          <div>
            {!showClearConfirm ? (
              <button
                onClick={() => setShowClearConfirm(true)}
                className="w-full px-4 py-2 bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-200 rounded font-medium hover:bg-orange-200 dark:hover:bg-orange-800 transition-colors flex items-center justify-center gap-2"
              >
                <Trash2 size={16} />
                Clear Chat
              </button>
            ) : (
              <div className="space-y-3">
                <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  This will delete all messages in this conversation locally.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowClearConfirm(false)}
                    disabled={clearing}
                    className={`flex-1 px-4 py-2 rounded font-medium transition-colors disabled:opacity-50 ${
                      isDark
                        ? 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                        : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
                    }`}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleClearChat}
                    disabled={clearing}
                    className="flex-1 px-4 py-2 bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white rounded font-medium transition-colors"
                  >
                    {clearing ? 'Clearing...' : 'Clear'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
