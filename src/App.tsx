import { useState } from 'react';
import { useAuth } from './contexts/AuthContext';
import { Login } from './components/Auth/Login';
import { Register } from './components/Auth/Register';
import { Chat } from './components/Chat/Chat';

function App() {
  const { currentUser, loading } = useAuth();
  const [showLogin, setShowLogin] = useState(true);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-solid border-teal-600 border-t-transparent"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return showLogin ? (
      <Login onToggleMode={() => setShowLogin(false)} />
    ) : (
      <Register onToggleMode={() => setShowLogin(true)} />
    );
  }

  return <Chat />;
}

export default App;
