import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { ChatTranslationProvider } from './contexts/ChatTranslationContext';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <ChatTranslationProvider>
          <App />
        </ChatTranslationProvider>
      </AuthProvider>
    </ThemeProvider>
  </StrictMode>
);
