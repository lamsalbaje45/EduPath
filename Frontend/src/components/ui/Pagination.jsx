/**
 * Pagination - Previous/Next buttons + page numbers
 * Controlled via props: currentPage, totalPages, onPageChange
 */

export const Pagination = ({
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  siblings = 1,
  className = "",
}) => {
  const canGoPrev = currentPage > 1;
  const canGoNext = currentPage < totalPages;

  const getPageNumbers = () => {
    const pages = [];
    const startPage = Math.max(1, currentPage - siblings);
    const endPage = Math.min(totalPages, currentPage + siblings);

    if (startPage > 1) {
      pages.push(1);
      if (startPage > 2) pages.push("...");
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) pages.push("...");
      pages.push(totalPages);
    }

    return pages;
  };

  const handlePageClick = (page) => {
    if (typeof page === "number" && onPageChange) {
      onPageChange(page);
    }
  };

  if (totalPages <= 1) return null;

  const pageNumbers = getPageNumbers();

  return (
    <div className={`flex flex-wrap items-center justify-center gap-2 ${className}`}>
      {/* Previous */}
      <button
        type="button"
        disabled={!canGoPrev}
        onClick={() => handlePageClick(currentPage - 1)}
        className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 text-gray-900 transition-colors hover:border-[#5472FC] hover:bg-[#E7EEFF] hover:text-[#2551D9] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-gray-200 disabled:hover:bg-transparent disabled:hover:text-gray-900 dark:border-slate-700 dark:text-white dark:hover:bg-slate-800"
      >
        <svg
          className="h-5 w-5"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {/* Page numbers */}
      <div className="flex items-center gap-1">
        {pageNumbers.map((page, idx) => {
          if (page === "...") {
            return (
              <span key={`dots-${idx}`} className="px-2 text-gray-500">
                ...
              </span>
            );
          }

          const isActive = page === currentPage;
          return (
            <button
              key={page}
              type="button"
              onClick={() => handlePageClick(page)}
              className={`flex h-10 w-10 items-center justify-center rounded-full border text-sm font-black transition-colors ${
                isActive
                  ? "border-[#5472FC] bg-[#5472FC] text-white shadow-sm shadow-[#5472FC]/30"
                  : "border-gray-200 text-gray-900 hover:border-[#5472FC] hover:bg-[#E7EEFF] hover:text-[#2551D9] dark:border-slate-700 dark:text-white dark:hover:bg-slate-800"
              }`}
            >
              {page}
            </button>
          );
        })}
      </div>

      {/* Next */}
      <button
        type="button"
        disabled={!canGoNext}
        onClick={() => handlePageClick(currentPage + 1)}
        className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 text-gray-900 transition-colors hover:border-[#5472FC] hover:bg-[#E7EEFF] hover:text-[#2551D9] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-gray-200 disabled:hover:bg-transparent disabled:hover:text-gray-900 dark:border-slate-700 dark:text-white dark:hover:bg-slate-800"
      >
        <svg
          className="h-5 w-5"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
            clipRule="evenodd"
          />
        </svg>
      </button>
    </div>
  );
};

export default Pagination;
