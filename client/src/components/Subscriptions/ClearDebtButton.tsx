import React, { useState } from 'react';
import { CheckCircle, Loader2 } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { patchTrainee } from '../../slices/subscriptionSlice';
import { AppDispatch } from '../../store';
import toast from 'react-hot-toast';
import { Trainee } from '../../types';
import { useConfirmToast } from '../toasters/deleteToaster';

interface ClearDebtButtonProps {
    trainee: Trainee;
}

const ClearDebtButton: React.FC<ClearDebtButtonProps> = ({ trainee }) => {
    const [loading, setLoading] = useState(false);
    const dispatch = useDispatch<AppDispatch>();

    // بنستخدم الهوك بتاع التوستر
    const { showConfirm } = useConfirmToast();

    if (trainee.remaining <= 0) return null;

    const handleClearDebt = (e: React.MouseEvent) => {
        e.stopPropagation(); // منع فتح كارت التفاصيل

        // 🔥 هنا الإجابة على سؤالك: بنديها دالة async فيها اللوجيك كله
        showConfirm(trainee._id, async () => {
            setLoading(true);
            try {
                // 1. الحسابات (بتتعمل بس لما يوافق)
                let discount = trainee.discount || 0;

                if (trainee.appliedDiscount?.hasCustomDiscount) {
                    if (trainee.appliedDiscount.discountType === 'percentage') {
                        discount = (trainee.totalCost * trainee.appliedDiscount.discountValue) / 100;
                    } else {
                        discount = trainee.appliedDiscount.discountValue;
                    }
                }

                const netTotal = trainee.totalCost - discount;

                await dispatch(patchTrainee({
                    id: trainee._id,
                    data: { paid: netTotal }
                })).unwrap();

                toast.success("Debt Cleared Successfully! 💸");

                // ملحوظة: لو الـ Slice بيحدث الـ State أوتوماتيك مش محتاج fetchTrainees
                // dispatch(fetchTrainees(...)); 

            } catch (error: any) {
                toast.error(error || "Failed to clear debt");
            } finally {
                setLoading(false);
            }
        });
    };

    return (
        <button
            onClick={handleClearDebt}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-green-500/10 hover:bg-green-500 text-green-500 hover:text-white border border-green-500/20 rounded-lg text-xs font-bold transition-all disabled:opacity-50"
            title={`Pay remaining ${trainee.remaining} EGP`}
        >
            {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle className="w-3 h-3" />}
            PAY FULL ({trainee.remaining})
        </button>
    );
};

export default ClearDebtButton;