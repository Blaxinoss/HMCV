import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTrainees } from '../../slices/subscriptionSlice';
import { AppDispatch, RootState } from '../../store';
import TraineeCard from './TraineeCard';
import { Trainee } from '../../types';
import TraineeDetailsModal from './TraineeDetailsModal';
import { Search, Users } from 'lucide-react';

const AllTrainees: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const { trainees, loading } = useSelector((state: RootState) => state.trainees);

  const [selectedTraineeId, setSelectedTraineeId] = useState<string | null>(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [targetTrainee, setTargetTrainee] = useState<Trainee | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const handleOpenDetails = (trainee: Trainee) => {
    setTargetTrainee(trainee);
    setDetailsModalOpen(true);
  };

  useEffect(() => {
    dispatch(fetchTrainees());
  }, [dispatch]);

  const filteredTrainees = trainees.filter(t =>
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.phone.includes(searchTerm) ||
    t.memberId.toString().includes(searchTerm)
  );

  return (
    <div className="p-6 lg:p-10 bg-gray-950 min-h-screen text-white font-sans">

      {/* Header & Search */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-6">
        <div>
          <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500 flex items-center gap-3">
            <Users className="w-8 h-8 text-blue-500" />
            {t('trainees.header', 'All Members')}
          </h1>
          <p className="text-gray-400 mt-1">View and manage all registered members.</p>
        </div>

        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
          <input
            type="text"
            placeholder="Search by name, ID, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-gray-900 border border-gray-800 rounded-xl text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none shadow-lg"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : filteredTrainees.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-gray-900/50 rounded-2xl border border-gray-800/50 border-dashed">
          <div className="bg-gray-800 p-4 rounded-full mb-4">
            <Search className="w-8 h-8 text-gray-600" />
          </div>
          <p className="text-gray-400 text-lg">{t('trainees.no_trainees')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-fadeIn">
          {filteredTrainees.map((trainee) => (
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
        </div>
      )}

      <TraineeDetailsModal
        isOpen={detailsModalOpen}
        onClose={() => setDetailsModalOpen(false)}
        trainee={targetTrainee}
      />
    </div>
  );
};

export default AllTrainees;