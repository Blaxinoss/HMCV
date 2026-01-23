// src/components/Expenses/ExpenseTable.tsx

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { deleteExpense } from '../../slices/expensesSlice';
import { AppDispatch } from '../../store';
import { Expense } from '../../types';
import toast from 'react-hot-toast';
import { useConfirmToast } from '../toasters/deleteToaster';

interface ExpenseTableProps {
  expenses: Expense[];
  loading: boolean;
  onEdit: (id: string) => void;
  onAddNew: () => void;
}

const ExpenseTable: React.FC<ExpenseTableProps> = ({
  expenses,
  loading,
  onEdit,
  onAddNew,
}) => {
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const { showConfirm } = useConfirmToast()

  const handleDelete = (id: string) => {
    showConfirm(id, (id) => dispatch(deleteExpense(id)));
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      Rent: 'bg-red-500',
      Utilities: 'bg-blue-500',
      Equipment: 'bg-yellow-500',
      Marketing: 'bg-purple-500',
      Salaries: 'bg-green-500',
      Maintenance: 'bg-orange-500',
      Insurance: 'bg-pink-500',
      Supplies: 'bg-indigo-500',
      Other: 'bg-gray-500',
    };
    return colors[category] || 'bg-gray-500';
  };

  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
      {expenses.length === 0 ? (
        <div className="p-8 text-center">
          <p className="text-gray-400 mb-4">{t('expenses.no_expenses')}</p>
          <button
            onClick={onAddNew}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded font-semibold"
          >
            {t('expenses.add_first')}
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-700 border-b border-gray-600">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold">
                  {t('expenses.category')}
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold">
                  {t('expenses.name')}
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold">
                  {t('expenses.amount')}
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold">
                  {t('expenses.date')}
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold">
                  {t('expenses.actions')}
                </th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((expense) => (
                <React.Fragment key={expense._id}>
                  <tr className="border-b border-gray-700 hover:bg-gray-700 transition">
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-sm text-white font-semibold ${getCategoryColor(expense.category)}`}
                      >
                        {expense.category}
                      </span>
                    </td>
                    <td className="px-6 py-4">{expense.name || '-'}</td>
                    <td className="px-6 py-4 font-semibold text-red-400">
                      ${expense.amount?.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-gray-300">
                      {new Date(expense.dateOfPayment).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => onEdit(expense._id)}
                          className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm"
                          disabled={loading}
                        >
                          {t('common.edit')}
                        </button>
                        <button
                          onClick={() =>
                            setExpandedId(
                              expandedId === expense._id ? null : expense._id
                            )
                          }
                          className="px-3 py-1 bg-gray-600 hover:bg-gray-700 rounded text-sm"
                        >
                          ⋮
                        </button>
                      </div>
                    </td>
                  </tr>
                  {expandedId === expense._id && (
                    <tr className="bg-gray-750 border-b border-gray-700">
                      <td colSpan={5} className="px-6 py-4">
                        <div className="flex flex-col gap-4"> {/* خلي العناصر فوق بعض بمسافة */}
                          {expense.category && (
                            <div className="bg-gray-700/50 p-4 rounded-lg border border-gray-600">
                              <p className="text-sm text-gray-300 mb-1 font-bold uppercase tracking-wider">
                                {t('expenses.description')}
                              </p>
                              <p className="text-white">{expense.category}</p>
                            </div>
                          )}

                          <div className="flex justify-end pt-2 border-t border-gray-700"> {/* زرار المسح لوحده تحت بمسافة */}
                            <button
                              onClick={() => handleDelete(expense._id)}
                              className="px-6 py-2 bg-red-600/20 hover:bg-red-600 text-red-500 hover:text-white border border-red-600/50 rounded-lg transition-all font-bold"
                            >
                              {t('common.delete')}
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ExpenseTable;


