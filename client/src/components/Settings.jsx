import { t } from 'i18next';
import React, { useEffect, useState } from 'react';
import { FaKey, FaPlusCircle, FaUserEdit } from 'react-icons/fa'; // Icons for better UI
import { useDispatch, useSelector } from 'react-redux';
import { fetchUsers, registerUser, updateUser } from '../slices/userSlice'; // Adjust the path as needed

function Settings() {
  const dispatch = useDispatch();
  const { users } = useSelector((state) => state.user);

  const [newPassword, setNewPassword] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [selectedUserName, setSelectedUserName] = useState(null);

  useEffect(() => {
    // Dispatch fetchUsers when component mounts
    dispatch(fetchUsers());
  }, [dispatch]);

  // Handle password change
  const handlePasswordChange = (userId) => {
    if (newPassword.trim() === '') {
      alert('Please enter a new password');
      return;
    }
    dispatch(updateUser({ userId, password: newPassword }));
    setNewPassword('');
  };

  // Handle new account addition
  const handleAddAccount = async () => {
    if (newUsername.trim() === '' || newPassword.trim() === '') {
      return;
    }
    // Call the API to register a new user (assuming a registerUser action exists)
    dispatch(registerUser({ username: newUsername, password: newPassword }));
    await dispatch(fetchUsers());

    setNewUsername('');
    setNewPassword('');
  };

  return (
    <div className="p-8 bg-gray-900 h-full text-white">
      <h1 className="text-white text-3xl mb-6">{t('settings.header')}</h1>

      {/* Accounts Section */}
      <section>
        <h3 className="my-5 text-2xl font-semibold">{t('settings.accounts')}</h3>
        <ul className="space-y-5">
          {Array.isArray(users) && users.map((user) => (
            user.username !== 'gho2' &&
            <li
              className="p-5 bg-slate-700 rounded-md shadow-lg flex justify-between items-center transition-transform transform hover:scale-[1.009]"
              key={user._id}
            >
              <span className="text-lg font-bold">{user.username}</span>
              <button
                onClick={() => {
                  setSelectedUserId(user._id)
                  setSelectedUserName(user.username)
                }}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
              >
                <FaUserEdit className="inline mr-2 rtl:ml-2" />
                {t('settings.changePassword')}
              </button>
            </li>
          ))}
        </ul>
      </section>

      {/* Management Section */}
      <section className="mt-12">
        <h3 className="my-5 text-2xl font-semibold">{t('settings.management')}</h3>
        <div className="flex flex-col lg:flex-row justify-between gap-8">

          {/* Change Password */}
          <div className="w-full lg:w-1/2 bg-slate-800 p-6 rounded-lg shadow-lg">
            <h4 className="text-xl font-semibold mb-3">{t('settings.changePassword')}</h4>
            <p className='text-xl font-semibold mb-3'>{t('settings.forwho')} {selectedUserName}</p>
            {selectedUserId && (
              <div>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder={t('settings.newPassword')}
                  className="px-4 py-2 w-full rounded-md text-black mb-4"
                />
                <button
                  onClick={() => handlePasswordChange(selectedUserId)}
                  className="bg-green-500 text-white px-6 py-2 rounded-md hover:bg-green-600 transition"
                >
                  <FaKey className="inline mr-2 rtl:ml-2" />
                  {t('settings.updatePassword')}
                </button>
              </div>
            )}
          </div>

          {/* Add New Account */}
          <div className="w-full lg:w-1/2 bg-slate-800 p-6 rounded-lg shadow-lg">
            <h4 className="text-xl font-semibold mb-3">{t('settings.addNewAccount')}</h4>
            <div>
              <input
                type="text"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                placeholder={t('settings.newUsername')}
                className="px-4 py-2 w-full rounded-md text-black mb-4"
              />
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder={t('settings.newPassword')}
                className="px-4 py-2 w-full rounded-md text-black mb-4"
              />
              <button
                onClick={handleAddAccount}
                className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 transition"
              >
                <FaPlusCircle className="inline mr-2 rtl:ml-2" />
                {t('settings.addAccount')}
              </button>
            </div>
          </div>

        </div>
      </section>
    </div>
  );
}

export default Settings;
