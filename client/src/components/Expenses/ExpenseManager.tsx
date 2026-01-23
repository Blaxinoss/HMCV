// src/components/Expenses/ExpenseManager.tsx

import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { fetchExpenses } from '../../slices/expensesSlice';
import { AppDispatch, RootState } from '../../store';
import ExpenseForm from './ExpenseForm';
import ExpenseTable from './ExpenseTable';

const ExpenseManager: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const { expenses, loading } = useSelector(
    (state: RootState) => state.expenses
  );
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchExpenses());
  }, [dispatch]);

  const handleAddNew = () => {
    setEditingId(null);
    setShowForm(true);
  };

  const handleEdit = (id: string) => {
    setEditingId(id);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingId(null);
  };

  const totalExpenses = expenses.reduce(
    (sum, expense) => sum + (expense.amount || 0),
    0
  );

  return (
    <div className="p-8 bg-gray-900 min-h-screen text-white">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">{t('expenses.header')}</h1>
          <p className="text-gray-400 mt-2">
            {t('expenses.total')}:
            <span className='text-orange-500'> ${totalExpenses.toFixed(2)}</span>
          </p>
        </div>
        <button
          onClick={handleAddNew}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded font-semibold"
        >
          {t('expenses.add_new')}
        </button>
      </div>

      {showForm && (

        <div className="mb-8">
          <button
            onClick={handleCloseForm}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded mb-4"
          >
            {t('common.back')}
          </button>
          <ExpenseForm editingId={editingId} onSuccess={handleCloseForm} />
        </div>
      )}
      <ExpenseTable
        expenses={expenses}
        loading={loading}
        onEdit={handleEdit}
        onAddNew={handleAddNew}
      />


    </div>
  );
};

export default ExpenseManager;
