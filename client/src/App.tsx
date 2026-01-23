// src/App.tsx

import React, { useEffect } from 'react';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import Dashboard from './components/Dashboard/Dashboard';
import AllUsers from './components/DetailedTrainees/AllTrainees';
import TraineeDetailsModal from './components/DetailedTrainees/TraineeDetailsModal';
import ErrorBoundary from './components/ErrorBoundary';
import ExpenseManager from './components/Expenses/ExpenseManager';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Settings from './components/Settings';
import SubscriptionPage from './components/Subscriptions/SubscriptionPage';
import Trainers from './components/Trainers/Trainers';
import { useTranslation } from 'react-i18next';
import './i18n';
import store, { AppDispatch, RootState } from './store';
import './App.css';
import { getStoredUser } from './utils/auth';
import { setUser } from './slices/authSlice';
import { Toaster } from 'react-hot-toast';
import AllTrainees from './components/DetailedTrainees/AllTrainees';

function AppContent() {
  const { i18n } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    // Set language on mount
    document.documentElement.lang = i18n.language;
    document.documentElement.dir = i18n.language === 'ar' ? 'rtl' : 'ltr';

    if (i18n.language === 'ar') {
      document.documentElement.style.fontFamily = "'Almarai', sans-serif";
    } else {
      document.documentElement.style.fontFamily = "'Roboto', sans-serif";
    }

    // Check for stored user on mount
    const storedUser = getStoredUser();
    if (storedUser) {
      dispatch(setUser(storedUser));
    }
  }, [i18n.language, dispatch]);

  return (
    <BrowserRouter>
      <Routes>
        {/* Auth Routes - Public */}
        <Route path="/auth/login" element={<Login />} />
        <Route path="/auth/register" element={<Register />} />

        {/* Protected Routes */}
        <Route
          element={
            <ProtectedRoute>
              <Navbar />
            </ProtectedRoute>
          }
        >
          <Route path="/" element={<Dashboard />} />
          <Route path="/trainers" element={<Trainers />} />
          <Route path="/trainees" element={<SubscriptionPage />} />
          <Route path="/expenses" element={<ExpenseManager />} />
          <Route path="/allTrainees" element={<AllTrainees />} />
          <Route path="/settings" element={<Settings />} />
        </Route>

        {/* Redirect to login if not authenticated */}
        <Route path="*" element={<Navigate to={isAuthenticated ? '/' : '/auth/login'} replace />} />
      </Routes>
    </BrowserRouter>
  );
}

function App() {
  return (
    <Provider store={store}>
      <ErrorBoundary>
        <Toaster position="top-center" reverseOrder={false} />
        <AppContent />
      </ErrorBoundary>
    </Provider>
  );
}

export default App;
