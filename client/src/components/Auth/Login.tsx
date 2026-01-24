import React, { FormEvent, useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { loginUser, clearError } from '../../slices/authSlice';
import { AppDispatch, RootState } from '../../store';
import { User, Lock, ArrowRight, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

const Login: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state: RootState) => state.auth);

  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });

  // Clear errors on mount
  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  // Show toast on error
  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    // 1. أهم سطر: منع الريلود
    console.log("🛑 STOP RELOAD");
    e.preventDefault();

    try {
      // 2. استخدام unwrap عشان نفصل النجاح عن الفشل
      const user = await dispatch(
        loginUser({
          username: formData.username,
          password: formData.password,
        })
      ).unwrap();

      // 3. لو وصلنا هنا يبقى الدخول نجح 100%
      // مش محتاجين نعمل check على user.isAuthenticated لأن unwrap لو فشل هيروح للـ catch
      toast.success(`Welcome back, ${user.username}!`);
      navigate('/');

    } catch (error: any) {
      // 4. لو الباسورد غلط هيدخل هنا
      // الـ error هنا هو الرسالة الـ string اللي جاية من rejectWithValue
      console.error("Login Error:", error);
      toast.error(error || 'Invalid username or password');

      // هنا مفيش ريلود هيحصل، مجرد توست هيظهر
    }
  };
  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4 relative overflow-hidden">

      {/* Background Ambience */}
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-900/20 via-gray-950 to-gray-950 pointer-events-none"></div>
      <div className="absolute -top-20 -right-20 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="bg-gray-900 border border-gray-800 w-full max-w-md rounded-2xl shadow-2xl relative z-10 overflow-hidden">
        {/* Header */}
        <div className="p-8 pb-0 text-center">
          <div className="w-16 h-16 bg-gradient-to-tr from-blue-600 to-purple-600 rounded-2xl mx-auto flex items-center justify-center shadow-lg shadow-blue-900/20 mb-6 transform rotate-3">
            <span className="text-3xl font-bold text-white">F</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white mb-2">{t('login.welcome_back')}</h1>
          <p className="text-gray-400">{t('login.subtitle')}</p>
        </div>

        {/* Form */}
        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-5">

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300 ml-1">{t('login.username_label')}</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-500" />
                </div>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  className="w-full pl-10 pr-4 py-3 bg-gray-950 border border-gray-800 rounded-xl text-white placeholder-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                  placeholder={t('login.username_placeholder')}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300 ml-1">{t('login.password_label')}</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-500" />
                </div>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  className="w-full pl-10 pr-4 py-3 bg-gray-950 border border-gray-800 rounded-xl text-white placeholder-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                  placeholder={t('login.password_placeholder')}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold rounded-xl shadow-lg shadow-blue-900/20 transition-all transform active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" /> {t('login.logging_in')}
                </>
              ) : (
                <>
                  {t('login.sign_in_button')} <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-gray-500 text-sm">
              {t('login.no_account_text')}{' '}
              <Link to="/auth/register" className="text-blue-400 hover:text-blue-300 font-semibold transition-colors">
                {t('login.create_account_link')}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;