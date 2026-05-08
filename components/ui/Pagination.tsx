"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Locale } from "../../lib/i18n";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  lang: Locale;
  basePath?: string;
}

export default function Pagination({ currentPage, totalPages, lang, basePath }: PaginationProps) {
  const searchParams = useSearchParams();
  
  if (totalPages <= 1) return null;

  const getPageHref = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", page.toString());
    if (basePath) {
      return `${basePath}?${params.toString()}`;
    }
    return `/${lang}?${params.toString()}#market-section`;
  };

  // Build page range: always show first, last, and a window around current
  const pages: (number | "…")[] = [];
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== "…") {
      pages.push("…");
    }
  }

  return (
    <nav
      aria-label="Property pagination"
      className="flex items-center justify-center gap-1 mt-12"
    >
      {/* Previous */}
      {currentPage > 1 ? (
        <Link
          href={getPageHref(currentPage - 1)}
          className="flex items-center justify-center w-10 h-10 rounded-lg border border-nordic-dark/10 bg-white text-nordic-dark hover:border-mosque hover:text-mosque transition-colors"
          aria-label="Previous page"
        >
          <span className="material-icons text-lg">chevron_left</span>
        </Link>
      ) : (
        <span className="flex items-center justify-center w-10 h-10 rounded-lg border border-nordic-dark/5 bg-white/50 text-nordic-dark/30 cursor-not-allowed">
          <span className="material-icons text-lg">chevron_left</span>
        </span>
      )}

      {/* Page numbers */}
      {pages.map((page, idx) =>
        page === "…" ? (
          <span
            key={`ellipsis-${idx}`}
            className="flex items-center justify-center w-10 h-10 text-nordic-muted text-sm"
          >
            …
          </span>
        ) : (
          <Link
            key={page}
            href={getPageHref(page)}
            aria-current={page === currentPage ? "page" : undefined}
            className={`flex items-center justify-center w-10 h-10 rounded-lg text-sm font-medium transition-all ${
              page === currentPage
                ? "bg-mosque text-white shadow-md shadow-mosque/25"
                : "border border-nordic-dark/10 bg-white text-nordic-dark hover:border-mosque hover:text-mosque"
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
          className="flex items-center justify-center w-10 h-10 rounded-lg border border-nordic-dark/10 bg-white text-nordic-dark hover:border-mosque hover:text-mosque transition-colors"
          aria-label="Next page"
        >
          <span className="material-icons text-lg">chevron_right</span>
        </Link>
      ) : (
        <span className="flex items-center justify-center w-10 h-10 rounded-lg border border-nordic-dark/5 bg-white/50 text-nordic-dark/30 cursor-not-allowed">
          <span className="material-icons text-lg">chevron_right</span>
        </span>
      )}
    </nav>
  );
}
