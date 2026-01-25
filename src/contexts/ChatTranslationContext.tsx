import React, { createContext, useContext, useState, useEffect } from 'react';

interface ChatTranslationSettings {
  enabled: boolean;
  targetLanguage: string;
}

interface ChatTranslationContextType {
  getSettings: (chatId: string) => ChatTranslationSettings;
  setSettings: (chatId: string, settings: ChatTranslationSettings) => void;
}

const ChatTranslationContext = createContext<ChatTranslationContextType>({
  getSettings: () => ({ enabled: false, targetLanguage: 'en' }),
  setSettings: () => {},
});

export const useChatTranslation = () => useContext(ChatTranslationContext);

export const ChatTranslationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettingsMap] = useState<Map<string, ChatTranslationSettings>>(new Map());

  const getSettings = (chatId: string): ChatTranslationSettings => {
    return settings.get(chatId) || { enabled: false, targetLanguage: 'en' };
  };

  const setSettings = (chatId: string, newSettings: ChatTranslationSettings) => {
    const newMap = new Map(settings);
    newMap.set(chatId, newSettings);
    setSettingsMap(newMap);
  };

  return (
    <ChatTranslationContext.Provider value={{ getSettings, setSettings }}>
      {children}
    </ChatTranslationContext.Provider>
  );
};
