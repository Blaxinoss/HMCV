import React, { FormEvent, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { addExpense, updateExpense } from '../../slices/expensesSlice';
import { AppDispatch, RootState } from '../../store';
import { Expense } from '../../types';
import toast from 'react-hot-toast';
import { Save, X, Calendar, DollarSign, Type, Tag } from 'lucide-react';

interface ExpenseFormProps {
  editingId: string | null;
  onSuccess: () => void;
  onCancel?: () => void; // Added onCancel prop
}

const ExpenseForm: React.FC<ExpenseFormProps> = ({ editingId, onSuccess, onCancel }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const { expenses, loading } = useSelector((state: RootState) => state.expenses);

  const [formData, setFormData] = useState<Partial<Expense>>({
    category: undefined,
    amount: 0,
    dateOfPayment: new Date().toISOString().split('T')[0],
    name: '',
    description: '',
  });

  useEffect(() => {
    if (editingId) {
      const expense = expenses.find((e) => e._id === editingId);
      if (expense) {
        // Ensure date is formatted correctly for input type="date"
        const formattedDate = new Date(expense.dateOfPayment).toISOString().split('T')[0];
        setFormData({ ...expense, dateOfPayment: formattedDate });
      }
    } else {
      // Reset form when not editing
      setFormData({
        category: undefined,
        amount: 0,
        dateOfPayment: new Date().toISOString().split('T')[0],
        name: '',
        description: '',
      });
    }
  }, [editingId, expenses]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'amount' ? parseFloat(value) || 0 : value,
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!formData.category || !formData.amount) {
      toast.error(t('expenses.fill_required_fields'), {
        style: { borderRadius: '10px', background: '#333', color: '#fff' },
      });
      return;
    }

    try {
      if (editingId) {
        dispatch(updateExpense({ id: editingId, data: formData as Expense }));
        toast.success(t('expenses.updated_successfully') || "Expense Updated");
      } else {
        dispatch(addExpense(formData as Expense));
        toast.success(t('expenses.added_successfully') || "Expense Added");
      }
      onSuccess();
    } catch (error) {
      console.error('Error:', error);
      toast.error("Operation failed");
    }
  };

  const categories = ['Rent', 'Utilities', 'Equipment', 'Marketing', 'Salaries', 'Maintenance', 'Insurance', 'Supplies', 'Other'];

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          {editingId ? <Edit2Icon className="w-5 h-5 text-blue-500" /> : <Tag className="w-5 h-5 text-green-500" />}
          {editingId ? t('expenses.edit') : t('expenses.add_new')}
        </h2>
        {onCancel && (
          <button type="button" onClick={onCancel} className="text-gray-500 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Name Input */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-400 flex items-center gap-2">
            <Type className="w-4 h-4" /> {t('expenses.name')}
          </label>
          <input
            type="text"
            name="name"
            value={formData.name || ''}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-gray-800 rounded-xl border border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all text-white placeholder-gray-600"
            disabled={loading}
            placeholder="e.g. New Treadmill"
          />
        </div>

        {/* Category Select */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-400 flex items-center gap-2">
            <Tag className="w-4 h-4" /> {t('expenses.category')} <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <select
              name="category"
              value={formData.category || ''}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-gray-800 rounded-xl border border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all text-white appearance-none cursor-pointer"
              disabled={loading}
              required
            >
              <option value="" disabled>{t('expenses.select_category')}</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            {/* Custom Arrow */}
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </div>
          </div>
        </div>

        {/* Amount Input */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-400 flex items-center gap-2">
            <DollarSign className="w-4 h-4" /> {t('expenses.amount')} <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            name="amount"
            value={formData.amount || ''}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-gray-800 rounded-xl border border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all text-white font-mono"
            disabled={loading}
            step="0.01"
            required
            placeholder="0.00"
          />
        </div>

        {/* Date Input */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-400 flex items-center gap-2">
            <Calendar className="w-4 h-4" /> {t('expenses.date')}
          </label>
          <input
            type="date"
            name="dateOfPayment" // Corrected name to match state logic if needed, or mapped correctly
            value={formData.dateOfPayment || ''}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-gray-800 rounded-xl border border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all text-white"
            disabled={loading}
          />
        </div>

        {/* Description Input (Full Width) */}
        <div className="md:col-span-2 space-y-2">
          <label className="text-sm font-medium text-gray-400">
            {t('expenses.description')}
          </label>
          <textarea
            name="description"
            value={formData.description || ''}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-gray-800 rounded-xl border border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all text-white placeholder-gray-600 resize-none h-24"
            disabled={loading}
            placeholder="Add any additional notes here..."
          />
        </div>
      </div>

      <div className="flex gap-4 mt-8 justify-end border-t border-gray-800 pt-6">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="px-6 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl font-semibold transition-all"
          >
            {t('common.cancel')}
          </button>
        )}
        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 px-8 py-2.5 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white rounded-xl font-semibold shadow-lg shadow-blue-900/30 transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save className="w-5 h-5" />
          {loading ? t('common.loading') : t('common.save')}
        </button>
      </div>
    </form>
  );
};

// Simple Icon helper for the header
const Edit2Icon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
);

export default ExpenseForm;