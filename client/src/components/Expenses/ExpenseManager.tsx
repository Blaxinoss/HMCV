import React, { useEffect, useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { fetchExpenses } from '../../slices/expensesSlice';
import { AppDispatch, RootState } from '../../store';
import ExpenseForm from './ExpenseForm';
import ExpenseTable from './ExpenseTable';
import { Plus, Search, Filter, DollarSign, TrendingUp, Receipt } from 'lucide-react';

const ExpenseManager: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const { expenses, loading } = useSelector((state: RootState) => state.expenses);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

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
    // Scroll to top to see form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingId(null);
  };

  // Filter Logic
  const filteredExpenses = useMemo(() => {
    return expenses.filter(expense => {
      const matchesSearch = expense.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        expense.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || expense.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [expenses, searchTerm, selectedCategory]);

  // Stats Logic
  const stats = useMemo(() => {
    const total = filteredExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);
    const count = filteredExpenses.length;
    const avg = count > 0 ? total / count : 0;
    return { total, count, avg };
  }, [filteredExpenses]);

  const categories = ['All', 'Rent', 'Utilities', 'Equipment', 'Marketing', 'Salaries', 'Maintenance', 'Insurance', 'Supplies', 'Other'];

  return (
    <div className="p-6 lg:p-10 bg-gray-950 min-h-screen text-white font-sans">

      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500">
            {t('expenses.header')}
          </h1>
          <p className="text-gray-400 mt-1">Manage and track your gym's operational costs.</p>
        </div>
        {!showForm && (
          <button
            onClick={handleAddNew}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold shadow-lg shadow-blue-900/20 transition-all transform hover:scale-105"
          >
            <Plus className="w-5 h-5" />
            {t('expenses.add_new')}
          </button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gray-900 border border-gray-800 p-6 rounded-2xl flex items-center gap-4 shadow-lg">
          <div className="p-3 bg-red-500/10 rounded-xl text-red-500">
            <DollarSign className="w-8 h-8" />
          </div>
          <div>
            <p className="text-sm text-gray-400">Total Expenses</p>
            <h3 className="text-2xl font-bold text-white">${stats.total.toLocaleString()}</h3>
          </div>
        </div>
        <div className="bg-gray-900 border border-gray-800 p-6 rounded-2xl flex items-center gap-4 shadow-lg">
          <div className="p-3 bg-orange-500/10 rounded-xl text-orange-500">
            <Receipt className="w-8 h-8" />
          </div>
          <div>
            <p className="text-sm text-gray-400">Transaction Count</p>
            <h3 className="text-2xl font-bold text-white">{stats.count}</h3>
          </div>
        </div>
        <div className="bg-gray-900 border border-gray-800 p-6 rounded-2xl flex items-center gap-4 shadow-lg">
          <div className="p-3 bg-blue-500/10 rounded-xl text-blue-500">
            <TrendingUp className="w-8 h-8" />
          </div>
          <div>
            <p className="text-sm text-gray-400">Average Cost</p>
            <h3 className="text-2xl font-bold text-white">${stats.avg.toFixed(2)}</h3>
          </div>
        </div>
      </div>

      {/* Form Section (Collapsible) */}
      <div className={`transition-all duration-500 ease-in-out overflow-hidden ${showForm ? 'max-h-[800px] opacity-100 mb-8' : 'max-h-0 opacity-0'}`}>
        <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6">
          <ExpenseForm editingId={editingId} onSuccess={handleCloseForm} onCancel={handleCloseForm} />
        </div>
      </div>

      {/* Filters & Search Toolbar */}
      <div className="flex flex-col md:flex-row gap-4 mb-6 bg-gray-900 p-4 rounded-xl border border-gray-800">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 w-5 h-5 text-gray-500" />
          <input
            type="text"
            placeholder="Search by name or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-400" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer"
          >
            {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>
        </div>
      </div>

      {/* Table Section */}
      <ExpenseTable
        expenses={filteredExpenses}
        loading={loading}
        onEdit={handleEdit}
        onAddNew={handleAddNew}
      />
    </div>
  );
};

export default ExpenseManager;