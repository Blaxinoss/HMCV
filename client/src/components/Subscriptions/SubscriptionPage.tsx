// src/components/Trainees/SubscriptionPage.tsx

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Trainee } from '../../types';
import TraineeList from './TraineeList';
import SubscriptionForm from './SubscriptionForm';

const SubscriptionPage: React.FC = () => {
  const { t } = useTranslation();
  const [showForm, setShowForm] = useState(false);
  const [editingTrainee, setEditingTrainee] = useState<Trainee | null>(null);

  const handleAddNew = () => {
    setEditingTrainee(null);
    setShowForm(true);
  };

  const handleEdit = (trainee: Trainee) => {
    setEditingTrainee(trainee);
    setShowForm(true);
  };

  const handleSuccess = () => {
    setShowForm(false);
    setEditingTrainee(null);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingTrainee(null);
  };

  return (
    <div className="p-8 bg-gray-900 min-h-screen text-white">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">{t('subscription.title')}</h1>
        <p className="text-gray-400">{t('subscription.manage_description')}</p>
      </div>

      {showForm ? (
        <div className="mb-8">
          <SubscriptionForm
            trainee={editingTrainee}
            onSuccess={handleSuccess}
            onCancel={handleCancel}
          />
        </div>
      ) : (
        <TraineeList onEdit={handleEdit} onAddNew={handleAddNew} />
      )}
    </div>
  );
};

export default SubscriptionPage;
