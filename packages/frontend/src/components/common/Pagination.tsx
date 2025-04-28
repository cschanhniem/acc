import React from "react";

interface PaginationProps {
  currentPage: number;
  hasNextPage: boolean;
  onNextPage: () => void;
  onPrevPage: () => void;
  isLoading?: boolean;
  className?: string;
}

export const Pagination = ({
  currentPage,
  hasNextPage,
  onNextPage,
  onPrevPage,
  isLoading = false,
  className = ""
}: PaginationProps) => {
  return (
    <div className={`flex items-center justify-between ${className}`}>
      <button
        onClick={onPrevPage}
        disabled={currentPage === 1 || isLoading}
        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors
          ${currentPage === 1 || isLoading
            ? "bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-800 dark:text-gray-600"
            : "bg-primary-50 text-primary-600 hover:bg-primary-100 dark:bg-primary-900 dark:text-primary-300 dark:hover:bg-primary-800"
          }`}
      >
        Previous
      </button>
      
      <span className="text-sm text-gray-700 dark:text-gray-300">
        Page {currentPage}
      </span>
      
      <button
        onClick={onNextPage}
        disabled={!hasNextPage || isLoading}
        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors
          ${!hasNextPage || isLoading
            ? "bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-800 dark:text-gray-600"
            : "bg-primary-50 text-primary-600 hover:bg-primary-100 dark:bg-primary-900 dark:text-primary-300 dark:hover:bg-primary-800"
          }`}
      >
        Next
      </button>
    </div>
  );
};
