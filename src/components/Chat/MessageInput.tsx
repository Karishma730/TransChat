import React, { useState, useRef } from 'react';
import { Send, Image, FileText, Smile } from 'lucide-react';

interface MessageInputProps {
  onSendMessage: (text: string) => void;
  onSendMedia: (file: File) => void;
  disabled?: boolean;
}

const EMOJI_PICKER = ['😀', '😂', '😍', '🤔', '😱', '👍', '❤️', '🔥', '👏', '🎉', '🎊', '✨', '😎', '🤩', '😊', '😢', '😡', '🤣', '😘', '💯'];

export const MessageInput: React.FC<MessageInputProps> = ({
  onSendMessage,
  onSendMedia,
  disabled,
}) => {
  const [message, setMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const mediaInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSendMessage(message);
      setMessage('');
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onSendMedia(file);
      if (e.target === mediaInputRef.current) {
        mediaInputRef.current.value = '';
      } else if (e.target === fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleEmojiSelect = (emoji: string) => {
    setMessage(message + emoji);
    inputRef.current?.focus();
  };

  return (
    <div className="bg-gray-100 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
      {showEmojiPicker && (
        <div className="bg-white dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600 p-3 flex flex-wrap gap-2">
          {EMOJI_PICKER.map((emoji, index) => (
            <button
              key={index}
              type="button"
              onClick={() => handleEmojiSelect(emoji)}
              className="text-2xl hover:bg-gray-100 dark:hover:bg-gray-600 p-1 rounded transition-colors"
              title={`Add ${emoji}`}
            >
              {emoji}
            </button>
          ))}
        </div>
      )}
      <form onSubmit={handleSubmit} className="p-4">
        <div className="flex items-center space-x-2">
          <input
            type="file"
            ref={mediaInputRef}
            onChange={handleFileSelect}
            accept="image/*,video/*"
            className="hidden"
          />

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            accept=".pdf,.doc,.docx,.ppt,.pptx,.zip,.rar,.7z,.txt,.xls,.xlsx"
            className="hidden"
          />

          <button
            type="button"
            onClick={() => mediaInputRef.current?.click()}
            disabled={disabled}
            className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors disabled:opacity-50"
            title="Attach media"
          >
            <Image size={20} />
          </button>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled}
            className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors disabled:opacity-50"
            title="Attach file"
          >
            <FileText size={20} />
          </button>

          <button
            type="button"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            disabled={disabled}
            className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors disabled:opacity-50"
            title="Add emoji"
          >
            <Smile size={20} />
          </button>

          <input
            ref={inputRef}
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message..."
            disabled={disabled}
            className="flex-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-900 dark:text-white disabled:opacity-50"
          />

          <button
            type="submit"
            disabled={!message.trim() || disabled}
            className="p-2 bg-teal-500 text-white rounded-full hover:bg-teal-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send size={20} />
          </button>
        </div>
      </form>
    </div>
  );
};
