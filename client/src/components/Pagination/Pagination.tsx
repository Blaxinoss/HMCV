// src/components/Common/Pagination.tsx
import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    itemsPerPage: number;
    totalItems: number;
    onItemsPerPageChange: (limit: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({
    currentPage,
    totalPages,
    onPageChange,
    itemsPerPage,
    totalItems,
    onItemsPerPageChange
}) => {
    const { t } = useTranslation();
    const firstItem = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
    const lastItem = Math.min(currentPage * itemsPerPage, totalItems);

    return (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4 px-6 border-t border-gray-800 bg-gray-900/50">
            <div className="text-sm text-gray-400">
                {t('ui.pagination_summary', { from: firstItem, to: lastItem, total: totalItems })}
            </div>

            <div className="flex items-center gap-2">
                <select
                    value={itemsPerPage}
                    onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
                    className="bg-gray-800 border border-gray-700 text-white text-sm rounded-lg p-2 outline-none focus:border-blue-500"
                >
                    {[10, 20, 50, 100].map((count) => (
                        <option key={count} value={count}>{t('ui.per_page', { count })}</option>
                    ))}
                </select>

                <div className="flex items-center gap-1 bg-gray-800 rounded-lg p-1 border border-gray-700">
                    <button
                        onClick={() => onPageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="p-2 hover:bg-gray-700 rounded-md disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                        <ChevronLeft className="w-4 h-4 text-white" />
                    </button>

                    <span className="px-3 text-sm font-medium text-white min-w-[3rem] text-center">
                        {currentPage} / {totalPages || 1}
                    </span>

                    <button
                        onClick={() => onPageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="p-2 hover:bg-gray-700 rounded-md disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                        <ChevronRight className="w-4 h-4 text-white" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Pagination;
