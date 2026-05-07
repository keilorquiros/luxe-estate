'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';

interface AdminPaginationProps {
  currentPage: number;
  totalPages: number;
  total: number;
  pageSize: number;
}

export default function AdminPagination({
  currentPage,
  totalPages,
  total,
  pageSize,
}: AdminPaginationProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  if (totalPages <= 1) return null;

  const getPageHref = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', page.toString());
    return `${pathname}?${params.toString()}`;
  };

  // Build compact page range
  const pages: (number | '…')[] = [];
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== '…') {
      pages.push('…');
    }
  }

  const startItem = total === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, total);

  return (
    <div className="px-6 py-4 border-t border-gray-100 dark:border-mosque/20 bg-gray-50/50 dark:bg-mosque/5 flex flex-col sm:flex-row items-center justify-between gap-4">
      {/* Info text */}
      <p className="text-sm text-gray-500 dark:text-gray-400 order-2 sm:order-1">
        Showing{' '}
        <span className="font-semibold text-nordic-dark dark:text-white">{startItem}</span>
        {' – '}
        <span className="font-semibold text-nordic-dark dark:text-white">{endItem}</span>
        {' of '}
        <span className="font-semibold text-nordic-dark dark:text-white">{total}</span>
        {' properties'}
      </p>

      {/* Controls */}
      <nav aria-label="Admin properties pagination" className="flex items-center gap-1 order-1 sm:order-2">
        {/* Previous */}
        {currentPage > 1 ? (
          <Link
            href={getPageHref(currentPage - 1)}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium border border-gray-200 dark:border-mosque/30 bg-white dark:bg-[#152e2a] text-gray-600 dark:text-gray-300 hover:bg-mosque/5 dark:hover:bg-mosque/20 hover:border-mosque/40 hover:text-mosque transition-all"
          >
            <span className="material-icons text-[16px]">chevron_left</span>
            Prev
          </Link>
        ) : (
          <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium border border-gray-100 dark:border-mosque/10 bg-white/60 dark:bg-[#152e2a]/60 text-gray-300 dark:text-gray-600 cursor-not-allowed select-none">
            <span className="material-icons text-[16px]">chevron_left</span>
            Prev
          </span>
        )}

        {/* Page numbers */}
        {pages.map((page, idx) =>
          page === '…' ? (
            <span
              key={`ellipsis-${idx}`}
              className="inline-flex items-center justify-center w-9 h-9 text-sm text-gray-400 dark:text-gray-600 select-none"
            >
              …
            </span>
          ) : (
            <Link
              key={page}
              href={getPageHref(page)}
              aria-current={page === currentPage ? 'page' : undefined}
              className={`inline-flex items-center justify-center w-9 h-9 rounded-lg text-sm font-semibold transition-all ${
                page === currentPage
                  ? 'bg-gradient-to-br from-mosque to-mosque/80 text-white shadow-md shadow-mosque/30 border border-mosque'
                  : 'border border-gray-200 dark:border-mosque/30 bg-white dark:bg-[#152e2a] text-gray-600 dark:text-gray-300 hover:border-mosque/50 hover:text-mosque hover:bg-mosque/5 dark:hover:bg-mosque/20'
              }`}
            >
              {page}
            </Link>
          )
        )}

        {/* Next */}
        {currentPage < totalPages ? (
          <Link
            href={getPageHref(currentPage + 1)}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium border border-gray-200 dark:border-mosque/30 bg-white dark:bg-[#152e2a] text-gray-600 dark:text-gray-300 hover:bg-mosque/5 dark:hover:bg-mosque/20 hover:border-mosque/40 hover:text-mosque transition-all"
          >
            Next
            <span className="material-icons text-[16px]">chevron_right</span>
          </Link>
        ) : (
          <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium border border-gray-100 dark:border-mosque/10 bg-white/60 dark:bg-[#152e2a]/60 text-gray-300 dark:text-gray-600 cursor-not-allowed select-none">
            Next
            <span className="material-icons text-[16px]">chevron_right</span>
          </span>
        )}
      </nav>
    </div>
  );
}
