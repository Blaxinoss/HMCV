import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { addTrainer, updateTrainer } from '../../slices/trainersSlice';
import { AppDispatch, RootState } from '../../store';
import { Trainer } from '../../types';
import useMessage from '../../utils/useMessageHook';
import toast from 'react-hot-toast';
import { User, Phone, DollarSign, TrendingDown, Save, X } from 'lucide-react';

interface TrainersFormProps {
  trainer?: Trainer | null;
  onSuccess: () => void;
  onCancel: () => void;
}

const TrainersForm: React.FC<TrainersFormProps> = ({ trainer, onSuccess, onCancel }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const { loading } = useSelector((state: RootState) => state.trainers);
  const { success: showSuccess, error: showError } = useMessage();

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    salary: 0,
    raise: 0,
  });

  useEffect(() => {
    if (trainer) {
      setFormData({
        name: trainer.name,
        phone: trainer.phone.toString(),
        salary: trainer.salary,
        raise: trainer.raise || 0,
      });
    }
  }, [trainer]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'salary' || name === 'raise' ? parseFloat(value) || 0 : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.phone || !formData.salary) {
      toast.error(t('trainers.validation_error', 'Please fill all required fields'));
      return;
    }

    try {
      const payload = {
        ...formData,
        phone: parseInt(formData.phone),
      };

      if (trainer) {
        await dispatch(updateTrainer({ id: trainer._id, data: payload })).unwrap();
        showSuccess(t('trainers.update_success', 'Trainer updated successfully'));
      } else {
        await dispatch(addTrainer(payload)).unwrap();
        showSuccess(t('trainers.add_success', 'Trainer added successfully'));
      }
      onSuccess();
    } catch (err: any) {
      showError(err || t('common.error'));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

        {/* Personal Details */}
        <div className="space-y-6">
          <h3 className="text-lg font-bold text-gray-300 border-b border-gray-700 pb-2 mb-4">
            Staff Details
          </h3>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-400 flex items-center gap-2">
              <User className="w-4 h-4" /> {t('trainers.name')} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-gray-800 rounded-xl border border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all text-white placeholder-gray-600"
              placeholder="e.g. Captain Ali"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-400 flex items-center gap-2">
              <Phone className="w-4 h-4" /> {t('trainers.phone')} <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-gray-800 rounded-xl border border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all text-white placeholder-gray-600"
              placeholder="01xxxxxxxxx"
              required
            />
          </div>
        </div>

        {/* Financial Details */}
        <div className="space-y-6">
          <h3 className="text-lg font-bold text-gray-300 border-b border-gray-700 pb-2 mb-4">
            Payroll Information
          </h3>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-400 flex items-center gap-2">
              <DollarSign className="w-4 h-4" /> {t('trainers.salary')} <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="salary"
              value={formData.salary}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-gray-800 rounded-xl border border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all text-white font-mono text-lg"
              min="0"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-400 flex items-center gap-2">
              <TrendingDown className="w-4 h-4" /> {t('trainers.deduction', 'Deduction / Raise')}
            </label>
            <input
              type="number"
              name="raise"
              value={formData.raise}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-gray-800 rounded-xl border border-gray-700 focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none transition-all text-white font-mono"
              min="0"
            />
            <p className="text-xs text-gray-500">Positive value subtracts from salary.</p>
          </div>
        </div>
      </div>

      {/* Net Salary Calculation Box */}
      <div className="mt-8 bg-gray-800/50 border border-gray-700 p-6 rounded-2xl flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="text-center md:text-left">
          <span className="text-gray-400 text-sm uppercase font-bold tracking-wider block">Estimated Net Salary</span>
          <span className="text-xs text-gray-500">Base Salary - Deduction</span>
        </div>
        <div className="text-3xl font-mono font-bold text-green-400">
          ${Math.max(0, formData.salary - formData.raise).toLocaleString()}
        </div>
      </div>

      {/* Buttons */}
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
          <Save className="w-5 h-5" />
          {loading ? t('common.saving') : t('common.save')}
        </button>
      </div>
    </form>
  );
};

export default TrainersForm;