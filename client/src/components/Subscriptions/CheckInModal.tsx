import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../store';
import { checkInTrainee } from '../../slices/subscriptionSlice'; // ✅ استدعاء الاكشن من هنا
import useMessage from '../../utils/useMessageHook';

interface CheckInModalProps {
    traineeId: string;
    traineeName: string;
    onClose: () => void;
    onSuccess?: () => void;
}

const CheckInModal: React.FC<CheckInModalProps> = ({
    traineeId,
    traineeName,
    onClose,
    onSuccess,
}) => {
    const { t } = useTranslation();
    const dispatch = useDispatch<AppDispatch>();
    const { success: showSuccess, error: showError } = useMessage();
    const [loading, setLoading] = useState(false);

    const handleCheckIn = async () => {
        setLoading(true);
        try {
            // ✅ استخدام Redux Action بدل الـ fetch اليدوي
            const result = await dispatch(checkInTrainee(traineeId)).unwrap();

            // رسالة النجاح
            showSuccess(result.message || t('trainees.check_in_success'));

            // لو الباك إند رجع تحذيرات (زي: اشتراك قرب يخلص) نعرضها
            if (result.alerts && result.alerts.length > 0) {
                // ممكن تعرضها في Toast منفصل أو تنبيه
                result.alerts.forEach((alert: string) => showError(alert));
            }

            if (onSuccess) onSuccess();
            onClose();

        } catch (error: any) {
            // التعامل مع الأخطاء
            showError(error || t('common.error'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
            <div className="bg-gray-800 rounded-2xl p-6 w-full max-w-sm border border-gray-700 shadow-2xl transform transition-all scale-100">

                {/* Icon Header */}
                <div className="flex justify-center mb-4">
                    <div className="bg-green-500/20 p-4 rounded-full border border-green-500/30">
                        <span className="text-3xl">📍</span>
                    </div>
                </div>

                <h2 className="text-xl font-bold text-white text-center mb-2">
                    {t('trainees.check_in')}
                </h2>

                <p className="text-gray-400 text-center mb-6 text-sm">
                    {t('trainees.check_in_message', { name: traineeName })}
                </p>

                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        disabled={loading}
                        className="flex-1 px-4 py-2.5 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-semibold transition-colors text-sm"
                    >
                        {t('common.cancel')}
                    </button>

                    <button
                        onClick={handleCheckIn}
                        disabled={loading}
                        className="flex-1 px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm flex justify-center items-center gap-2"
                    >
                        {loading ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                {t('common.processing')}
                            </>
                        ) : (
                            <>
                                {t('trainees.confirm_check_in', 'Confirm')}
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CheckInModal;