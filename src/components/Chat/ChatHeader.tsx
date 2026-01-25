import React, { useState } from 'react';
import { ArrowLeft, Languages, ChevronDown } from 'lucide-react';
import { User } from '../../types';
import { SUPPORTED_LANGUAGES } from '../../services/translationService';

interface ChatHeaderProps {
  user: User;
  onBack: () => void;
  onToggleTranslation: () => void;
  translationEnabled: boolean;
  targetLanguage?: string;
  onLanguageChange?: (language: string) => void;
  onContactClick?: () => void;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  user,
  onBack,
  onToggleTranslation,
  translationEnabled,
  targetLanguage = 'en',
  onLanguageChange,
  onContactClick,
}) => {
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const currentLanguage = SUPPORTED_LANGUAGES.find((lang) => lang.code === targetLanguage) || SUPPORTED_LANGUAGES[0];

  return (
    <div className="bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3 flex items-center justify-between">
      <button
        onClick={onContactClick}
        className="flex items-center flex-1 hover:opacity-75 transition-opacity"
      >
        <button
          onClick={(e) => {
            e.stopPropagation();
            onBack();
          }}
          className="mr-3 md:hidden text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white"
        >
          <ArrowLeft size={24} />
        </button>
        <div className="w-10 h-10 rounded-full bg-teal-500 flex items-center justify-center text-white font-semibold">
          {user.displayName.charAt(0).toUpperCase()}
        </div>
        <div className="ml-3">
          <h3 className="font-semibold text-gray-900 dark:text-white">{user.displayName}</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
        </div>
      </button>

      <div className="flex items-center gap-2">
        <button
          onClick={onToggleTranslation}
          className={`p-2 rounded-full transition-colors ${
            translationEnabled
              ? 'bg-teal-500 text-white'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
          }`}
          title="Toggle Translation"
        >
          <Languages size={20} />
        </button>

        {translationEnabled && (
          <div className="relative">
            <button
              onClick={() => setShowLanguageMenu(!showLanguageMenu)}
              className="px-3 py-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors flex items-center gap-1 text-sm font-medium"
              title="Change target language"
            >
              {currentLanguage.name}
              <ChevronDown size={16} />
            </button>

            {showLanguageMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-700 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600 z-20 max-h-64 overflow-y-auto">
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      onLanguageChange?.(lang.code);
                      setShowLanguageMenu(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors ${
                      lang.code === targetLanguage
                        ? 'bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 font-semibold'
                        : 'text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {lang.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
