import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { logout } from '../slices/authSlice';
import { AppDispatch } from '../store';
import LanguageSwitcher from './LanguageSwitcher';
import QuickCheckInModal from './Trainers/QuickCheckInModal';
import {
  LayoutDashboard,
  Users,
  Dumbbell,
  CreditCard,
  Settings,
  LogOut,
  Menu,
  X,
  Zap,
  Globe,
  Send
} from 'lucide-react';

const Navbar: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenu, setMobileMenu] = useState(false);
  const [showQuickCheckIn, setShowQuickCheckIn] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/auth/login');
  };

  // Helper component for Links to avoid repetition
  const NavItem = ({ to, icon: Icon, label, onClick }: any) => {
    const isActive = location.pathname === to;
    return (
      <Link
        to={to}
        onClick={onClick}
        className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-200 font-medium text-sm
          ${isActive
            ? 'bg-blue-600/10 text-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.15)] border border-blue-500/20'
            : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
      >
        <Icon className={`w-4 h-4 ${isActive ? 'text-blue-400' : 'text-gray-500'}`} />
        {label}
      </Link>
    );
  };

  return (
    <>
      {/* Navbar Container */}
      <nav className="sticky top-0 z-40 w-full bg-gray-950/80 backdrop-blur-md border-b border-gray-800">
        <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">

            {/* 1. Logo Section */}
            <div className="flex items-center gap-3">
              <Link to="/" className="flex items-center gap-2 group">
                <div className="relative">
                  <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
                  <img
                    src="/Logo.jpg"
                    alt="Fight Logo"
                    className="relative w-10 h-10 rounded-full border-2 border-gray-800 object-cover"
                  />
                </div>
                <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 hidden sm:block">
                  Fight Club
                </span>
              </Link>
            </div>

            {/* 2. Desktop Navigation */}
            <div className="hidden md:flex items-center gap-2 bg-gray-900/50 p-1.5 rounded-2xl border border-gray-800">
              <NavItem to="/" icon={LayoutDashboard} label={t('navbar.dashboard')} />
              <NavItem to="/trainers" icon={Dumbbell} label={t('navbar.trainers')} />
              <NavItem to="/trainees" icon={Users} label={t('navbar.trainees')} />
              <NavItem to="/allTrainees" icon={Users} label={t('navbar.all_users')} />
              <NavItem to="/expenses" icon={CreditCard} label={t('navbar.expenses')} />
              <NavItem to="/crm" icon={Send} label={t('navbar.crm')} />
            </div>

            {/* 3. Right Actions */}
            <div className="hidden md:flex items-center gap-4">

              {/* Quick Check-In Button */}
              <button
                onClick={() => setShowQuickCheckIn(true)}
                className="flex items-center  gap-2 px-4 py-2 bg-blue-700 hover:bg-blue-500   text-white rounded-xl text-sm font-bold shadow-lg shadow-purple-900/20 transition-all hover:scale-105 active:scale-95"
              >
                <Zap className="w-4 h-4 fill-white" />
                {t('navbar.checkIn')}
              </button>

              <div className="h-6 w-px bg-gray-800 mx-1"></div>

              <div className="flex items-center gap-2">
                <LanguageSwitcher />

                <Link
                  to="/settings"
                  className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
                  title={t('navbar.settings')}
                >
                  <Settings className="w-5 h-5" />
                </Link>

                <button
                  onClick={handleLogout}
                  className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                  title={t('navbar.logout')}
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* 4. Mobile Menu Button */}
            <div className="md:hidden flex items-center gap-4">
              <button
                onClick={() => setShowQuickCheckIn(true)}
                className="p-2 bg-purple-600/20 text-purple-400 rounded-lg"
              >
                <Zap className="w-5 h-5" />
              </button>
              <button
                onClick={() => setMobileMenu(!mobileMenu)}
                className="text-gray-300 hover:text-white"
              >
                {mobileMenu ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
              </button>
            </div>
          </div>
        </div>

        {/* 5. Mobile Menu Dropdown */}
        <div
          className={`md:hidden absolute top-20 left-0 w-full bg-gray-900 border-b border-gray-800 transition-all duration-300 ease-in-out overflow-hidden ${mobileMenu ? 'max-h-[500px] opacity-100 shadow-2xl' : 'max-h-0 opacity-0'
            }`}
        >
          <div className="p-4 space-y-2">
            <NavItem to="/" icon={LayoutDashboard} label={t('navbar.dashboard')} onClick={() => setMobileMenu(false)} />
            <NavItem to="/trainers" icon={Dumbbell} label={t('navbar.trainers')} onClick={() => setMobileMenu(false)} />
            <NavItem to="/trainees" icon={Users} label={t('navbar.trainees')} onClick={() => setMobileMenu(false)} />
            <NavItem to="/allTrainees" icon={Users} label={t('navbar.all_users')} onClick={() => setMobileMenu(false)} />
            <NavItem to="/expenses" icon={CreditCard} label={t('navbar.expenses')} onClick={() => setMobileMenu(false)} />
            <NavItem to="/crm" icon={Send} label={t('navbar.crm')} onClick={() => setMobileMenu(false)} />
            <NavItem to="/settings" icon={Settings} label={t('navbar.settings')} onClick={() => setMobileMenu(false)} />

            <div className="border-t border-gray-800 my-2 pt-2 flex justify-between items-center px-2">
              <LanguageSwitcher />
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 text-red-400 font-medium"
              >
                <LogOut className="w-4 h-4" /> {t('navbar.logout')}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Modals */}
      {showQuickCheckIn && (
        <QuickCheckInModal onClose={() => setShowQuickCheckIn(false)} />
      )}

      {/* Main Content */}
      <main className="relative">
        <Outlet />
      </main>
    </>
  );
};

export default Navbar;