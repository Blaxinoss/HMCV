// src/components/Trainees/RenewModal.tsx

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { renewTrainee } from '../../slices/subscriptionSlice'; // الثانك الجديد
import { AppDispatch } from '../../store';
import { X, Calendar, DollarSign, CheckCircle, Ticket } from 'lucide-react';
import toast from 'react-hot-toast';

interface RenewModalProps {
    traineeId: string;
    traineeName: string;
    isSession: boolean; // عشان نعرف نظهر خانة الحصص ولا لأ
    onClose: () => void;
}

const RenewModal: React.FC<RenewModalProps> = ({ traineeId, traineeName, isSession, onClose }) => {
    const { t } = useTranslation();
    const dispatch = useDispatch<AppDispatch>();
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        durationMonths: 1, // اليوزر بيختار شهور، واحنا هنحولها أيام
        totalCost: 0,
        amountPaid: 0,
        sessionsCount: isSession ? 12 : 0, // لو نظام حصص
        couponCode: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        // تحويل الشهور لأيام عشان الباك إند
        const durationInDays = formData.durationMonths * 30;

        try {
            await dispatch(renewTrainee({
                id: traineeId,
                data: {
                    durationInDays: durationInDays,
                    totalCost: formData.totalCost,
                    paid: formData.amountPaid,
                    couponCode: formData.couponCode,
                    sessionsCount: isSession ? formData.sessionsCount : undefined
                }
            })).unwrap(); // unwrap عشان لو في ايرور (زي الديون) يروح للـ catch

            toast.success(t('trainees.renew_success', 'Renewed Successfully!'));
            onClose();
        } catch (error: any) {
            // هنا هيظهر الايرور بتاع الباك إند (مثلاً: عليه ديون)
            toast.error(error || t('common.error'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="bg-gray-900 w-full max-w-md rounded-2xl border border-gray-800">

                {/* Header */}
                <div className="p-6 border-b border-gray-800 flex justify-between">
                    <h2 className="text-xl font-bold text-white">Renew Subscription</h2>
                    <button onClick={onClose}><X className="text-gray-400 hover:text-white" /></button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5">

                    {/* Duration */}
                    <div>
                        <label className="text-xs text-gray-400 block mb-2">Duration</label>
                        <div className="grid grid-cols-4 gap-2">
                            {[1, 3, 6, 12].map(m => (
                                <button
                                    key={m}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, durationMonths: m })}
                                    className={`py-2 rounded-lg text-sm font-bold border ${formData.durationMonths === m
                                            ? 'bg-blue-600 border-blue-500 text-white'
                                            : 'bg-gray-800 border-gray-700 text-gray-400'
                                        }`}
                                >
                                    {m} Mo
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Sessions Count (Only if Session Based) */}
                    {isSession && (
                        <div>
                            <label className="text-xs text-gray-400 block mb-1">Sessions Count</label>
                            <div className="relative">
                                <Ticket className="absolute left-3 top-3 w-4 h-4 text-purple-500" />
                                <input
                                    type="number"
                                    value={formData.sessionsCount}
                                    onChange={(e) => setFormData({ ...formData, sessionsCount: parseInt(e.target.value) })}
                                    className="w-full bg-gray-950 border border-gray-700 rounded-xl py-2.5 pl-10 text-white"
                                />
                            </div>
                        </div>
                    )}

                    {/* Money Inputs */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs text-gray-400 block mb-1">Total Cost</label>
                            <div className="relative">
                                <DollarSign className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
                                <input
                                    type="number"
                                    value={formData.totalCost || ''}
                                    onChange={(e) => setFormData({ ...formData, totalCost: parseFloat(e.target.value) })}
                                    className="w-full bg-gray-950 border border-gray-700 rounded-xl py-2.5 pl-10 text-white"
                                    placeholder="0.00"
                                    required
                                />
                            </div>
                        </div>
                        <div>
                            <label className="text-xs text-gray-400 block mb-1">Paid Now</label>
                            <div className="relative">
                                <DollarSign className="absolute left-3 top-3 w-4 h-4 text-green-500" />
                                <input
                                    type="number"
                                    value={formData.amountPaid || ''}
                                    onChange={(e) => setFormData({ ...formData, amountPaid: parseFloat(e.target.value) })}
                                    className="w-full bg-gray-950 border border-gray-700 rounded-xl py-2.5 pl-10 text-white"
                                    placeholder="0.00"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Coupon */}
                    <div>
                        <input
                            type="text"
                            placeholder="Coupon Code (Optional)"
                            value={formData.couponCode}
                            onChange={(e) => setFormData({ ...formData, couponCode: e.target.value })}
                            className="w-full bg-gray-950 border border-gray-700 rounded-xl py-2.5 px-4 text-white text-sm"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 bg-green-600 hover:bg-green-500 text-white rounded-xl font-bold transition-all flex justify-center items-center gap-2"
                    >
                        {loading ? 'Processing...' : <> <CheckCircle className="w-5 h-5" /> Confirm Renewal </>}
                    </button>

                </form>
            </div>
        </div>
    );
};

export default RenewModal;