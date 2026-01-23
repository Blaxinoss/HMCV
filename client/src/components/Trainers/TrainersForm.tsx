import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { addTrainer, updateTrainer } from '../../slices/trainersSlice';
import { AppDispatch, RootState } from '../../store';
import { Trainer } from '../../types';
import useMessage from '../../utils/useMessageHook';
import toast from 'react-hot-toast';

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
        phone: trainer.phone.toString(), // Convert number to string for input
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
        phone: parseInt(formData.phone), // Ensure it's sent as number
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
    <form onSubmit={handleSubmit} className="bg-gray-800 rounded-xl p-8 border border-gray-700  mx-auto shadow-2xl">
      <h2 className="text-2xl font-bold mb-6 text-white border-b border-gray-700 pb-4">
        {trainer ? t('trainers.edit_trainer') : t('trainers.add_new_trainer')}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Name */}
        <div className="md:col-span-2">
          <label className="block text-sm font-semibold text-gray-300 mb-2">
            {t('trainers.name')} *
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition"
            placeholder="Ex: Captain Ali"
            required
          />
        </div>

        {/* Phone */}
        <div>
          <label className="block text-sm font-semibold text-gray-300 mb-2">
            {t('trainers.phone')} *
          </label>
          <input
            type="number"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg text-white focus:border-blue-500 outline-none transition"
            placeholder="01xxxxxxxxx"
            required
          />
        </div>

        {/* Salary */}
        <div>
          <label className="block text-sm font-semibold text-gray-300 mb-2">
            {t('trainers.salary')} *
          </label>
          <div className="relative">
            <span className="absolute left-3 top-3 text-gray-500">$</span>
            <input
              type="number"
              name="salary"
              value={formData.salary}
              onChange={handleChange}
              className="w-full pl-8 pr-4 py-3 bg-gray-900 border border-gray-600 rounded-lg text-white focus:border-green-500 outline-none transition"
              min="0"
              required
            />
          </div>
        </div>

        {/* Raise / Deduction */}
        <div>
          <label className="block text-sm font-semibold text-gray-300 mb-2">
            {t('trainers.deduction', 'Deduction / Raise')}
          </label>
          <div className="relative">
            <span className="absolute left-3 top-3 text-gray-500">-</span>
            <input
              type="number"
              name="raise"
              value={formData.raise}
              onChange={handleChange}
              className="w-full pl-8 pr-4 py-3 bg-gray-900 border border-gray-600 rounded-lg text-white focus:border-red-500 outline-none transition"
              min="0"
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">
            * This amount will be subtracted from salary
          </p>
        </div>

        {/* Net Salary Preview */}
        <div className="md:col-span-2 bg-gray-700/30 p-4 rounded-lg flex justify-between items-center border border-gray-700">
          <span className="text-gray-400">Estimated Net Salary:</span>
          <span className="text-xl font-bold text-green-400">
            ${Math.max(0, formData.salary - formData.raise)}
          </span>
        </div>

      </div>

      <div className="flex gap-4 mt-8 justify-end">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-semibold transition-colors"
          disabled={loading}
        >
          {t('common.cancel')}
        </button>
        <button
          type="submit"
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50"
          disabled={loading}
        >
          {loading ? t('common.saving') : t('common.save')}
        </button>
      </div>
    </form>
  );
};

export default TrainersForm;