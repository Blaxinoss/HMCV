// src/components/Expenses/ExpenseForm.tsx

import React, { FormEvent, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { addExpense, updateExpense } from '../../slices/expensesSlice';
import { AppDispatch, RootState } from '../../store';
import { Expense } from '../../types';
import { TOAST_DURATION } from '../../utils/constants';
import toast from 'react-hot-toast';

interface ExpenseFormProps {
  editingId: string | null;
  onSuccess: () => void;
}

const ExpenseForm: React.FC<ExpenseFormProps> = ({ editingId, onSuccess }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const { expenses, loading } = useSelector(
    (state: RootState) => state.expenses
  );

  const [formData, setFormData] = useState<Partial<Expense>>({
    category: undefined,
    amount: 0,
    dateOfPayment: new Date().toISOString().split('T')[0],
    name: '',
  });

  useEffect(() => {
    if (editingId) {
      const expense = expenses.find((e) => e._id === editingId);
      if (expense) {
        setFormData(expense);
      }
    }
  }, [editingId, expenses]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'amount' ? parseFloat(value) || 0 : value,
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!formData.category || !formData.amount) {
      // 2. استخدم toast بدل alert
      toast.error(t('expenses.fill_required_fields'), {
        style: {
          borderRadius: '10px',
          background: '#333',
          color: '#fff',
        },
      });
      return;
    }

    try {
      if (editingId) {
        dispatch(
          updateExpense({
            id: editingId,
            data: formData as Expense,
          })
        );
      } else {
        dispatch(addExpense(formData as Expense));
      }
      onSuccess();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const categories = [
    'Rent',
    'Utilities',
    'Equipment',
    'Marketing',
    'Salaries',
    'Maintenance',
    'Insurance',
    'Supplies',
    'Other',
  ];

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-gray-800 rounded-lg p-8 border border-gray-700"
    >
      <h2 className="text-2xl font-bold mb-6">
        {editingId ? t('expenses.edit') : t('expenses.add_new')}
      </h2>


      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        <div>
          <label className="block text-sm font-semibold mb-2">
            {t('expenses.name')}
          </label>
          <input
            type="text"
            name="name"
            value={formData.name || ''}
            onChange={handleChange}
            className="w-full px-4 py-2 bg-gray-700 rounded border border-gray-600 focus:border-blue-500 outline-none"
            disabled={loading}
            placeholder="machine..."
          />
        </div>


        <div>
          <label className="block text-sm font-semibold mb-2">
            {t('expenses.category')}
          </label>
          <select
            name="category"
            value={formData.category || ''}
            onChange={handleChange}
            className="w-full px-4 py-2 bg-gray-700 rounded border border-gray-600 focus:border-blue-500 outline-none"
            disabled={loading}
            required
          >
            <option value="">{t('expenses.select_category')}</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2">
            {t('expenses.amount')}
          </label>
          <input
            type="number"
            name="amount"
            value={formData.amount || 0}
            onChange={handleChange}
            className="w-full px-4 py-2 bg-gray-700 rounded border border-gray-600 focus:border-blue-500 outline-none"
            disabled={loading}
            step="0.01"
            required
          />
        </div>



        <div>
          <label className="block text-sm font-semibold mb-2">
            {t('expenses.date')}
          </label>
          <input
            type="date"
            name="date"
            value={formData.dateOfPayment || ''}
            onChange={handleChange}
            className="w-full px-4 py-2 bg-gray-700 rounded border border-gray-600 focus:border-blue-500 outline-none"
            disabled={loading}
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-semibold mb-2">
            {t('expenses.description')}
          </label>
          <input
            type="text"
            name="description"
            value={formData.description || ''}
            onChange={handleChange}
            className="w-full px-4 py-2 bg-gray-700 rounded border border-gray-600 focus:border-blue-500 outline-none"
            disabled={loading}
            placeholder="Additional notes"
          />
        </div>
      </div>

      <div className="flex gap-4 mt-8">
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded font-semibold disabled:opacity-50"
        >
          {loading ? t('common.loading') : t('common.save')}
        </button>
      </div>
    </form>
  );
};

export default ExpenseForm;
