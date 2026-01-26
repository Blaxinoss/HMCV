import React from 'react';
import { useTranslation } from 'react-i18next';
import { Trainee } from '../../types';
import {
  X,
  User,
  Calendar,
  DollarSign,
  Clock,
  CreditCard,
  MessageSquare,
  Activity,
  Snowflake,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';

interface TraineeDetailsModalProps {
  trainee: Trainee | null;
  isOpen: boolean;
  onClose: () => void;
}

const TraineeDetailsModal: React.FC<TraineeDetailsModalProps> = ({ trainee, isOpen, onClose }) => {
  const { t } = useTranslation();

  if (!isOpen || !trainee) return null;

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-GB');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-gray-950 w-full max-w-5xl rounded-3xl shadow-2xl border border-gray-800 max-h-[90vh] overflow-y-auto overflow-x-hidden">

        {/* --- Header --- */}
        <div className="relative bg-gradient-to-r from-gray-900 to-gray-800 p-8 border-b border-gray-800">
          <button
            onClick={onClose}
            className="absolute top-6 right-6 p-2 bg-black/20 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white"
          >
            <X className="w-6 h-6" />
          </button>

          <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
            {/* Large Avatar */}
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-4xl font-bold text-white shadow-xl ring-4 ring-gray-900">
              {trainee.name.charAt(0).toUpperCase()}
            </div>

            <div className="text-center md:text-left flex-1">
              <h2 className="text-3xl font-bold text-white mb-2">{trainee.name}</h2>
              <div className="flex flex-wrap gap-3 justify-center md:justify-start text-sm text-gray-400 mb-4">
                <span className="flex items-center gap-1 bg-gray-800 px-3 py-1 rounded-full">
                  <User className="w-3 h-3" /> #{trainee.memberId}
                </span>
                <span className="flex items-center gap-1 bg-gray-800 px-3 py-1 rounded-full">
                  {trainee.phone}
                </span>
              </div>

              {/* Status Badges */}
              <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                {trainee.accountFreezeStatus && (
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 flex items-center gap-1">
                    <Snowflake className="w-3 h-3" /> {t('trainees.frozen')}
                  </span>
                )}
                {trainee.remaining > 0 && (
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-500/10 text-red-500 border border-red-500/20 flex items-center gap-1">
                    <DollarSign className="w-3 h-3" /> {t('trainees.debt')}: {trainee.remaining} EGP
                  </span>
                )}
                {trainee.daysLeft !== null && trainee.daysLeft !== 0 && trainee.daysLeft < 5 && (
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-orange-500/10 text-orange-500 border border-orange-500/20 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" /> {t('trainees.expiring_soon')}
                  </span>
                )}
                {trainee.daysLeft !== null && trainee.daysLeft === 0 && (
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-orange-500/10 text-orange-500 border border-orange-500/20 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" /> {t('trainees.filter_expired')}
                  </span>
                )}

              </div>
            </div>
          </div>
        </div>

        {/* --- Content Grid --- */}
        <div className="p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* 1. Plan Details */}
          <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
            <div className="p-5 border-b border-gray-800 bg-gray-800/30 flex justify-between items-center">
              <h3 className="font-bold text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-500" /> Plan Overview
              </h3>
              <span className={`text-xs px-2 py-1 rounded font-mono ${trainee.isSession ? 'bg-blue-500/20 text-blue-400' : 'bg-purple-500/20 text-purple-400'}`}>
                {trainee.isSession ? 'SESSION-BASED' : 'TIME-BASED'}
              </span>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500 uppercase font-bold mb-1">Start Date</p>
                  <p className="text-white font-medium">{formatDate(trainee.subscriptionStartDate)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase font-bold mb-1">End Date</p>
                  <p className="text-white font-medium">{formatDate(trainee.subscriptionEndDate)}</p>
                </div>
              </div>

              {/* Progress Bar or Sessions */}
              <div className="bg-gray-800/50 p-4 rounded-xl border border-gray-800">
                {trainee.isSession ? (
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-gray-400 mb-1">Sessions Remaining</p>
                      <p className={`text-3xl font-bold ${(trainee.sessionsRemaining || 0) <= 2 ? 'text-red-500' : 'text-white'}`}>
                        {trainee.sessionsRemaining ?? 0}
                      </p>
                    </div>
                    <Activity className="w-10 h-10 text-gray-700" />
                  </div>
                ) : (
                  <div>
                    <div className="flex justify-between items-end mb-2">
                      <p className="text-sm text-gray-400">Days Remaining</p>
                      <p className={`text-2xl font-bold ${trainee.daysLeft !== undefined && trainee.daysLeft !== null && trainee.daysLeft < 5 ? 'text-red-500' : 'text-green-500'}`}>
                        {trainee.daysLeft ?? 0}
                      </p>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${trainee.daysLeft !== undefined && trainee.daysLeft !== null && trainee.daysLeft < 5 ? 'bg-red-500' : 'bg-green-500'}`}
                        style={{ width: `${Math.min(((30 - (trainee.daysLeft || 0)) / 30) * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 2. Financials */}
          <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
            <div className="p-5 border-b border-gray-800 bg-gray-800/30">
              <h3 className="font-bold text-white flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-green-500" /> Financial Summary
              </h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="p-4 bg-gray-800 rounded-xl text-center">
                  <p className="text-xs text-gray-500 uppercase mb-1">Total Cost</p>
                  <p className="text-xl font-bold text-white">{trainee.totalCost} EGP</p>
                </div>
                <div className="p-4 bg-gray-800 rounded-xl text-center">
                  <p className="text-xs text-gray-500 uppercase mb-1">Paid</p>
                  <p className="text-xl font-bold text-green-400">{trainee.paid} EGP</p>
                </div>
              </div>

              <div className="flex justify-between items-center p-4 bg-gray-800/50 rounded-xl border border-gray-800">
                <span className="text-sm text-gray-400">Outstanding Balance</span>
                <span className={`text-xl font-mono font-bold ${trainee.remaining > 0 ? 'text-red-500' : 'text-gray-500'}`}>
                  {trainee.remaining} EGP
                </span>
              </div>

              {trainee.appliedDiscount?.hasCustomDiscount && (
                <div className="mt-4 flex items-center gap-2 text-xs text-indigo-400 bg-indigo-500/10 p-2 rounded-lg border border-indigo-500/20">
                  <CheckCircle className="w-3 h-3" />
                  Discount Applied: {trainee.appliedDiscount.discountValue}{trainee.appliedDiscount.discountType === 'percentage' ? '%' : 'EGP'}
                </div>
              )}
            </div>
          </div>

          {/* 3. CRM & History */}
          <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden lg:col-span-2">
            <div className="p-5 border-b border-gray-800 bg-gray-800/30 flex justify-between items-center">
              <h3 className="font-bold text-white flex items-center gap-2">
                <Clock className="w-5 h-5 text-orange-500" /> Activity Log
              </h3>
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <MessageSquare className="w-3 h-3" />
                Last Contact: {trainee.crmInfo.lastMessageSent ? formatDate(trainee.crmInfo.lastMessageSent) : 'Never'}
              </div>
            </div>

            <div className="p-0">
              <div className="max-h-64 overflow-y-auto custom-scrollbar">
                {trainee.attendanceHistory && trainee.attendanceHistory.length > 0 ? (
                  <table className="w-full text-left text-sm">
                    <thead className="bg-gray-800/50 text-gray-500 sticky top-0">
                      <tr>
                        <th className="px-6 py-3 font-medium">Type</th>
                        <th className="px-6 py-3 font-medium">Date</th>
                        <th className="px-6 py-3 font-medium">Time</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                      {trainee.attendanceHistory.slice().reverse().map((record, idx) => (
                        <tr key={idx} className="hover:bg-gray-800/30 transition-colors">
                          <td className="px-6 py-3 text-blue-400 font-medium">Check-in</td>
                          <td className="px-6 py-3 text-gray-300">{new Date(record.checkIn).toLocaleDateString()}</td>
                          <td className="px-6 py-3 text-gray-500 font-mono">{new Date(record.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="p-10 text-center text-gray-500 flex flex-col items-center">
                    <Clock className="w-8 h-8 mb-2 opacity-50" />
                    No attendance records found yet.
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default TraineeDetailsModal;