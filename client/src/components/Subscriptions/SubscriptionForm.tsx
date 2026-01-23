import React, { FormEvent, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import {
  addTrainee,
  updateTrainee,
} from '../../slices/subscriptionSlice';
import { AppDispatch, RootState } from '../../store';
import { Trainee } from '../../types';
import useMessage from '../../utils/useMessageHook';
import toast from 'react-hot-toast';

interface SubscriptionFormProps {
  trainee?: Trainee | null;
  onSuccess: () => void;
  onCancel: () => void;
}

const SubscriptionForm: React.FC<SubscriptionFormProps> = ({
  trainee,
  onSuccess,
  onCancel,
}) => {
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const { loading } = useSelector((state: RootState) => state.trainees);
  const { success: showSuccess, error: showError } = useMessage();

  // 1. شلنا discount وضفنا couponCode
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    subscriptionStartDate: new Date().toISOString().split('T')[0],
    subscriptionEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0],
    totalCost: 0,
    paid: 0,
    couponCode: '', // ✅ الحقل الجديد
    isSession: false,
    sessionsCount: 0,
  });

  useEffect(() => {
    if (trainee) {
      setFormData({
        name: trainee.name,
        phone: trainee.phone,
        subscriptionStartDate: new Date(trainee.subscriptionStartDate)
          .toISOString()
          .split('T')[0],
        subscriptionEndDate: new Date(trainee.subscriptionEndDate)
          .toISOString()
          .split('T')[0],
        totalCost: trainee.totalCost,
        paid: trainee.paid,
        couponCode: '', // في التعديل غالباً مبنحطش كوبون جديد، فبنسيبه فاضي
        isSession: trainee.isSession,
        sessionsCount: (trainee as any).sessionsRemaining || 0,
      });
    }
  }, [trainee]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]:
        type === 'checkbox'
          ? (e.target as HTMLInputElement).checked
          // شلنا discount من المصفوفة دي
          : ['totalCost', 'paid', 'sessionsCount'].includes(name)
            ? parseFloat(value) || 0
            : value,
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.phone || !formData.totalCost) {
      toast.error(t('trainees.fill_required_fields'), {
        style: {
          borderRadius: '10px',
          background: '#333',
          color: '#fff',
        },
      });
      return;
    }

    if (formData.isSession && formData.sessionsCount <= 0) {
      toast.error(t('trainees.sessions_count_required', 'Please enter number of sessions'), {
        style: { borderRadius: '10px', background: '#333', color: '#fff' },
      });
      return;
    }

    try {
      // بنجهز الداتا اللي هتتبعت (لاحظ مفيش discount هنا)
      const payload = {
        ...formData,
        // لو الكوبون فاضي، متبعتوش عشان الباك إند ميتلخبطش
        couponCode: formData.couponCode || undefined
      };

      if (trainee) {
        dispatch(
          updateTrainee({
            id: trainee._id,
            data: payload as any,
          })
        );
        showSuccess(t('TraineeUpdated')); // عدلت الرسالة لتكون منطقية
      } else {
        dispatch(addTrainee(payload as any));
        showSuccess(t('TraineeAdded'));
      }
      onSuccess();
    } catch (error) {
      showError(t('trainees.operation_failed'));
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-gray-800 rounded-lg p-8 border border-gray-700 "
    >
      <h2 className="text-2xl font-bold mb-6 text-white">
        {trainee ? t('trainees.edit_trainee') : t('trainees.add_new_trainee')}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Name */}
        <div>
          <label className="block text-sm font-semibold text-white mb-2">
            {t('trainees.name')} *
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full px-4 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-500 outline-none transition"
            disabled={loading}
            required
          />
        </div>

        {/* Phone */}
        <div>
          <label className="block text-sm font-semibold text-white mb-2">
            {t('trainees.phone')} *
          </label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className="w-full px-4 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-500 outline-none transition"
            disabled={loading}
            required
          />
        </div>

        {/* Start Date */}
        <div>
          <label className="block text-sm font-semibold text-white mb-2">
            {t('trainees.start_date')}
          </label>
          <input
            type="date"
            name="subscriptionStartDate"
            value={formData.subscriptionStartDate}
            onChange={handleChange}
            className="w-full px-4 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-500 outline-none transition"
            disabled={loading}
          />
        </div>

        {/* End Date */}
        <div>
          <label className="block text-sm font-semibold text-white mb-2">
            {t('trainees.end_date')}
          </label>
          <input
            type="date"
            name="subscriptionEndDate"
            value={formData.subscriptionEndDate}
            onChange={handleChange}
            className="w-full px-4 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-500 outline-none transition"
            disabled={loading}
          />
        </div>

        {/* Total Cost */}
        <div>
          <label className="block text-sm font-semibold text-white mb-2">
            {t('trainees.total_cost')} *
          </label>
          <input
            type="number"
            name="totalCost"
            value={formData.totalCost}
            onChange={handleChange}
            className="w-full px-4 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-500 outline-none transition"
            disabled={loading}
            min="0"
            step="0.01"
            required
          />
        </div>

        {/* Paid */}
        <div>
          <label className="block text-sm font-semibold text-white mb-2">
            {t('trainees.paid')}
          </label>
          <input
            type="number"
            name="paid"
            value={formData.paid}
            onChange={handleChange}
            className="w-full px-4 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-500 outline-none transition"
            disabled={loading}
            min="0"
            step="0.01"
          />
        </div>

        {/* ✅ Coupon Code Field (Instead of Discount) */}
        <div>
          <label className="block text-sm font-semibold text-white mb-2">
            {t('trainees.coupon_code')} 🎫
          </label>
          <input
            type="text"
            name="couponCode"
            value={formData.couponCode}
            onChange={handleChange}
            placeholder="Ex: SUMMER20"
            className="w-full px-4 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-500 outline-none transition uppercase placeholder-gray-500"
            disabled={loading || !!trainee} // ممكن نقفله في حالة التعديل لو مش عايزين يغيروا الكوبون بأثر رجعي
          />
        </div>

        {/* 🆕 Is Session & Sessions Count Row */}
        <div className="md:col-span-2 flex flex-col items-stretch flex-wrap items-end gap-6 p-4 bg-gray-700/30 rounded-lg border border-gray-700">
          {/* Checkbox */}
          <label className="flex items-center gap-3 text-white font-semibold cursor-pointer select-none">
            <div className="relative flex items-center">
              <input
                type="checkbox"
                name="isSession"
                checked={formData.isSession}
                onChange={handleChange}
                className="w-5 h-5 rounded border-gray-600 text-blue-600 focus:ring-blue-500 bg-gray-700"
              />
            </div>
            <span className="text-blue-300">{t('trainees.is_session', 'Session Based System')}</span>
          </label>

          {/* 🆕 Input Field (Visible Only if isSession is true) */}
          {formData.isSession && (
            <div className="flex-1 min-w-[200px] animate-fadeIn">
              <label className="block text-xs font-semibold text-blue-300 mb-1">
                {t('trainees.sessions_count', 'Number of Sessions')} *
              </label>
              <input
                type="number"
                name="sessionsCount"
                value={formData.sessionsCount}
                onChange={handleChange}
                placeholder="Ex: 12"
                className="w-full px-4 py-2 bg-gray-900 text-white rounded border border-blue-500/50 focus:border-blue-500 outline-none transition"
                min="1"
              />
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-4 mt-8 justify-end">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded font-semibold transition-colors"
          disabled={loading}
        >
          {t('common.cancel')}
        </button>
        <button
          type="submit"
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-semibold transition-colors disabled:opacity-50"
          disabled={loading}
        >
          {loading ? t('common.saving') : t('common.save')}
        </button>
      </div>
    </form>
  );
};

export default SubscriptionForm;