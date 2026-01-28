// src/components/Trainees/SubscriptionForm.tsx

import React, { FormEvent, useEffect, useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { addTrainee, updateTrainee } from '../../slices/subscriptionSlice';
import { AppDispatch, RootState } from '../../store';
import { Trainee, Coupon } from '../../types';
import useMessage from '../../utils/useMessageHook';
import toast from 'react-hot-toast';
import api from '../../utils/api';
import {
  User,
  Phone,
  Calendar,
  DollarSign,
  CreditCard,
  Ticket,
  Layers,
  CheckCircle,
  AlertCircle,
  Save,
  X,
  Dumbbell
} from 'lucide-react';

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

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    subscriptionStartDate: new Date().toISOString().split('T')[0],
    subscriptionEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    totalCost: 0,
    paid: 0,
    couponCode: '',
    program: '',
    hasCustomDiscount: false,
    discountValue: 0,
    discountType: "FIXED",
    isSession: false,
    sessionsCount: 0,
  });

  const [couponLoading, setCouponLoading] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);

  useEffect(() => {
    if (trainee) {
      setFormData({
        name: trainee.name,
        phone: trainee.phone,
        subscriptionStartDate: new Date(trainee.subscriptionStartDate).toISOString().split('T')[0],
        subscriptionEndDate: new Date(trainee.subscriptionEndDate).toISOString().split('T')[0],
        totalCost: trainee.totalCost,
        paid: trainee.paid,
        program: trainee.program,
        couponCode: trainee.usedCoupon || "",
        hasCustomDiscount: trainee.appliedDiscount?.hasCustomDiscount || false,
        discountValue: 0,
        discountType: "FIXED",
        isSession: trainee.isSession,
        sessionsCount: (trainee as any).sessionsRemaining || 0,
      });

      if (trainee.appliedDiscount && (trainee.appliedDiscount.discountValue > 0 || trainee.usedCoupon)) {
        setAppliedCoupon({
          _id: 'saved_from_history',
          code: trainee.usedCoupon || 'Custom Discount',
          discountType: (trainee.appliedDiscount.discountType?.toUpperCase() || 'FIXED') as 'PERCENTAGE' | 'FIXED',
          value: trainee.appliedDiscount.discountValue,
          expiryDate: new Date(),
          isActive: true,
          usageLimit: 0,
          usedCount: 0,
          createdAt: new Date(),
          updatedAt: new Date()

        } satisfies Coupon);
      }
    }
  }, [trainee]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === 'checkbox'
          ? (e.target as HTMLInputElement).checked
          : ['totalCost', 'paid', 'sessionsCount'].includes(name)
            ? parseFloat(value) || 0
            : value,
    }));
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setFormData(prev => ({ ...prev, couponCode: '' }));
    toast.success("Coupon removed");
  };

  const handlePayFull = () => {
    setFormData(prev => ({ ...prev, paid: financialSummary.netTotal }));
  };

  const handleValidateCoupon = async () => {
    if (!formData.couponCode) return;
    setCouponLoading(true);
    try {
      const response = await api.post('/marketing/validate-coupon', {
        code: formData.couponCode
      });

      if (response.data.success) {
        const couponData = response.data.data;
        setAppliedCoupon(couponData);
        toast.success(t('trainees.coupon_applied') || "Coupon Applied!");
      }
    } catch (error: any) {
      setAppliedCoupon(null);
      toast.error(error.response?.data?.message || t('trainees.invalid_coupon'));
    } finally {
      setCouponLoading(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.phone || !formData.totalCost) {
      toast.error(t('trainees.fill_required_fields'), {
        style: { borderRadius: '10px', background: '#333', color: '#fff' },
      });
      return;
    }

    if (formData.isSession && formData.sessionsCount <= 0) {
      toast.error(t('trainees.sessions_count_required', 'Please enter number of sessions'), {
        style: { borderRadius: '10px', background: '#333', color: '#fff' },
      });
      return;
    }

    if (financialSummary.isOverpaid) {
      toast.error(`Payment exceeds total cost! You are overpaying by ${Math.abs(financialSummary.rawRemaining)} EGP`);
      return;
    }

    try {
      const payload = {
        ...formData,
        couponCode: appliedCoupon ? formData.couponCode : ""
      };

      if (trainee) {
        await dispatch(updateTrainee({ id: trainee._id, data: payload as any })).unwrap();
        toast.success(t('TraineeUpdated') || "Member Updated");
      } else {
        await dispatch(addTrainee(payload as any)).unwrap();
        toast.success(t('TraineeAdded') || "Member Added");
      }
      onSuccess();
    } catch (error) {
      toast.error(t('trainees.operation_failed'));
    }
  };

  // Real-time calculation for display
  const financialSummary = useMemo(() => {
    const original = formData.totalCost;
    let discount = 0;


    if (appliedCoupon) {
      if (appliedCoupon.discountType?.toLowerCase() === 'percentage') {
        discount = (original * appliedCoupon.value) / 100;
      } else {
        discount = appliedCoupon.value;
      }
    }

    const netTotal = Math.max(0, original - discount);
    const rawRemaining = netTotal - formData.paid;
    const isOverpaid = rawRemaining < 0;
    const remaining = Math.max(0, rawRemaining);
    return { discount, netTotal, remaining, isOverpaid, rawRemaining };
  }, [formData.totalCost, formData.paid, appliedCoupon]);
  return (
    <form onSubmit={handleSubmit} className="w-full text-left">

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

        {/* === COLUMN 1: Personal & Dates === */}
        <div className="space-y-6">
          <h3 className="text-lg font-bold text-gray-300 border-b border-gray-700 pb-2 mb-4">
            {t('subscription.personal_info_section')}
          </h3>

          {/* Name */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-400 flex items-center gap-2">
              <User className="w-4 h-4" /> {t('trainees.name')} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-gray-800 rounded-xl border border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all text-white placeholder-gray-600"
              disabled={loading}
              required
              placeholder={t('subscription.name_placeholder')}
            />
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-400 flex items-center gap-2">
              <Phone className="w-4 h-4" /> {t('trainees.phone')} <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-gray-800 rounded-xl border border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all text-white placeholder-gray-600 font-mono"
              disabled={loading}
              required
              placeholder={t('subscription.phone_placeholder')}
            />
          </div>

          {/* Dates Row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-400 flex items-center gap-2">
                <Calendar className="w-4 h-4" /> {t('trainees.start_date')}
              </label>
              <input
                type="date"
                name="subscriptionStartDate"
                value={formData.subscriptionStartDate}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-800 rounded-xl border border-gray-700 focus:border-blue-500 outline-none transition-all text-white text-sm"
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-400 flex items-center gap-2">
                <Calendar className="w-4 h-4" /> {t('trainees.end_date')}
              </label>
              <input
                type="date"
                name="subscriptionEndDate"
                value={formData.subscriptionEndDate}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-800 rounded-xl border border-gray-700 focus:border-blue-500 outline-none transition-all text-white text-sm"
                disabled={loading}
              />
            </div>
          </div>
        </div>

        {/* === COLUMN 2: Financials & Plan === */}
        <div className="space-y-6">
          <h3 className="text-lg font-bold text-gray-300 border-b border-gray-700 pb-2 mb-4">
            {t('subscription.financials_section')}
          </h3>

          {/* Total Cost */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-400 flex items-center gap-2">
              <DollarSign className="w-4 h-4" /> {t('trainees.total_cost')} <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="totalCost"
              value={formData.totalCost}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-gray-800 rounded-xl border border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all text-white font-mono text-lg"
              disabled={loading}
              min="0"
              step="0.01"
              required
            />
          </div>

          {/* Paid & Coupon Row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-400 flex items-center gap-2">
                <CreditCard className="w-4 h-4" /> {t('trainees.paid')}
              </label>
              <input
                type="number"
                name="paid"
                value={formData.paid}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-800 rounded-xl border border-gray-700 focus:border-blue-500 outline-none transition-all text-white font-mono"
                disabled={loading}
                min="0"
                step="0.01"
              />
            </div>

            {/* Coupon Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-400 flex items-center gap-2">
                <Ticket className="w-4 h-4" /> {t('trainees.coupon_code')}
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="couponCode"
                  value={formData.couponCode}
                  onChange={(e) => {
                    setFormData({ ...formData, couponCode: e.target.value });
                    setAppliedCoupon(null);
                  }}
                  className="w-full pl-4 pr-12 py-3 bg-gray-800 rounded-xl border border-gray-700 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all text-white uppercase placeholder-gray-600"
                  placeholder={t('subscription.coupon_code_placeholder')}
                />
                <button
                  type="button"
                  onClick={handleValidateCoupon}
                  disabled={couponLoading || !formData.couponCode}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-bold bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 text-white px-3 py-1.5 rounded-lg transition-colors"
                >
                  {couponLoading ? '...' : t('common.apply')}
                </button>
              </div>
            </div>
          </div>

          {/* Plan Type Selection */}
          <div className="p-4 bg-gray-800/50 border border-gray-700 rounded-xl">
            <label className="flex items-center justify-between cursor-pointer group">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg transition-colors ${formData.isSession ? 'bg-blue-500/20 text-blue-400' : 'bg-gray-700 text-gray-400'}`}>
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <span className="block font-medium text-white">{t('trainees.is_session', 'Session Based Plan')}</span>
                  <span className="text-xs text-gray-400">{t('subscription.session_based_hint')}</span>
                </div>
              </div>
              <div className="relative">
                <input
                  type="checkbox"
                  name="isSession"
                  checked={formData.isSession}
                  onChange={handleChange}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </div>
            </label>

            {/* Collapsible Session Count Input */}
            <div className={`grid transition-all duration-300 ease-in-out ${formData.isSession ? 'grid-rows-[1fr] opacity-100 mt-4 pt-4 border-t border-gray-700' : 'grid-rows-[0fr] opacity-0'}`}>
              <div className="overflow-hidden">
                <label className="block text-sm font-semibold text-blue-300 mb-2">
                  {t('trainees.sessions_count', 'Number of Sessions')} <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="sessionsCount"
                  value={formData.sessionsCount}
                  onChange={handleChange}
                  placeholder="e.g. 12"
                  className="w-full px-4 py-2 bg-gray-900 text-white rounded-lg border border-blue-500/30 focus:border-blue-500 outline-none"
                  min={formData.isSession ? 1 : 0}
                />
              </div>
            </div>
          </div>

        </div>

        <div className="col-span-full space-y-2">
          <label className="text-sm font-medium text-gray-400 flex items-center gap-2">
            <Dumbbell className="w-4 h-4" />
            {t('trainees.program_label', 'Workout Program')}
            <span className="text-gray-500 text-xs font-normal">
              ({t('common.optional', 'Optional')})
            </span>
          </label>

          <textarea
            name="program"
            value={formData.program}
            onChange={handleChange} // تأكد إن الـ Type متظبط زي ما اتفقنا فوق
            rows={4}
            placeholder={t('trainees.program_placeholder', 'e.g.\nDay 1: Chest & Triceps\nDay 2: Back & Biceps...')}
            className="w-full px-4 py-3 bg-gray-800 rounded-xl border border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all text-white placeholder-gray-600 resize-y min-h-[100px]"
          />
        </div>

      </div>

      {/* === FOOTER: Financial Summary === */}
      <div className="mt-8 bg-gray-900 border border-gray-800 rounded-2xl p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/5 blur-3xl rounded-full pointer-events-none"></div>

        <h4 className="text-gray-400 text-sm uppercase font-bold tracking-wider mb-4 flex items-center gap-2">
          <CreditCard className="w-4 h-4" /> Payment Summary
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* 1. Coupon Status */}
          <div className="flex flex-col">
            <span className="text-gray-500 text-sm">Coupon Status</span>
            {appliedCoupon ? (
              <div className="flex items-center justify-between mt-1 bg-green-500/10 border border-green-500/20 rounded-lg p-2">
                <div className="flex items-center gap-2 text-green-400 font-medium text-sm">
                  <CheckCircle className="w-4 h-4" />
                  <span>
                    {appliedCoupon.code} (-{appliedCoupon.discountType === 'PERCENTAGE' ? `${appliedCoupon.value}%` : `${appliedCoupon.value} EGP`})
                  </span>
                </div>
                {/* زرار الحذف */}
                <button
                  type="button"
                  onClick={handleRemoveCoupon}
                  className="text-green-500 hover:text-red-400 transition-colors p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <span className="text-gray-600 italic mt-1 text-sm">No coupon applied</span>
            )}
          </div>

          {/* 2. Net Total */}
          <div className="flex flex-col">
            <span className="text-gray-500 text-sm">Net Total</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className={`text-xl font-bold font-mono ${financialSummary.discount > 0 ? 'text-green-400' : 'text-white'}`}>
                {financialSummary.netTotal.toLocaleString()} EGP
              </span>
              {/* عرض السعر القديم مشطوب لو فيه خصم */}
              {financialSummary.discount > 0 && (
                <span className="text-xs text-gray-500 line-through">
                  {formData.totalCost.toLocaleString()}
                </span>
              )}
            </div>
          </div>

          {/* 3. Remaining */}
          <div className="flex flex-col">
            <div className="flex justify-between items-center">
              <span className="text-gray-500 text-sm">Remaining</span>
              {financialSummary.remaining > 0 && (
                <button
                  type="button"
                  onClick={handlePayFull}
                  className="text-[10px] bg-blue-600/20 text-blue-400 hover:bg-blue-600 hover:text-white px-2 py-0.5 rounded transition-all border border-blue-600/30"
                >
                  PAY FULL
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 mt-1">
              <span className={`text-xl font-bold font-mono ${financialSummary.remaining > 0 ? 'text-red-400' : 'text-gray-400'}`}>
                {financialSummary.remaining.toLocaleString()} EGP
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* === ACTION BUTTONS === */}
      <div className="flex gap-4 mt-8 justify-end pt-6 border-t border-gray-800">
        <button
          type="button"
          onClick={onCancel}
          className="flex items-center gap-2 px-6 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl font-semibold transition-all"
          disabled={loading}
        >
          <X className="w-5 h-5" />
          {t('common.cancel')}
        </button>
        <button
          type="submit"
          className="flex items-center gap-2 px-8 py-2.5 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white rounded-xl font-semibold shadow-lg shadow-blue-900/30 transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={loading}
        >
          {loading ? (
            <span className="flex items-center gap-2">Processing...</span>
          ) : (
            <>
              <Save className="w-5 h-5" />
              {t('common.save')}
            </>
          )}
        </button>
      </div>

    </form>
  );
};

export default SubscriptionForm;