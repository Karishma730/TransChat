import React, { useState } from 'react';
import { Message, User } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { FileMessage } from './FileMessage';
import { MediaModal } from './MediaModal';
import { MoreVertical, Trash2 } from 'lucide-react';
import { canDeleteForEveryone, getTimeUntilExpiry } from '../../services/deletionService';
import { MessageActionMenu } from './MessageActionMenu';
import { MessageInfoModal } from './MessageInfoModal';

interface MessageBubbleProps {
  message: Message;
  sender?: User | null;
  onDeleteLocal?: (messageId: string) => void;
  onDeleteForEveryone?: (messageId: string) => void;
  onReply?: (messageId: string) => void;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  sender,
  onDeleteLocal,
  onDeleteForEveryone,
  onReply,
}) => {
  const { currentUser } = useAuth();
  const isSent = message.senderId === currentUser?.uid;
  const [showMenu, setShowMenu] = useState(false);
  const [showActionMenu, setShowActionMenu] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [showMediaModal, setShowMediaModal] = useState(false);
  const [actionMenuPos, setActionMenuPos] = useState({ x: 0, y: 0 });
  const canDeleteEverywhere = canDeleteForEveryone(message.timestamp);
  const timeRemaining = canDeleteEverywhere ? getTimeUntilExpiry(message.timestamp) : '';

  const handleDoubleClick = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setActionMenuPos({
      x: Math.min(rect.right, window.innerWidth - 250),
      y: rect.bottom + 5,
    });
    setShowActionMenu(true);
  };

  const handleCopy = () => {
    if (message.originalText) {
      navigator.clipboard.writeText(message.originalText);
    }
  };

  const handleShare = () => {
    const text = message.originalText || 'Check out this message';
    if (navigator.share) {
      navigator.share({
        text: text,
      });
    } else {
      navigator.clipboard.writeText(text);
      alert('Message copied to clipboard');
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (message.deletedForEveryone) {
    return (
      <div className={`flex ${isSent ? 'justify-end' : 'justify-start'} mb-3 px-4`}>
        <div className="text-xs text-gray-400 dark:text-gray-500 italic">
          This message was deleted
        </div>
      </div>
    );
  }

  return (
    <>
      <div className={`flex ${isSent ? 'justify-end' : 'justify-start'} mb-3 px-4 group`}>
        <div
          onDoubleClick={handleDoubleClick}
          className={`max-w-[70%] rounded-lg px-4 py-2 relative cursor-pointer transition-colors ${
            isSent
              ? 'bg-teal-500 text-white rounded-br-none hover:bg-teal-600'
              : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-bl-none shadow-md hover:bg-gray-50 dark:hover:bg-gray-600'
          }`}
        >
          {message.replyTo && (
            <div className={`mb-2 pb-2 border-b ${
              isSent ? 'border-white/30' : 'border-gray-200 dark:border-gray-600'
            }`}>
              <p className={`text-xs font-semibold ${
                isSent ? 'text-teal-100' : 'text-teal-600 dark:text-teal-400'
              }`}>
                Replying to {message.replyTo.senderName}
              </p>
              <p className={`text-xs italic ${
                isSent ? 'text-teal-100 opacity-80' : 'text-gray-600 dark:text-gray-400'
              }`}>
                {message.replyTo.text}
              </p>
            </div>
          )}

          {message.mediaUrl && (
            <div className="mb-2">
              {message.mediaType === 'image' ? (
                <button
                  onClick={() => setShowMediaModal(true)}
                  className="block rounded-lg overflow-hidden hover:opacity-80 transition-opacity cursor-pointer"
                  title="Click to view full size"
                >
                  <img
                    src={message.mediaUrl}
                    alt="Shared media"
                    className="w-64 h-48 object-cover rounded-lg"
                  />
                </button>
              ) : message.mediaType === 'video' ? (
                <button
                  onClick={() => setShowMediaModal(true)}
                  className="block rounded-lg overflow-hidden hover:opacity-80 transition-opacity cursor-pointer"
                  title="Click to view full size"
                >
                  <video
                    src={message.mediaUrl}
                    className="w-64 h-48 object-cover rounded-lg bg-black"
                  />
                </button>
              ) : (
                <FileMessage
                  fileName={message.fileName || 'Download'}
                  fileSize={message.fileSize}
                  mediaUrl={message.mediaUrl}
                />
              )}
            </div>
          )}

          {message.translatedText ? (
            <div>
              <p className="text-sm mb-1">{message.translatedText}</p>
              <p className="text-xs opacity-70 italic border-t border-white/20 dark:border-gray-600 pt-1 mt-1">
                Original: {message.originalText}
              </p>
            </div>
          ) : (
            message.originalText && <p className="text-sm">{message.originalText}</p>
          )}

          <p
            className={`text-xs mt-1 ${
              isSent ? 'text-teal-100' : 'text-gray-500 dark:text-gray-400'
            }`}
          >
            {formatTime(message.timestamp)}
          </p>

          <button
            onClick={() => setShowMenu(!showMenu)}
            className="absolute -right-8 top-0 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
          >
            <MoreVertical size={16} className="text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        {showMenu && (
          <div className="absolute right-0 mt-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-10">
            <button
              onClick={() => {
                onDeleteLocal?.(message.id);
                setShowMenu(false);
              }}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 border-b border-gray-200 dark:border-gray-700"
            >
              <Trash2 size={16} />
              Delete locally
            </button>
            {isSent && (
              <button
                onClick={() => {
                  onDeleteForEveryone?.(message.id);
                  setShowMenu(false);
                }}
                disabled={!canDeleteEverywhere}
                className={`w-full text-left px-4 py-2 text-sm flex items-center gap-2 ${
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
        )}
      </div>

      {showActionMenu && (
        <MessageActionMenu
          message={message}
          position={actionMenuPos}
          isSender={isSent}
          onCopy={handleCopy}
          onShare={handleShare}
          onReply={() => onReply?.(message.id)}
          onDeleteLocal={() => onDeleteLocal?.(message.id)}
          onDeleteForEveryone={() => onDeleteForEveryone?.(message.id)}
          onViewInfo={() => setShowInfoModal(true)}
          onClose={() => setShowActionMenu(false)}
        />
      )}

      {showInfoModal && (
        <MessageInfoModal
          message={message}
          sender={sender}
          onClose={() => setShowInfoModal(false)}
        />
      )}

      {showMediaModal && message.mediaUrl && (message.mediaType === 'image' || message.mediaType === 'video') && (
        <MediaModal
          mediaUrl={message.mediaUrl}
          mediaType={message.mediaType}
          fileName={message.fileName}
          onClose={() => setShowMediaModal(false)}
        />
      )}
    </>
  );
};
