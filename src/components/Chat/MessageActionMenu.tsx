import React from 'react';
import { Message } from '../../types';
import { Copy, Share2, MessageCircle, Trash2, Clock } from 'lucide-react';
import { canDeleteForEveryone, getTimeUntilExpiry } from '../../services/deletionService';

interface MessageActionMenuProps {
  message: Message;
  position: { x: number; y: number };
  isSender: boolean;
  onCopy: () => void;
  onShare: () => void;
  onReply: () => void;
  onDeleteLocal: () => void;
  onDeleteForEveryone: () => void;
  onViewInfo: () => void;
  onClose: () => void;
}

export const MessageActionMenu: React.FC<MessageActionMenuProps> = ({
  message,
  position,
  isSender,
  onCopy,
  onShare,
  onReply,
  onDeleteLocal,
  onDeleteForEveryone,
  onViewInfo,
  onClose,
}) => {
  const canDeleteEverywhere = canDeleteForEveryone(message.timestamp);
  const timeRemaining = canDeleteEverywhere ? getTimeUntilExpiry(message.timestamp) : '';

  const hasText = !!message.originalText;

  return (
    <>
      <div
        className="fixed inset-0 z-40"
        onClick={onClose}
      />

      <div
        className="fixed bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50 min-w-[200px]"
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
        }}
      >
        <button
          onClick={() => {
            onViewInfo();
            onClose();
          }}
          className="w-full text-left px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-3 border-b border-gray-200 dark:border-gray-700"
        >
          <Clock size={16} />
          View info
        </button>

        {hasText && (
          <button
            onClick={() => {
              onReply();
              onClose();
            }}
            className="w-full text-left px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-3 border-b border-gray-200 dark:border-gray-700"
          >
            <MessageCircle size={16} />
            Reply
          </button>
        )}

        {hasText && (
          <button
            onClick={() => {
              onCopy();
              onClose();
            }}
            className="w-full text-left px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-3 border-b border-gray-200 dark:border-gray-700"
          >
            <Copy size={16} />
            Copy
          </button>
        )}

        <button
          onClick={() => {
            onShare();
            onClose();
          }}
          className="w-full text-left px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-3 border-b border-gray-200 dark:border-gray-700"
        >
          <Share2 size={16} />
          Share
        </button>

        <button
          onClick={() => {
            onDeleteLocal();
            onClose();
          }}
          className="w-full text-left px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-3 border-b border-gray-200 dark:border-gray-700"
        >
          <Trash2 size={16} />
          Delete locally
        </button>

        {isSender && (
          <button
            onClick={() => {
              onDeleteForEveryone();
              onClose();
            }}
            disabled={!canDeleteEverywhere}
            className={`w-full text-left px-4 py-3 text-sm flex items-center gap-3 ${
              canDeleteEverywhere
                ? 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                : 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
            }`}
          >
            <Trash2 size={16} />
            <span>
              Delete for everyone
              {canDeleteEverywhere && timeRemaining && (
                <span className="text-xs ml-1 opacity-70">({timeRemaining})</span>
              )}
            </span>
          </button>
        )}
      </div>
    </>
  );
};
