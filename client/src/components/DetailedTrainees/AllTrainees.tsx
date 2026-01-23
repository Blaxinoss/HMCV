import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTrainees } from '../../slices/subscriptionSlice'; // 1. غيرنا الـ Slice
import { AppDispatch, RootState } from '../../store';
import TraineeCard from './TraineeCard'; // 2. هنحتاج نعمل الكومبوننت ده
import { Trainee } from '../../types';
import TraineeDetailsModal from './TraineeDetailsModal';

const AllTrainees: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();

  // 3. بنسحب المتدربين من الـ State الصح
  const { trainees, loading } = useSelector((state: RootState) => state.trainees);
  const [selectedTraineeId, setSelectedTraineeId] = useState<string | null>(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [targetTrainee, setTargetTrainee] = useState<Trainee | null>(null);

  const handleOpenDetails = (trainee: Trainee) => {
    setTargetTrainee(trainee);
    setDetailsModalOpen(true);
  };


  useEffect(() => {
    dispatch(fetchTrainees());
  }, [dispatch]);

  return (
    <div className="p-8 bg-gray-900 min-h-screen text-white">
      <h1 className="text-3xl font-bold mb-8">
        {t('trainees.header')}
      </h1>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : trainees.length === 0 ? (
        <div className="text-center text-gray-400 mt-20">
          <p className="text-xl mb-4">📭</p>
          {t('trainees.no_trainees')}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trainees.map((trainee) => (
            <TraineeCard
              key={trainee._id}
              trainee={trainee}
              isSelected={selectedTraineeId === trainee._id}
              onViewDetails={() => handleOpenDetails(trainee)}
              onSelect={() =>
                setSelectedTraineeId(
                  selectedTraineeId === trainee._id ? null : trainee._id
                )
              }
            />
          ))}

          <TraineeDetailsModal
            isOpen={detailsModalOpen}
            onClose={() => setDetailsModalOpen(false)}
            trainee={targetTrainee}
          />
        </div>
      )}
    </div>
  );
};

export default AllTrainees;