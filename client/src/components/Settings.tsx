// src/components/Settings.tsx

import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { deleteUser, fetchUsers, updateUser } from '../slices/userSlice';
import { registerUser } from '../slices/authSlice';
import { AppDispatch, RootState } from '../store';
import { User } from '../types';
import {
  Settings as SettingsIcon,
  User as UserIcon,
  Shield,
  Trash2,
  Key,
  Plus,
  Save,
  X,
  CheckCircle,
  Calendar
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useConfirmToast } from './toasters/deleteToaster';
const Settings: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const { users, loading } = useSelector((state: RootState) => state.user);

  const [newPassword, setNewPassword] = useState('');
  const [editingUserId, setEditingUserId] = useState<string | null>(null);

  // New User State
  const [newUser, setNewUser] = useState({ username: '', password: '' });
  const { showConfirm } = useConfirmToast(); // 2. Initialize the hook
  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  const handlePasswordChange = async (userId: string) => {
    if (newPassword.trim() === '') {
      toast.error('Password cannot be empty');
      return;
    }
    try {
      await dispatch(updateUser({ userId, password: newPassword })).unwrap();
      toast.success('Password updated successfully');
      setNewPassword('');
      setEditingUserId(null);
    } catch (error) {
      toast.error('Failed to update password');
    }
  };
  const handleDeleteUser = (userId: string) => {
    showConfirm(userId, async () => {
      try {
        await dispatch(deleteUser(userId)).unwrap();
        toast.success(t('settings.user_removed', 'User removed'));
      } catch (error) {
        toast.error(t('settings.delete_failed', 'Failed to delete user'));
      }
    });
  };
  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.username || !newUser.password) {
      toast.error("Please fill all fields");
      return;
    }
    try {
      await dispatch(registerUser(newUser)).unwrap();
      toast.success("New Admin Added");
      setNewUser({ username: '', password: '' });
    } catch (error) {
      toast.error("Failed to add user");
    }
  };

  return (
    <div className="p-6 lg:p-10 bg-gray-950 min-h-screen text-white font-sans">

      {/* Header */}
      <div className="mb-10">
        <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-gray-200 to-gray-400 flex items-center gap-3">
          <SettingsIcon className="w-8 h-8 text-gray-100" />
          {t('settings.header')}
        </h1>
        <p className="text-gray-400 mt-2">Manage access and system administrators.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* LEFT COLUMN: User List */}
        <div className="lg:col-span-2 space-y-6">
          <h3 className="text-xl font-bold text-white flex items-center gap-2 border-b border-gray-800 pb-4">
            <Shield className="w-5 h-5 text-blue-500" /> {t('settings.accounts')}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {users.map((user: User) => (
              <div
                key={user.id}
                className={`bg-gray-900 rounded-2xl border transition-all duration-300 overflow-hidden relative group
                            ${editingUserId === user.id ? 'border-blue-500 ring-1 ring-blue-500' : 'border-gray-800 hover:border-gray-700'}
                        `}
              >
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold shadow-lg">
                        {user.username.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="text-lg font-bold text-white">{user.username}</h4>
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Calendar className="w-3 h-3" />
                          {new Date(user.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {editingUserId !== user.id && (
                        <>
                          <button
                            onClick={() => setEditingUserId(user.id)}
                            className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
                            title="Change Password"
                          >
                            <Key className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user.id)}
                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                            title="Delete User"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Password Edit Mode */}
                  {editingUserId === user.id ? (
                    <div className="mt-4 bg-gray-800/50 p-3 rounded-xl animate-fadeIn">
                      <label className="text-xs text-blue-400 font-bold mb-1 block">New Password</label>
                      <div className="flex gap-2">
                        <input
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500 outline-none"
                          placeholder="••••••"
                          autoFocus
                        />
                        <button
                          onClick={() => handlePasswordChange(user.id)}
                          className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                        >
                          <Save className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => { setEditingUserId(null); setNewPassword(''); }}
                          className="p-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-2">
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-green-500/10 text-green-500 text-xs font-bold border border-green-500/20">
                        <CheckCircle className="w-3 h-3" /> Active Admin
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT COLUMN: Add User Form */}
        <div>
          <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6 sticky top-24">
            <h3 className="text-xl font-bold text-white flex items-center gap-2 mb-6">
              <Plus className="w-5 h-5 text-green-500" /> {t('settings.add_account')}
            </h3>

            <form onSubmit={handleAddUser} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm text-gray-400 font-medium ml-1">Username</label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
                  <input
                    type="text"
                    value={newUser.username}
                    onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl pl-10 pr-4 py-3 text-white focus:ring-1 focus:ring-green-500 focus:border-green-500 outline-none transition-all placeholder-gray-600"
                    placeholder="admin_user"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm text-gray-400 font-medium ml-1">Password</label>
                <div className="relative">
                  <Key className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
                  <input
                    type="password"
                    value={newUser.password}
                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl pl-10 pr-4 py-3 text-white focus:ring-1 focus:ring-green-500 focus:border-green-500 outline-none transition-all placeholder-gray-600"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-bold rounded-xl shadow-lg shadow-green-900/20 transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2 mt-4"
              >
                {loading ? 'Processing...' : (
                  <>
                    <Plus className="w-5 h-5" /> Add Account
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Settings;