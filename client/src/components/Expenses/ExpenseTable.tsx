import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { deleteExpense } from '../../slices/expensesSlice';
import { AppDispatch } from '../../store';
import { Expense } from '../../types';
import { useConfirmToast } from '../toasters/deleteToaster';
import { Edit2, Trash2, ChevronDown, ChevronUp, AlertCircle, FileText } from 'lucide-react';

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
  const { showConfirm } = useConfirmToast();

  const handleDelete = (id: string) => {
    showConfirm(id, (id) => dispatch(deleteExpense(id)));
  };

  const getCategoryStyle = (category: string) => {
    const styles: { [key: string]: string } = {
      Rent: 'bg-red-500/20 text-red-400 border-red-500/30',
      Utilities: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      Equipment: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      Marketing: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      Salaries: 'bg-green-500/20 text-green-400 border-green-500/30',
      Maintenance: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
      Insurance: 'bg-pink-500/20 text-pink-400 border-pink-500/30',
      Supplies: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
      Other: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
    };
    return styles[category] || 'bg-gray-500/20 text-gray-400 border-gray-500/30';
  };

  return (
    <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden shadow-xl">
      {expenses.length === 0 ? (
        <div className="p-12 text-center flex flex-col items-center justify-center">
          <div className="bg-gray-800 p-4 rounded-full mb-4">
            <AlertCircle className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-400 text-lg mb-6">{t('expenses.no_expenses')}</p>
          <button
            onClick={onAddNew}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold text-white transition-colors"
          >
            {t('expenses.add_first')}
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-800/50 border-b border-gray-700">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">{t('expenses.category')}</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">{t('expenses.name')}</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">{t('expenses.amount')}</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">{t('expenses.date')}</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-gray-400 uppercase tracking-wider">{t('expenses.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {expenses.map((expense) => (
                <React.Fragment key={expense._id}>
                  <tr className="hover:bg-gray-800/50 transition-colors duration-150 group">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getCategoryStyle(expense.category)}`}>
                        {expense.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-200 font-medium">
                      {expense.name || <span className="text-gray-600 italic">{t('expenses.no_name')}</span>}
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-white">
                      {expense.amount?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} EGP
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-400">
                      {new Date(expense.dateOfPayment).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => onEdit(expense._id)}
                          disabled={loading}
                          className="p-2 text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                          title={t('common.edit')}
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setExpandedId(expandedId === expense._id ? null : expense._id)}
                          className={`p-2 rounded-lg transition-colors ${expandedId === expense._id ? 'text-white bg-gray-700' : 'text-gray-400 hover:bg-gray-700'}`}
                        >
                          {expandedId === expense._id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                      </div>
                    </td>
                  </tr>

                  {/* Expanded Row */}
                  {expandedId === expense._id && (
                    <tr className="bg-gray-800/30 animate-fadeIn">
                      <td colSpan={5} className="px-6 py-4">
                        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start bg-gray-800 p-4 rounded-xl border border-gray-700">
                          <div className="flex gap-4 items-start">
                            <div className="p-3 bg-gray-700 rounded-lg">
                              <FileText className="w-6 h-6 text-gray-400" />
                            </div>
                            <div>
                              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">
                                {t('expenses.description')}
                              </h4>
                              <p className="text-sm text-gray-200 leading-relaxed">
                                {expense.description || "No additional notes provided."}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-700 w-full sm:w-auto mt-2 sm:mt-0 justify-end">
                            <span className="text-xs text-gray-500 uppercase font-bold mr-2">Danger Zone:</span>
                            <button
                              onClick={() => handleDelete(expense._id)}
                              className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 hover:border-red-500/40 rounded-lg transition-all text-sm font-semibold"
                            >
                              <Trash2 className="w-4 h-4" />
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