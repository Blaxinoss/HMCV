// src/components/Settings.tsx

import { t } from 'i18next';
import React, { FormEvent, useEffect, useState } from 'react';
import { FaKey, FaPlusCircle, FaTrash, FaUserEdit } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import { deleteUser, fetchUsers, updateUser } from '../slices/userSlice';
import { AppDispatch, RootState } from '../store';
import { User } from '../types';

const Settings: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { users, loading } = useSelector((state: RootState) => state.user);

  const [newPassword, setNewPassword] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  const handlePasswordChange = async (userId: string) => {
    if (newPassword.trim() === '') {
      alert('Please enter a new password');
      return;
    }
    dispatch(updateUser({ userId, password: newPassword }));
    setNewPassword('');
    setEditingUserId(null);
  };

  const handleDeleteUser = async (userId: string) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      dispatch(deleteUser(userId));
    }
  };

  return (
    <div className="p-8 bg-gray-900 h-full text-white">
      <h1 className="text-white text-3xl mb-6">{t('settings.header')}</h1>

      {/* Accounts Section */}
      <section>
        <h3 className="my-5 text-2xl font-semibold">{t('settings.accounts')}</h3>

        <div className="grid gap-6 mb-8">
          {users.map((user: User) => (
            <div
              key={user.id}
              className="bg-gray-800 p-6 rounded-lg border border-gray-700 hover:border-blue-500 transition"
            >
              <div className="flex justify-between items-start">
                <div className="flex-grow">
                  <h4 className="text-xl font-semibold text-blue-400 mb-2">
                    {user.username}
                  </h4>
                  <p className="text-gray-400 text-sm">
                    Created: {new Date(user.createdAt).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex gap-2">
                  {editingUserId === user.id ? (
                    <div className="flex gap-2 ml-4">
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="New password"
                        className="px-3 py-2 bg-gray-700 rounded text-white"
                        disabled={loading}
                      />
                      <button
                        onClick={() => handlePasswordChange(user.id)}
                        disabled={loading}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded disabled:opacity-50"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => {
                          setEditingUserId(null);
                          setNewPassword('');
                        }}
                        disabled={loading}
                        className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <>
                      <button
                        onClick={() => setEditingUserId(user.id)}
                        disabled={loading}
                        className="p-2 bg-blue-600 hover:bg-blue-700 rounded transition disabled:opacity-50"
                        title="Edit Password"
                      >
                        <FaUserEdit />
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        disabled={loading}
                        className="p-2 bg-red-600 hover:bg-red-700 rounded transition disabled:opacity-50"
                        title="Delete User"
                      >
                        <FaTrash />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Add New Account Section */}
      <section className="mt-10 border-t border-gray-700 pt-10">
        <h3 className="my-5 text-2xl font-semibold flex items-center gap-2">
          <FaPlusCircle /> {t('settings.add_account')}
        </h3>

        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="text"
              placeholder={t('settings.username_label') || 'Username'}
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              className="px-4 py-2 bg-gray-700 rounded text-white placeholder-gray-400"
              disabled={loading}
            />
            <input
              type="password"
              placeholder={t('settings.password_label') || 'Password'}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="px-4 py-2 bg-gray-700 rounded text-white placeholder-gray-400"
              disabled={loading}
            />
            <button
              onClick={async () => {
                if (newUsername.trim() && newPassword.trim()) {
                  // This would be handled by a separate registerUser action if exposed in settings
                  setNewUsername('');
                  setNewPassword('');
                }
              }}
              disabled={loading}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded text-white font-semibold disabled:opacity-50"
            >
              {loading ? 'Adding...' : 'Add Account'}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Settings;
