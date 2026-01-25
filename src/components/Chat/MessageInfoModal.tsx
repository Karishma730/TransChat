import React from 'react';
import { Message, User } from '../../types';
import { X, Clock, User as UserIcon } from 'lucide-react';

interface MessageInfoModalProps {
  message: Message;
  sender: User | null;
  onClose: () => void;
}

export const MessageInfoModal: React.FC<MessageInfoModalProps> = ({
  message,
  sender,
  onClose,
}) => {
  const formatDateTime = (date: Date) => {
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const getMessageType = () => {
    if (message.mediaType === 'image') return 'Photo';
    if (message.mediaType === 'video') return 'Video';
    if (message.mediaType === 'file') return `File (${message.fileName})`;
    return 'Text';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
            Message Info
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <X size={24} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center gap-2">
              <UserIcon size={16} />
              From
            </label>
            <p className="text-gray-900 dark:text-white mt-1">
              {sender?.displayName || 'Unknown'}
            </p>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center gap-2">
              <Clock size={16} />
              Sent
            </label>
            <p className="text-gray-900 dark:text-white mt-1">
              {formatDateTime(message.timestamp)}
            </p>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Type
            </label>
            <p className="text-gray-900 dark:text-white mt-1">
              {getMessageType()}
            </p>
          </div>

          {message.fileSize && (
            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Size
              </label>
              <p className="text-gray-900 dark:text-white mt-1">
                {(message.fileSize / (1024 * 1024)).toFixed(2)} MB
              </p>
            </div>
          )}

          {message.originalText && (
            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Content
              </label>
              <p className="text-gray-900 dark:text-white mt-1 p-3 bg-gray-100 dark:bg-gray-700 rounded break-words">
                {message.originalText}
              </p>
            </div>
          )}

          {message.replyTo && (
            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Replying to
              </label>
              <p className="text-gray-900 dark:text-white mt-1 p-3 bg-gray-100 dark:bg-gray-700 rounded italic border-l-4 border-teal-500">
                {message.replyTo.senderName}: {message.replyTo.text}
              </p>
            </div>
          )}
        </div>

        <button
          onClick={onClose}
          className="w-full mt-6 bg-teal-600 hover:bg-teal-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
        >
          Close
        </button>
      </div>
    </div>
  );
};
