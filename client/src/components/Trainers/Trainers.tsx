import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTrainers } from '../../slices/trainersSlice';
import { AppDispatch, RootState } from '../../store';
import TrainersForm from './TrainersForm';
import TrainersList from './TrainersList';
import { Users, DollarSign, Plus, ArrowLeft } from 'lucide-react';

const Trainers: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const { trainers, loading } = useSelector((state: RootState) => state.trainers);

  const [showForm, setShowForm] = useState(false);
  const [editingTrainer, setEditingTrainer] = useState<any | null>(null);

  useEffect(() => {
    dispatch(fetchTrainers());
  }, [dispatch]);

  const handleAddNew = () => {
    setEditingTrainer(null);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleEdit = (trainer: any) => {
    setEditingTrainer(trainer);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingTrainer(null);
  };

  const totalSalaries = trainers.reduce((acc, curr) => acc + (curr.salaryAfterDiscount || curr.salary), 0);

  return (
    <div className="p-6 lg:p-10 bg-gray-950 min-h-screen text-white font-sans">

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500">
            {showForm ? (editingTrainer ? t('trainers.edit_trainer') : t('trainers.add_new')) : t('trainers.header', 'Trainers Management')}
          </h1>
          <p className="text-gray-400 mt-1">
            {showForm ? "Manage staff details below." : t('trainers.subtitle', 'Manage your gym trainers and their salaries.')}
          </p>
        </div>

        <div>
          {showForm ? (
            <button
              onClick={handleCloseForm}
              className="flex items-center gap-2 px-5 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl font-semibold transition-all border border-gray-700"
            >
              <ArrowLeft className="w-5 h-5" />
              {t('common.back')}
            </button>
          ) : (
            <button
              onClick={handleAddNew}
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold shadow-lg shadow-blue-900/20 transition-all transform hover:scale-105"
            >
              <Plus className="w-5 h-5" />
              {t('trainers.add_new', 'Add Trainer')}
            </button>
          )}
        </div>
      </div>

      {/* Stats Cards (Hidden in Form Mode) */}
      {!showForm && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 animate-fadeIn">
          <div className="bg-gray-900 border border-gray-800 p-6 rounded-2xl flex items-center gap-4 shadow-lg">
            <div className="p-3 bg-blue-500/10 rounded-xl text-blue-500">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Total Trainers</p>
              <p className="text-2xl font-bold text-white">{trainers.length}</p>
            </div>
          </div>
          <div className="bg-gray-900 border border-gray-800 p-6 rounded-2xl flex items-center gap-4 shadow-lg">
            <div className="p-3 bg-green-500/10 rounded-xl text-green-500">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Total Payroll</p>
              <p className="text-2xl font-bold text-white">${totalSalaries.toLocaleString()}</p>
            </div>
          </div>
        </div>
      )}

      {/* Content Area */}
      <div className="transition-all duration-300">
        {showForm ? (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 lg:p-8 shadow-2xl animate-slideIn">
            <TrainersForm
              trainer={editingTrainer}
              onSuccess={handleCloseForm}
              onCancel={handleCloseForm}
            />
          </div>
        ) : (
          <TrainersList
            trainers={trainers}
            loading={loading}
            onEdit={handleEdit}
          />
        )}
      </div>
    </div>
  );
};

export default Trainers;