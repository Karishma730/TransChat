import React, { useState } from 'react';
import { X, Trash2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { updateDisplayName, deleteAccount } from '../../services/authService';
import { isValidDisplayName, getDisplayNameError } from '../../utils/validationUtils';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDark: boolean;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose, isDark }) => {
  const { currentUser } = useAuth();
  const [displayName, setDisplayName] = useState(currentUser?.displayName || '');
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSaveName = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidDisplayName(displayName)) {
      setError(getDisplayNameError());
      return;
    }

    setSaving(true);
    setError('');
    setSuccess('');

    try {
      await updateDisplayName(displayName.trim());
      setSuccess('Display name updated successfully');
      setTimeout(onClose, 1500);
    } catch (err) {
      setError('Failed to update display name');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    setError('');

    try {
      await deleteAccount();
    } catch (err) {
      setError('Failed to delete account');
      console.error(err);
      setDeleting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div
        className={`w-full max-w-md rounded-lg shadow-xl ${
          isDark ? 'bg-gray-800' : 'bg-white'
        }`}
      >
        <div
          className={`flex items-center justify-between p-4 border-b ${
            isDark ? 'border-gray-700' : 'border-gray-200'
          }`}
        >
          <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Manage Profile
          </h2>
          <button
            onClick={onClose}
            className={`p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
              isDark ? 'text-gray-400' : 'text-gray-600'
            }`}
          >
            <X size={20} />
          </button>
        </div>

        <div className={`p-6 space-y-6`}>
          {error && (
            <div className="p-3 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded">
              {error}
            </div>
          )}
          {success && (
            <div className="p-3 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded">
              {success}
            </div>
          )}

          <div>
            <h3 className={`text-sm font-semibold mb-2 ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>
              Email
            </h3>
            <p className={`text-sm px-3 py-2 rounded ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'}`}>
              {currentUser?.email}
            </p>
          </div>

          <form onSubmit={handleSaveName}>
            <div>
              <label className={`block text-sm font-semibold mb-2 ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>
                Display Name
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                disabled={saving}
                className={`w-full px-3 py-2 rounded border ${
                  isDark
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                } disabled:opacity-50`}
              />
            </div>
            <button
              type="submit"
              disabled={saving || displayName === currentUser?.displayName}
              className="mt-4 w-full px-4 py-2 bg-teal-500 hover:bg-teal-600 disabled:opacity-50 text-white rounded font-medium transition-colors"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </form>

          <div className="border-t pt-6" style={{ borderColor: isDark ? '#374151' : '#e5e7eb' }}>
            {!showDeleteConfirm ? (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="w-full px-4 py-2 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 rounded font-medium hover:bg-red-200 dark:hover:bg-red-800 transition-colors flex items-center justify-center gap-2"
              >
                <Trash2 size={16} />
                Delete Account
              </button>
            ) : (
              <div className="space-y-3">
                <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Are you sure? This action cannot be undone.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    disabled={deleting}
                    className={`flex-1 px-4 py-2 rounded font-medium transition-colors disabled:opacity-50 ${
                      isDark
                        ? 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                        : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
                    }`}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteAccount}
                    disabled={deleting}
                    className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded font-medium transition-colors"
                  >
                    {deleting ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
