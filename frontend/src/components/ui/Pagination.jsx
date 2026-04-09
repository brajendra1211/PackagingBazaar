import React from 'react';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';

/**
 * Reusable Premium Pagination Component
 * @param {number} currentPage - Current active page (1-indexed)
 * @param {number} totalPages - Total number of pages
 * @param {function} onPageChange - Callback when page changes
 */
const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    const pages = [];
    const showMax = 5;

    if (totalPages <= showMax) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      // Logic for ellipsis
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, '...', totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
      }
    }
    return pages;
  };

  return (
    <div className="flex items-center justify-center gap-2 mt-8 py-4">
      {/* Previous Button */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="p-2.5 rounded-xl border border-gray-100 bg-white shadow-sm text-gray-500 hover:text-[#e8511a] hover:border-orange-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all group"
        title="Previous Page"
      >
        <ChevronLeft size={18} className="group-hover:-translate-x-0.5 transition-transform" />
      </button>

      {/* Page Numbers */}
      <div className="flex items-center gap-1.5 px-2">
        {getPageNumbers().map((page, index) => (
          <React.Fragment key={index}>
            {page === '...' ? (
              <span className="px-2 text-gray-400">
                <MoreHorizontal size={16} />
              </span>
            ) : (
              <button
                onClick={() => onPageChange(page)}
                className={`min-w-[40px] h-10 px-3 rounded-xl text-sm font-bold transition-all ${
                  currentPage === page
                    ? "bg-[#e8511a] text-white shadow-md shadow-orange-200"
                    : "bg-white text-gray-600 border border-gray-100 hover:border-orange-200 hover:text-[#e8511a] shadow-sm"
                }`}
              >
                {page}
              </button>
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Next Button */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="p-2.5 rounded-xl border border-gray-100 bg-white shadow-sm text-gray-500 hover:text-[#e8511a] hover:border-orange-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all group"
        title="Next Page"
      >
        <ChevronRight size={18} className="group-hover:translate-x-0.5 transition-transform" />
      </button>
    </div>
  );
};

export default Pagination;
