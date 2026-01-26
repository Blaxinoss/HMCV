import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../store';
import TraineeCard from './TraineeCard';
import { Trainee } from '../../types';
import TraineeDetailsModal from './TraineeDetailsModal';
import { Search, Users } from 'lucide-react';
import { fetchTrainees } from '../../slices/subscriptionSlice'; // تأكد من المسار
import Pagination from '../Pagination/Pagination';
const AllTrainees: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { t } = useTranslation();

  // لازم نتأكد ان pagination راجعة من السلايس
  const { trainees, loading, pagination } = useSelector((state: RootState) => state.trainees);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(24); // 👈 1. عملنا ستيت للعدد
  const [selectedTraineeId, setSelectedTraineeId] = useState<string | null>(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [targetTrainee, setTargetTrainee] = useState<Trainee | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const handleOpenDetails = (trainee: Trainee) => {
    setTargetTrainee(trainee);
    setDetailsModalOpen(true);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  // دالة تغيير عدد العناصر في الصفحة
  const handleLimitChange = (newLimit: number) => {
    setItemsPerPage(newLimit);
    setCurrentPage(1); // نرجع للصفحة الأولى لما نغير العدد
  };

  useEffect(() => {
    dispatch(fetchTrainees({
      page: currentPage,
      search: searchTerm,
      limit: itemsPerPage
    }));
  }, [dispatch, currentPage, searchTerm, itemsPerPage]); // ضفنا itemsPerPage للمراقبة

  // ❌ شيلنا الفلتر اليدوي لأن الداتا جاية مفلترة جاهزة
  // const filteredTrainees = ... 

  return (
    <div className="p-6 lg:p-10 bg-gray-950 min-h-screen text-white font-sans">

      {/* ... Header & Search Code زي ما هو ... */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-6">
        {/* ... نفس كود الهيدر بتاعك ... */}
        <div>
          <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500 flex items-center gap-3">
            <Users className="w-8 h-8 text-blue-500" />
            {t('trainees.header', 'All Members')}
          </h1>
          <p className="text-gray-400 mt-1">{t('trainees.manage_subtitle')}</p>
        </div>

        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
          <input
            type="text"
            placeholder={t('trainees.search_placeholder')}
            value={searchTerm}
            onChange={handleSearch}
            className="w-full pl-10 pr-4 py-3 bg-gray-900 border border-gray-800 rounded-xl text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none shadow-lg"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : trainees.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-gray-900/50 rounded-2xl border border-gray-800/50 border-dashed">
          {/* ... نفس كود الـ Empty State ... */}
          <p className="text-gray-400 text-lg">{t('trainees.no_trainees')}</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-fadeIn">
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
          </div>

          {/* 👇 3. هنا ربطنا الكومبوننت بالداتا الحقيقية */}
          <div className="mt-8">
            <Pagination
              currentPage={currentPage}
              totalPages={pagination?.totalPages || 1}
              onPageChange={setCurrentPage}
              itemsPerPage={itemsPerPage}
              totalItems={pagination?.totalUsers || 0}
              onItemsPerPageChange={handleLimitChange}
            />
          </div>
        </>
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