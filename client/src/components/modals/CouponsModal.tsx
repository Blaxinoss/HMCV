import React, { useEffect, useState } from 'react';
import { X, Ticket, Calendar, Trash2, Plus, Percent, DollarSign, Loader2 } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next'; // Import added
import { AppDispatch, RootState } from '../../store';
import { addCoupon, deleteCoupon, fetchCoupons } from '../../slices/couponSlice';

interface CouponsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const CouponsModal: React.FC<CouponsModalProps> = ({ isOpen, onClose }) => {
    const dispatch = useDispatch<AppDispatch>();
    const { t } = useTranslation(); // Hook initialization

    // 1. Redux State
    const { coupons, loading } = useSelector((state: RootState) => state.coupons);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // 2. Form State
    const [formData, setFormData] = useState({
        code: '',
        discountType: 'PERCENTAGE' as 'PERCENTAGE' | 'FIXED',
        value: '',
        expiryDate: ''
    });

    // 3. Fetch Coupons on Open
    useEffect(() => {
        if (isOpen) {
            dispatch(fetchCoupons());
        }
    }, [isOpen, dispatch]);

    if (!isOpen) return null;

    // 4. Handlers
    const handleAddCoupon = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        if (!formData.code || !formData.value || !formData.expiryDate) {
            toast.error(t('coupons.toast.fill_all'));
            return;
        }

        setIsSubmitting(true);

        try {
            // Prepare Payload
            const payload = {
                code: formData.code,
                discountType: formData.discountType,
                value: Number(formData.value),
                expiryDate: formData.expiryDate,
                usageLimit: null
            };

            await dispatch(addCoupon(payload)).unwrap();

            toast.success(t('coupons.toast.created'));

            // Reset Form
            setFormData({ code: '', discountType: 'PERCENTAGE', value: '', expiryDate: '' });

        } catch (err: any) {
            toast.error(err || t('coupons.toast.create_failed'));
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm(t('coupons.toast.delete_confirm'))) return;

        try {
            await dispatch(deleteCoupon(id)).unwrap();
            toast.success(t('coupons.toast.deleted'));
        } catch (err: any) {
            toast.error(t('coupons.toast.delete_failed'));
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            {/* Modal Container */}
            <div className="bg-gray-900 w-full max-w-lg rounded-2xl border border-gray-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-800 flex justify-between items-center bg-gray-900/50">
                    <div className="flex items-center gap-2 text-white font-bold text-lg">
                        <Ticket className="w-5 h-5 text-purple-500" />
                        {t('coupons.modal.title')}
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Scrollable Body */}
                <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">

                    {/* --- SECTION 1: CREATE FORM --- */}
                    <form onSubmit={handleAddCoupon} className="space-y-4">

                        {/* Coupon Code */}
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">
                                {t('coupons.modal.code_label')}
                            </label>
                            <div className="relative">
                                <Ticket className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                <input
                                    type="text"
                                    placeholder={t('coupons.modal.code_placeholder')}
                                    value={formData.code}
                                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                    className="w-full pl-10 pr-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-600 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none uppercase font-bold tracking-wide"
                                    disabled={isSubmitting}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            {/* Type Selection */}
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">
                                    {t('coupons.modal.type_label')}
                                </label>
                                <div className="flex bg-gray-800 p-1 rounded-xl border border-gray-700">
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, discountType: 'PERCENTAGE' })}
                                        className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs font-bold transition-all ${formData.discountType === 'PERCENTAGE' ? 'bg-purple-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'
                                            }`}
                                    >
                                        <Percent className="w-3 h-3" /> %
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, discountType: 'FIXED' })}
                                        className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs font-bold transition-all ${formData.discountType === 'FIXED' ? 'bg-purple-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'
                                            }`}
                                    >
                                        <DollarSign className="w-3 h-3" /> {t('coupons.modal.fixed')}
                                    </button>
                                </div>
                            </div>

                            {/* Value Input */}
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">
                                    {t('coupons.modal.value_label')}
                                </label>
                                <input
                                    type="number"
                                    placeholder={formData.discountType === 'PERCENTAGE'
                                        ? t('coupons.modal.value_placeholder_percent')
                                        : t('coupons.modal.value_placeholder_fixed')
                                    }
                                    value={formData.value}
                                    onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-600 focus:border-purple-500 outline-none font-mono"
                                    disabled={isSubmitting}
                                />
                            </div>
                        </div>

                        {/* Expiry Date */}
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">
                                {t('coupons.modal.expiry_label')}
                            </label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                <input
                                    type="date"
                                    value={formData.expiryDate}
                                    onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                                    className="w-full pl-10 pr-4 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-white focus:border-purple-500 outline-none [color-scheme:dark]"
                                    disabled={isSubmitting}
                                />
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-600/50 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-purple-900/20 active:scale-95 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    <Plus className="w-5 h-5" /> {t('coupons.modal.create_btn')}
                                </>
                            )}
                        </button>
                    </form>


                    {/* --- SECTION 2: ACTIVE LIST --- */}
                    <div className="space-y-3">
                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                            {t('coupons.modal.active_title')} <span className="bg-gray-800 text-gray-300 px-2 py-0.5 rounded-full text-xs">{coupons.length}</span>
                        </h3>

                        {loading ? (
                            <div className="flex justify-center py-8">
                                <Loader2 className="w-6 h-6 animate-spin text-purple-500" />
                            </div>
                        ) : coupons.length === 0 ? (
                            <div className="text-center py-8 bg-gray-800/30 rounded-xl border border-dashed border-gray-700">
                                <Ticket className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                                <p className="text-gray-500 text-sm">{t('coupons.modal.empty_state')}</p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {coupons.map((coupon) => (
                                    <div key={coupon._id} className="group flex items-center justify-between p-3 bg-gray-800/50 hover:bg-gray-800 border border-gray-700/50 hover:border-gray-600 rounded-xl transition-all">

                                        {/* Left Info */}
                                        <div className="flex items-center gap-3">
                                            <div className="bg-purple-500/10 p-2 rounded-lg text-purple-400">
                                                <Ticket className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <p className="text-white font-bold text-sm tracking-wide">{coupon.code}</p>
                                                <p className="text-xs text-gray-500 flex items-center gap-1">
                                                    {t('coupons.modal.expires')}: {new Date(coupon.expiryDate).toLocaleDateString()}
                                                    {new Date() > new Date(coupon.expiryDate) && (
                                                        <span className="text-red-400 font-bold ml-1">{t('coupons.modal.expired_tag')}</span>
                                                    )}
                                                </p>
                                                <p className="text-xs text-gray-500 flex items-center gap-1">
                                                    {coupon.usedCount} used out of {coupon.usageLimit}</p>
                                            </div>
                                        </div>

                                        {/* Right Info & Action */}
                                        <div className="flex items-center gap-4">
                                            <span className="text-sm font-mono font-bold text-green-400 bg-green-400/10 px-2 py-1 rounded-md border border-green-400/20">
                                                {coupon.discountType === 'PERCENTAGE' ? `-${coupon.value}%` : `-${coupon.value} EGP`}
                                            </span>

                                            <button
                                                onClick={() => handleDelete(coupon._id)}
                                                className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                                                title={t('coupons.modal.delete_tooltip')}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};