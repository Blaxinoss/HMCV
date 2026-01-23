import React from 'react';
import { useTranslation } from 'react-i18next';
import { Trainee } from '../../types';

interface TraineeDetailsModalProps {
  trainee: Trainee | null;
  isOpen: boolean;
  onClose: () => void;
}

const TraineeDetailsModal: React.FC<TraineeDetailsModalProps> = ({ trainee, isOpen, onClose }) => {
  const { t } = useTranslation();

  if (!isOpen || !trainee) return null;

  // دالة مساعدة لتنسيق التاريخ
  const formatDate = (dateString?: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-GB'); // DD/MM/YYYY
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-gray-900 w-full max-w-4xl rounded-2xl shadow-2xl border border-gray-700 max-h-[90vh] overflow-y-auto">

        {/* --- Header --- */}
        <div className="flex justify-between items-start p-6 border-b border-gray-700 bg-gray-800/50 sticky top-0 backdrop-blur-md">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-blue-600 flex items-center justify-center text-2xl font-bold text-white shadow-lg">
              {trainee.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">{trainee.name}</h2>
              <p className="text-gray-400 font-mono text-sm">ID: #{trainee.memberId} | {trainee.phone}</p>
              <div className="flex gap-2 mt-2">
                {trainee.remaining > 0 && (
                  <span className="px-2 py-0.5 rounded text-xs font-bold bg-red-500/20 text-red-400 border border-red-500/30">
                    {t('common.debt')} ({trainee.remaining} EGP)
                  </span>
                )}
                {trainee.accountFreezeStatus && (
                  <span className="px-2 py-0.5 rounded text-xs font-bold bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
                    🧊 Frozen
                  </span>
                )}
                {trainee.daysLeft !== null && trainee.daysLeft < 5 && (
                  <span className="px-2 py-0.5 rounded text-xs font-bold bg-orange-500/20 text-orange-400 border border-orange-500/30">
                    ⏳ Expiring
                  </span>
                )}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-700 rounded-full transition-colors text-gray-400 hover:text-white"
          >
            ✕
          </button>
        </div>

        {/* --- Content Grid --- */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* 1. Subscription / Session Info */}
          <div className="bg-gray-800 p-5 rounded-xl border border-gray-700">
            <h3 className="text-lg font-semibold text-blue-400 mb-4 flex items-center justify-between">
              <span className="flex items-center gap-2">
                {trainee.isSession ? '🎟️' : '📅'}
                {trainee.isSession ? t('trainees.session_details') : t('trainees.subscription_details')}
              </span>

              {/* Badge يوضح نوع الاشتراك */}
              <span className={`text-xs px-2 py-1 rounded border ${trainee.isSession
                ? 'bg-blue-900/30 border-blue-500/50 text-blue-300'
                : 'bg-purple-900/30 border-purple-500/50 text-purple-300'
                }`}>
                {trainee.isSession ? 'Session Based' : 'Time Based'}
              </span>
            </h3>

            <div className="space-y-3">
              {/* تاريخ البدء والانتهاء (مشترك للاثنين بس في السيشن أقل أهمية) */}
              <div className="flex justify-between border-b border-gray-700 pb-2">
                <span className="text-gray-400">{t('trainees.start_date', 'تاريخ البدء')}</span>
                <span className="text-white">{formatDate(trainee.subscriptionStartDate)}</span>
              </div>

              {/* بنعرض تاريخ الانتهاء بس لو مش سيشن، أو لو سيشن بس حابب تعرض صلاحيته */}
              <div className="flex justify-between border-b border-gray-700 pb-2">
                <span className="text-gray-400">{t('trainees.end_date', 'تاريخ الانتهاء')}</span>
                <span className="text-white">{formatDate(trainee.subscriptionEndDate)}</span>
              </div>

              {/* 🔥🔥 هنا التغيير الجوهري 🔥🔥 */}
              {trainee.isSession ? (
                // --- عرض الحصص ---
                <div className="pt-2">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-400 font-bold">{t('trainees.remaining_sessions')}</span>
                    <span className={`text-2xl font-bold font-mono ${(trainee.sessionsRemaining || 0) <= 2 ? 'text-red-500' : 'text-blue-400'
                      }`}>
                      {trainee.sessionsRemaining ?? 0}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 text-right">
                    {(trainee.sessionsRemaining || 0) <= 0 ? `{t('trainees.no_more_sessions')}⚠️` : t('trainees.session')}
                  </p>
                </div>
              ) : (
                // --- عرض الأيام (النظام القديم) ---
                <>
                  <div className="flex justify-between items-center pt-1">
                    <span className="text-gray-400">{t('trainees.days_left', 'الأيام المتبقية')}</span>
                    <span className={`text-xl font-bold ${trainee.daysLeft && trainee.daysLeft < 5 ? 'text-red-500' : 'text-green-500'}`}>
                      {trainee.daysLeft ?? 'N/A'}
                    </span>
                  </div>
                  {/* شريط التقدم للأيام */}
                  {trainee.daysLeft !== null && (
                    <div className="w-full bg-gray-700 rounded-full h-2.5 mt-2">
                      <div
                        className="bg-blue-600 h-2.5 rounded-full transition-all duration-1000"
                        style={{ width: `${Math.min(((30 - trainee.daysLeft) / 30) * 100, 100)}%` }}
                      ></div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* 2. Financials */}
          <div className="bg-gray-800 p-5 rounded-xl border border-gray-700">
            <h3 className="text-lg font-semibold text-green-400 mb-4 flex items-center gap-2">
              💰 {t('trainees.financials', 'الماليات')}
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-900 p-3 rounded-lg text-center">
                <p className="text-xs text-gray-500">{t('trainees.total_cost')}</p>
                <p className="text-lg font-bold text-white">{trainee.totalCost}</p>
              </div>
              <div className="bg-gray-900 p-3 rounded-lg text-center">
                <p className="text-xs text-gray-500">{t('trainees.paid_amount')}</p>
                <p className="text-lg font-bold text-green-400">{trainee.paid}</p>
              </div>
              <div className="bg-gray-900 p-3 rounded-lg text-center col-span-2 border border-gray-700">
                <p className="text-xs text-gray-500">{t('trainees.remaining_debt')}</p>
                <p className={`text-xl font-bold ${trainee.remaining > 0 ? 'text-red-500' : 'text-gray-400'}`}>
                  {trainee.remaining} EGP
                </p>
              </div>
            </div>

            {/* Discount Info */}
            {trainee.appliedDiscount?.hasCustomDiscount && (
              <div className="mt-4 p-3 bg-indigo-900/20 border border-indigo-500/30 rounded text-xs text-indigo-300">
                🏷️ خصم مطبق: {trainee.appliedDiscount.discountValue}
                {trainee.appliedDiscount.discountType === 'fixed' ? 'EGP' : '%'}
                {trainee.appliedDiscount.reason ? ` - ${trainee.appliedDiscount.reason}` : ''}
              </div>
            )}
          </div>

          {/* 3. CRM & Freeze Info */}
          <div className="bg-gray-800 p-5 rounded-xl border border-gray-700">
            <h3 className="text-lg font-semibold text-purple-400 mb-4 flex items-center gap-2">
              🤖 CRM & Status
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">WhatsApp Alerts:</span>
                <span className={trainee.crmInfo.whatsappOptIn ? "text-green-400" : "text-red-400"}>
                  {trainee.crmInfo.whatsappOptIn ? "Active ✅" : "Disabled ❌"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Last Message:</span>
                <span className="text-gray-200">
                  {trainee.crmInfo.lastMessageSent ? formatDate(trainee.crmInfo.lastMessageSent) : 'Never'}
                </span>
              </div>
              {trainee.crmInfo.lastMessageType && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Message Type:</span>
                  <span className="px-2 py-0.5 bg-gray-700 rounded text-xs text-white">
                    {trainee.crmInfo.lastMessageType}
                  </span>
                </div>
              )}

              {trainee.accountFreezeStatus && (
                <div className="mt-4 p-3 bg-yellow-900/20 border border-yellow-500/30 rounded">
                  <p className="text-yellow-500 font-bold text-xs mb-1">{t('SubscriptionForm.freezed')}❄</p>
                  <p className="text-gray-400 text-xs">{t('trainees.freezeStartDate')}{formatDate(trainee.freezeStartDate)}</p>
                </div>
              )}
            </div>
          </div>

          {/* 4. Attendance History (Scrollable) */}
          <div className="bg-gray-800 p-5 rounded-xl border border-gray-700 flex flex-col h-64">
            <h3 className="text-lg font-semibold text-orange-400 mb-4 flex items-center gap-2">
              ⏱️ {t('trainees.attendance_history', 'سجل الحضور')}
            </h3>
            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-2">
              {trainee.attendanceHistory && trainee.attendanceHistory.length > 0 ? (
                trainee.attendanceHistory.slice().reverse().map((record, idx) => (
                  <div key={idx} className="flex justify-between text-sm p-2 bg-gray-700/50 rounded hover:bg-gray-700">
                    <span className="text-gray-300">Check-in</span>
                    <span className="font-mono text-blue-300">
                      {new Date(record.checkIn).toLocaleDateString()} - {new Date(record.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-500 mt-10">
                  No attendance records found.
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default TraineeDetailsModal;