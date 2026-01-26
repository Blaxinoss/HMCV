// src/components/Common/Pagination.tsx
import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

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
    return (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4 px-6 border-t border-gray-800 bg-gray-900/50">
            <div className="text-sm text-gray-400">
                Showing <span className="font-bold text-white">{(currentPage - 1) * itemsPerPage + 1}</span> to{' '}
                <span className="font-bold text-white">{Math.min(currentPage * itemsPerPage, totalItems)}</span> of{' '}
                <span className="font-bold text-white">{totalItems}</span> results
            </div>

            <div className="flex items-center gap-2">
                <select
                    value={itemsPerPage}
                    onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
                    className="bg-gray-800 border border-gray-700 text-white text-sm rounded-lg p-2 outline-none focus:border-blue-500"
                >
                    <option value={10}>10 / page</option>
                    <option value={20}>20 / page</option>
                    <option value={50}>50 / page</option>
                    <option value={100}>100 / page</option>
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