// src/components/Trainees/SubscriptionPage.tsx

import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import { fetchTrainees } from '../../slices/subscriptionSlice';
import { Trainee } from '../../types';
import TraineeList from './TraineeList';
import SubscriptionForm from './SubscriptionForm';
import {
  Users,
  UserPlus,
  CreditCard,
  ShieldCheck,
  ArrowLeft,
  Activity
} from 'lucide-react';

const Skeleton = ({ className }: { className?: string }) => (
  <div className={`animate-pulse bg-gray-700/50 rounded ${className}`} />
);

const SubscriptionPage: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();

  // 1. Fetch data for Stats
  const { trainees, loading } = useSelector((state: RootState) => state.trainees);

  useEffect(() => {
    dispatch(fetchTrainees());
  }, [dispatch]);

  const [showForm, setShowForm] = useState(false);
  const [editingTrainee, setEditingTrainee] = useState<Trainee | null>(null);

  // 2. Real-time Stats Calculation
  const stats = useMemo(() => {
    const total = trainees.length;
    const active = trainees.filter(t => new Date(t.subscriptionEndDate) > new Date()).length;
    const debt = trainees.reduce((sum, t) => sum + (t.remaining || 0), 0);
    return { total, active, debt };
  }, [trainees]);

  const handleAddNew = () => {
    setEditingTrainee(null);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleEdit = (trainee: Trainee) => {
    setEditingTrainee(trainee);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSuccess = () => {
    setShowForm(false);
    setEditingTrainee(null);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingTrainee(null);
  };

  return (
    <div className="p-6 lg:p-10 bg-gray-950 min-h-screen text-white font-sans">

      {/* 3. Dynamic Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500">
            {showForm
              ? (editingTrainee ? t('subscription.edit_member') : t('subscription.new_member'))
              : t('subscription.title')}
          </h1>
          <p className="text-gray-400 mt-1">
            {showForm
              ? t('subscription.form_subtitle')
              : t('subscription.manage_description')}
          </p>
        </div>

        {/* Action Buttons */}
        <div>
          {showForm ? (
            <button
              onClick={handleCancel}
              className="flex items-center gap-2 px-5 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl font-semibold transition-all border border-gray-700"
            >
              <ArrowLeft className="w-5 h-5" />
              {t('common.back')}
            </button>
          ) : (
            <button
              onClick={handleAddNew}
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold shadow-lg shadow-blue-900/20 transition-all transform hover:scale-105"
            >
              <UserPlus className="w-5 h-5" />
              {t('subscription.add_new')}
            </button>
          )}
        </div>
      </div>

      {/* 4. Stats Cards (Only visible in List View) */}
      {!showForm && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 animate-fadeIn">
          {/* Total Members */}
          <div className="bg-gray-900 border border-gray-800 p-6 rounded-2xl flex items-center gap-4 shadow-lg group hover:border-blue-500/30 transition-colors">
            <div className="p-3 bg-blue-500/10 rounded-xl text-blue-500 group-hover:scale-110 transition-transform">
              <Users className="w-8 h-8" />
            </div>
            <div>
              <p className="text-sm text-gray-400 font-medium">{t('subscription.total_members_label')}</p>
              <h3 className="text-2xl font-bold text-white">
                {loading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  stats.total
                )}
              </h3>
            </div>
          </div>

          {/* Active Members */}
          <div className="bg-gray-900 border border-gray-800 p-6 rounded-2xl flex items-center gap-4 shadow-lg group hover:border-green-500/30 transition-colors">
            <div className="p-3 bg-green-500/10 rounded-xl text-green-500 group-hover:scale-110 transition-transform">
              <Activity className="w-8 h-8" />
            </div>
            <div>
              <p className="text-sm text-gray-400 font-medium">{t('subscription.active_memberships_label')}</p>
              <h3 className="text-2xl font-bold text-white">
                {loading ? (
                  <Skeleton className="h-8 w-16" /> // ثبّت الارتفاع والعرض
                ) : (
                  stats.active
                )}
              </h3>
            </div>
          </div>

          {/* Total Debt */}
          <div className="bg-gray-900 border border-gray-800 p-6 rounded-2xl flex items-center gap-4 shadow-lg group hover:border-red-500/30 transition-colors">
            <div className="p-3 bg-red-500/10 rounded-xl text-red-500 group-hover:scale-110 transition-transform">
              <CreditCard className="w-8 h-8" />
            </div>
            <div>
              <p className="text-sm text-gray-400 font-medium">{t('subscription.outstanding_debt_label')}</p>
              <h3 className="text-2xl font-bold text-white font-mono">
                {loading ? '...' : stats.debt.toLocaleString()} EGP
              </h3>
            </div>
          </div>
        </div>
      )}

      {/* 5. Main Content Area */}
      <div className="transition-all duration-300 ease-in-out">
        {showForm ? (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 lg:p-8 shadow-2xl animate-slideIn">
            <div className="flex items-center gap-3 mb-6 pb-6 border-b border-gray-800">
              <div className="p-2 bg-purple-500/10 rounded-lg">
                <ShieldCheck className="w-6 h-6 text-purple-500" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Membership Details</h2>
                <p className="text-sm text-gray-400">Ensure all fields are correct before saving.</p>
              </div>
            </div>
            <SubscriptionForm
              trainee={editingTrainee}
              onSuccess={handleSuccess}
              onCancel={handleCancel}
            />
          </div>
        ) : (
          <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden shadow-xl">
            <TraineeList onEdit={handleEdit} onAddNew={handleAddNew} />
          </div>
        )}
      </div>
    </div>
  );
};

export default SubscriptionPage;