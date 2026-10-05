// src/components/Settings.tsx

import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { deleteUser, fetchUsers, updateUser, createAdmin } from '../slices/userSlice';
import { AppDispatch, RootState } from '../store';
import { User } from '../types';
import {
  Settings as SettingsIcon,
  User as UserIcon,
  Shield,
  Lock,
  Trash2,
  Key,
  Plus,
  Save,
  X,
  CheckCircle,
  Calendar,
  Edit2, // ايقونة جديدة للتعديل
  Crown
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useConfirmToast } from './toasters/deleteToaster';

const Settings: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const { users, loading } = useSelector((state: RootState) => state.user);

  // ✅ 1. إضافة State للاسم
  const [newPassword, setNewPassword] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [editingUserId, setEditingUserId] = useState<string | null>(null);

  const [newUser, setNewUser] = useState({ username: '', password: '' });
  const { showConfirm } = useConfirmToast();

  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  // ✅ 2. دالة بدء التعديل (عشان نملا البيانات القديمة)
  const startEditing = (user: User) => {
    setEditingUserId(user._id);
    setNewUsername(user.username); // حط الاسم القديم عشان تعدل عليه
    setNewPassword(''); // الباسورد فاضي عشان لو مش عايز تغيره
  };

  // ✅ 3. دالة الحفظ الجديدة (User + Password)
  const handleUpdateUser = async (userId: string) => {
    if (!newUsername.trim()) {
      toast.error('Username cannot be empty');
      return;
    }

    try {
      // نجهز البيانات اللي هتتبعت
      const updateData: any = { userId, username: newUsername };

      // لو كتب باسورد جديد، ضيفه. لو مكتبش، سيبه فاضي عشان الباك إند يتجاهله
      if (newPassword.trim() !== '') {
        updateData.password = newPassword;
      }

      await dispatch(updateUser(updateData)).unwrap();
      toast.success('User updated successfully');

      // Reset
      setNewPassword('');
      setNewUsername('');
      setEditingUserId(null);
    } catch (error) {
      toast.error('Failed to update user');
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
      toast.error(t('settings.fill_all_fields'));
      return;
    }
    try {
      await dispatch(createAdmin(newUser)).unwrap();
      toast.success(t('settings.admin_added'));
      setNewUser({ username: '', password: '' });
    } catch (error) {
      toast.error(t('settings.failed_add_user'));
    }
  };

  return (
    <div className="p-6 lg:p-10 bg-gray-950 min-h-screen text-white font-sans">
      <div className="mb-10">
        <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-gray-200 to-gray-400 flex items-center gap-3">
          <SettingsIcon className="w-8 h-8 text-gray-100" />
          {t('settings.header')}
        </h1>
        <p className="text-gray-400 mt-2">{t('settings.manage_description')}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <h3 className="text-xl font-bold text-white flex items-center gap-2 border-b border-gray-800 pb-4">
            <Shield className="w-5 h-5 text-blue-500" /> {t('settings.accounts')}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {users.map((user: User) => (
              <div
                key={user._id}
                className={`bg-gray-900 rounded-2xl border transition-all duration-300 overflow-hidden relative group
                            ${editingUserId === user._id ? 'border-blue-500 ring-1 ring-blue-500' : 'border-gray-800 hover:border-gray-700'}
                        `}
              >
                <div className="p-6">
                  {/* ✅ 4. عرض البيانات أو فورم التعديل بناء على الحالة */}
                  {editingUserId === user._id ? (
                    <div className="space-y-3 animate-fadeIn">
                      {/* Username Input */}
                      <div>
                        <label className="text-xs text-blue-400 font-bold mb-1 block">{t('settings.username_label')}</label>
                        <input
                          type="text"
                          value={newUsername}
                          onChange={(e) => setNewUsername(e.target.value)}
                          className="w-full bg-gray-950 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500 outline-none"
                        />
                      </div>

                      {/* Password Input */}
                      <div>
                        <label className="text-xs text-blue-400 font-bold mb-1 block">{t('settings.new_password_label')}</label>
                        <input
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder={t('settings.password_optional_hint')}
                          className="w-full bg-gray-950 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500 outline-none"
                        />
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2 justify-end mt-2">
                        <button
                          onClick={() => handleUpdateUser(user._id)}
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm flex items-center gap-1"
                        >
                          <Save className="w-3 h-3" /> {t('settings.save_button')}
                        </button>
                        <button
                          onClick={() => { setEditingUserId(null); setNewPassword(''); setNewUsername(''); }}
                          className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm flex items-center gap-1"
                        >
                          <X className="w-3 h-3" /> {t('settings.cancel_button')}
                        </button>
                      </div>
                    </div>
                  ) : (
                    // العرض العادي (Not Editing)
                    <>
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
                          <button
                            onClick={() => startEditing(user)} // ✅ استدعاء دالة التعديل الجديدة
                            className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
                            title="Edit User"
                          >
                            <Edit2 className="w-4 h-4" /> {/* غيرت الايقونة لـ Edit لأننا هنعدل الاسم كمان */}
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user._id)}
                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                            title="Delete User"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <div className="mt-2">
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-green-500/10 text-green-500 text-xs font-bold border border-green-500/20">
                          <CheckCircle className="w-3 h-3" /> {t('settings.active_admin')}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT COLUMN: Add User Form */}



        <div>
          {/* غيرنا الـ div الرئيسي عشان يبقى relative و overflow-hidden */}
          <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6 sticky top-24 relative overflow-hidden group">


            <div className="absolute inset-0 z-20 backdrop-blur-[0.25px] flex flex-col items-center justify-center text-center p-6 border border-amber-500/20 rounded-2xl transition-all duration-300">


              <button
                onClick={() => alert("let's do it then!")}
                className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white text-sm font-bold rounded-xl shadow-lg shadow-orange-900/20 transition-all transform hover:scale-105 flex items-center gap-2"
              >
                <Lock className="w-4 h-4" /> Premium feature
              </button>
            </div>


            {/* --- ORIGINAL CONTENT (معمولة باهتة لو مش بريميم) --- */}
            <div className="opacity-20 pointer-events-none filter blur-[1px]">
              <h3 className="text-xl font-bold text-white flex items-center gap-2 mb-6">
                <Plus className="w-5 h-5 text-green-500" /> {t('settings.add_account')}
              </h3>

              <form onSubmit={handleAddUser} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm text-gray-400 font-medium ml-1">{t('settings.username_label')}</label>
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
                    <input
                      type="text"
                      value={newUser.username}
                      onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                      className="w-full bg-gray-800 border border-gray-700 rounded-xl pl-10 pr-4 py-3 text-white focus:ring-1 focus:ring-green-500 focus:border-green-500 outline-none transition-all placeholder-gray-600"
                      placeholder={t('settings.placeholder_username')}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-gray-400 font-medium ml-1">{t('settings.password_label')}</label>
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
                  {loading ? t('settings.processing') : (
                    <>
                      <Plus className="w-5 h-5" /> {t('settings.addAccount')}
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
        );

      </div>
    </div>
  );

}
export default Settings;