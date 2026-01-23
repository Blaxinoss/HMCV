// src/components/Navbar.tsx

import { faGear, faList, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { logout } from '../slices/authSlice';
import { AppDispatch } from '../store';
import LanguageSwitcher from './LanguageSwitcher';
import QuickCheckInModal from './Trainers/QuickCheckInModal';

const Navbar: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const [mobileMenu, setMobileMenu] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/auth/login');
  };
  const [showQuickCheckIn, setShowQuickCheckIn] = useState(false);
  const handleWrapperClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      setMobileMenu(false);
    }
  };

  return (
    <>
      <div className="flex gap-10 p-5 bg-raisin-black justify-around items-center">
        <div>
          <img src="/Logo.jpg" alt="Fight Logo" className="w-[70px] h-auto" />
        </div>

        <div className="text-white relative">
          <div className="flex flex-col justify-center items-center m-auto">
            <FontAwesomeIcon
              icon={faList}
              size="2x"
              className="cursor-pointer md:hidden"
              onClick={() => setMobileMenu(!mobileMenu)}
            />
            {mobileMenu && (
              <>
                <div
                  className={`test fixed inset-0 bg-transparent ${mobileMenu ? 'z-20' : 'z-0'
                    }`}
                  onClick={handleWrapperClick}
                ></div>
                <div
                  className="absolute top-10 bg-black rounded-lg p-4 z-30"
                  onClick={(e) => e.stopPropagation()}
                >
                  <ul className="flex flex-col transition-[hover] text-xs lg:gap-20 md:text-[1.1rem] text-center">
                    <Link
                      className="text-white hover:bg-blue-600 p-3 rounded-md cursor-pointer hover:duration-300"
                      to="/"
                      onClick={() => setMobileMenu(false)}
                    >
                      {t('navbar.dashboard')}
                    </Link>

                    <Link
                      to="/trainers"
                      onClick={() => setMobileMenu(false)}
                      className="text-white hover:bg-blue-600 p-3 rounded-md cursor-pointer hover:duration-300"
                    >
                      {t('navbar.trainers')}
                    </Link>
                    <Link
                      to="/trainees"
                      onClick={() => setMobileMenu(false)}
                      className="text-white hover:bg-blue-600 p-3 rounded-md cursor-pointer hover:duration-300"
                    >
                      {t('navbar.trainees')}
                    </Link>
                    <Link
                      to="/allTrainees"
                      className="text-white hover:bg-blue-600 p-3 rounded-md cursor-pointer hover:duration-300"
                      onClick={() => setMobileMenu(false)}
                    >
                      {t('navbar.all_users')}
                    </Link>
                    <Link
                      to="/expenses"
                      className="text-white hover:bg-blue-600 p-3 rounded-md cursor-pointer hover:duration-300"
                      onClick={() => setMobileMenu(false)}
                    >
                      {t('navbar.expenses')}
                    </Link>
                    <Link
                      to="/settings"
                      className="text-white hover:bg-blue-600 p-3 rounded-md cursor-pointer hover:duration-300"
                      onClick={() => setMobileMenu(false)}
                    >
                      {t('navbar.settings')}
                    </Link>

                    <button
                      onClick={() => setShowQuickCheckIn(true)}
                      className="text-white hover:bg-green-600 p-3 rounded-md cursor-pointer hover:duration-300 flex items-center gap-2"
                    >
                      <span>⚡</span> {/* أيقونة شياكة */}
                      {t('navbar.checkIn')}
                    </button>


                    <button
                      onClick={handleLogout}
                      className="text-white hover:bg-red-600 p-3 rounded-md cursor-pointer hover:duration-300 text-left"
                    >
                      {t('navbar.logout')}
                    </button>
                  </ul>
                </div>
              </>
            )}
          </div>

          <ul className="hidden md:flex flex-row gap-4 lg:gap-20 text-sm lg:text-[1.1rem]">
            <Link
              className="text-white hover:bg-blue-600 p-3 hover:p-3 rounded-md cursor-pointer hover:duration-300"
              to="/"
            >
              {t('navbar.dashboard')}
            </Link>

            <Link
              to="/trainers"
              className="text-white hover:bg-blue-600 p-3 hover:p-3 rounded-md cursor-pointer hover:duration-300"
            >
              {t('navbar.trainers')}
            </Link>
            <Link
              to="/trainees"
              className="text-white hover:bg-blue-600 p-3 hover:p-3 rounded-md cursor-pointer hover:duration-300"
            >
              {t('navbar.trainees')}
            </Link>
            <Link
              to="/allTrainees"
              className="text-white hover:bg-blue-600 p-3 hover:p-3 rounded-md cursor-pointer hover:duration-300"
            >
              {t('navbar.all_users')}
            </Link>
            <Link
              to="/expenses"
              className="text-white hover:bg-blue-600 p-3 hover:p-3 rounded-md cursor-pointer hover:duration-300"
            >
              {t('navbar.expenses')}
            </Link>
          </ul>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowQuickCheckIn(true)}
            className="text-white hover:bg-green-600 p-3 rounded-md cursor-pointer hover:duration-300 flex items-center gap-2"
          >
            <span>⚡</span> {/* أيقونة شياكة */}
            {t('navbar.checkIn')}
          </button>


          <LanguageSwitcher />
          <Link
            to="/settings"
            className="text-white hover:bg-blue-600 p-3 rounded-md"
            title="Settings"
          >
            <FontAwesomeIcon icon={faGear} size="lg" />
          </Link>
          <button
            onClick={handleLogout}
            className="text-white hover:bg-red-600 p-3 rounded-md"
            title="Logout"
          >
            <FontAwesomeIcon icon={faSignOutAlt} size="lg" />
          </button>

        </div>
      </div>
      {showQuickCheckIn && (
        <QuickCheckInModal
          onClose={() => setShowQuickCheckIn(false)}
        />
      )}
      <Outlet />
    </>
  );
};

export default Navbar;
