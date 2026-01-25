import React, { useState } from 'react';
import { X } from 'lucide-react';
import { SUPPORTED_LANGUAGES } from '../../services/translationService';

interface TranslationSettingsProps {
  currentLanguage: string;
  onSave: (enabled: boolean, language: string) => void;
  onClose: () => void;
}

export const TranslationSettings: React.FC<TranslationSettingsProps> = ({
  currentLanguage,
  onSave,
  onClose,
}) => {
  const [selectedLanguage, setSelectedLanguage] = useState(currentLanguage);

  const handleSave = () => {
    onSave(true, selectedLanguage);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Translation Settings
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-4">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Select your preferred language for translating messages in this chat:
          </p>

          <div className="max-h-64 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg">
            {[...SUPPORTED_LANGUAGES].sort((a, b) => a.name.localeCompare(b.name)).map((lang) => (
              <button
                key={lang.code}
                onClick={() => setSelectedLanguage(lang.code)}
                className={`w-full text-left px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                  selectedLanguage === lang.code
                    ? 'bg-teal-50 dark:bg-teal-900 border-l-4 border-teal-500'
                    : ''
                }`}
              >
                <span className="text-gray-900 dark:text-white">{lang.name}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-end space-x-3 p-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors"
          >
            Enable Translation
          </button>
        </div>
      </div>
    </div>
  );
};
