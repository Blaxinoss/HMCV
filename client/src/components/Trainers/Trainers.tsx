import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTrainers } from '../../slices/trainersSlice';
import { AppDispatch, RootState } from '../../store';
import TrainersForm from './TrainersForm';
import TrainersList from './TrainersList';

const Trainers: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const { trainers, loading } = useSelector((state: RootState) => state.trainers);

  const [showForm, setShowForm] = useState(false);
  const [editingTrainer, setEditingTrainer] = useState<any | null>(null); // هنبعت الاوبجيكت كله

  useEffect(() => {
    dispatch(fetchTrainers());
  }, [dispatch]);

  const handleAddNew = () => {
    setEditingTrainer(null);
    setShowForm(true);
  };

  const handleEdit = (trainer: any) => {
    setEditingTrainer(trainer);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingTrainer(null);
  };

  // حساب إجمالي الرواتب للإحصائيات
  const totalSalaries = trainers.reduce((acc, curr) => acc + (curr.salaryAfterDiscount || curr.salary), 0);

  return (
    <div className="p-8 bg-gray-900 min-h-screen text-white">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">{t('trainers.header', 'Trainers Management')}</h1>
          <p className="text-gray-400 text-sm">
            {t('trainers.subtitle', 'Manage your gym trainers and their salaries')}
          </p>
        </div>

        {/* Stats Cards Small */}
        {!showForm && (
          <div className="flex gap-4">
            <div className="bg-gray-800 p-3 rounded-lg border border-gray-700">
              <p className="text-gray-400 text-xs">Total Trainers</p>
              <p className="text-xl font-bold text-blue-400">{trainers.length}</p>
            </div>
            <div className="bg-gray-800 p-3 rounded-lg border border-gray-700">
              <p className="text-gray-400 text-xs">Total Salaries</p>
              <p className="text-xl font-bold text-green-400">${totalSalaries.toLocaleString()}</p>
            </div>
          </div>
        )}

        <button
          onClick={showForm ? handleCloseForm : handleAddNew}
          className={`px-6 py-2 rounded-lg font-semibold transition-colors shadow-lg ${showForm
            ? 'bg-gray-700 hover:bg-gray-600 text-white'
            : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
        >
          {showForm ? t('common.back', 'Back to List') : t('trainers.add_new', 'Add New Trainer')}
        </button>
      </div>

      {/* Content Area */}
      <div className="animate-fadeIn">
        {showForm ? (
          <TrainersForm
            trainer={editingTrainer}
            onSuccess={handleCloseForm}
            onCancel={handleCloseForm}
          />
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