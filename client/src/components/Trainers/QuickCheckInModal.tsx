import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store';
import { checkInTrainee } from '../../slices/subscriptionSlice';
import useMessage from '../../utils/useMessageHook';

interface QuickCheckInModalProps {
  onClose: () => void;
}

const QuickCheckInModal: React.FC<QuickCheckInModalProps> = ({ onClose }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const { trainees } = useSelector((state: RootState) => state.trainees);
  const { success: showSuccess, error: showError } = useMessage();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTrainee, setSelectedTrainee] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    if (!term) {
      setSelectedTrainee(null);
      return;
    }

    // بندور برقم العضوية أو الاسم أو التليفون
    const found = trainees.find(t =>
      t.memberId.toString() === term ||
      t.phone.includes(term) ||
      t.name.toLowerCase().includes(term.toLowerCase())
    );

    setSelectedTrainee(found || null);
  };

  const handleConfirm = async () => {
    if (!selectedTrainee) return;

    setLoading(true);
    try {
      const result = await dispatch(checkInTrainee(selectedTrainee._id)).unwrap();
      showSuccess(result.message || t('trainees.check_in_success'));
      if (result.alerts && result.alerts.length > 0) {
        result.alerts.forEach((alert: string) => showError(alert));
      }
      onClose();
    } catch (error: any) {
      showError(error || t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-gray-800 rounded-2xl p-6 w-full max-w-md border border-gray-700 shadow-2xl">

        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            ⚡ {t('trainees.quick_check_in', 'Quick Check-in')}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">✕</button>
        </div>

        {/* Search Input */}
        <div className="mb-6">
          <label className="block text-sm text-gray-400 mb-2">
            {t('trainees.search_placeholder', 'Enter Member ID, Phone, or Name')}
          </label>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Ex: 101"
            className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-lg tracking-wide"
            autoFocus
          />
        </div>

        {/* Result Area */}
        {searchTerm && (
          <div className="mb-6 min-h-[100px] flex items-center justify-center bg-gray-700/30 rounded-lg border border-gray-700 border-dashed">
            {selectedTrainee ? (
              <div className="text-center w-full p-4">
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-2xl font-bold text-white mx-auto mb-3 shadow-lg">
                  {selectedTrainee.name.charAt(0).toUpperCase()}
                </div>
                <h3 className="text-xl font-bold text-white">{selectedTrainee.name}</h3>
                <p className="text-gray-400 font-mono">ID: #{selectedTrainee.memberId}</p>

                {/* حالة الاشتراك */}
                <div className="mt-2">
                  {selectedTrainee.remaining > 0 && <span className="text-red-400 text-xs bg-red-900/30 px-2 py-1 rounded mx-1">Debt</span>}
                  {selectedTrainee.accountFreezeStatus && <span className="text-yellow-400 text-xs bg-yellow-900/30 px-2 py-1 rounded mx-1">Frozen</span>}
                  {new Date(selectedTrainee.subscriptionEndDate) < new Date() && <span className="text-red-400 text-xs bg-red-900/30 px-2 py-1 rounded mx-1">Expired</span>}
                </div>
              </div>
            ) : (
              <p className="text-gray-500">🚫 {t('trainees.not_found', 'User not found')}</p>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-semibold">
            {t('common.cancel')}
          </button>
          <button
            onClick={handleConfirm}
            disabled={!selectedTrainee || loading}
            className="flex-1 px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-green-500/20"
          >
            {loading ? t('common.processing') : t('trainees.confirm_check_in')}
          </button>
        </div>

      </div>
    </div>
  );
};

export default QuickCheckInModal;