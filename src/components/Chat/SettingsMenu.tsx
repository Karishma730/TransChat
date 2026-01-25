import React, { useRef, useEffect, useState } from 'react';
import { MoreVertical, User, LogOut } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { signOut } from '../../services/authService';

interface SettingsMenuProps {
  onProfileClick: () => void;
  isDark: boolean;
}

export const SettingsMenu: React.FC<SettingsMenuProps> = ({ onProfileClick, isDark }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { currentUser } = useAuth();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const handleProfileClick = () => {
    setIsOpen(false);
    onProfileClick();
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300"
        title="Settings"
      >
        <MoreVertical size={20} />
      </button>

      {isOpen && (
        <div className={`absolute right-0 mt-2 w-48 rounded-lg shadow-lg z-50 ${
          isDark ? 'bg-gray-700 border border-gray-600' : 'bg-white border border-gray-200'
        }`}>
          <div className="py-1">
            <button
              onClick={handleProfileClick}
              className={`w-full px-4 py-2 text-left flex items-center gap-3 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors ${
                isDark ? 'text-gray-200' : 'text-gray-900'
              }`}
            >
              <User size={16} />
              <span>Manage Profile</span>
            </button>
            <hr className={isDark ? 'border-gray-600' : 'border-gray-200'} />
            <button
              onClick={handleSignOut}
              className={`w-full px-4 py-2 text-left flex items-center gap-3 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors text-red-600 dark:text-red-400`}
            >
              <LogOut size={16} />
              <span>Log Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
