'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import AdminFilterModal from './AdminFilterModal';

interface AdminFilterButtonProps {
  lang: string;
}

export default function AdminFilterButton({ lang }: AdminFilterButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const searchParams = useSearchParams();

  const hasActiveFilters = searchParams.has('search') || 
                           searchParams.has('minPrice') || 
                           searchParams.has('maxPrice') || 
                           searchParams.has('tag') || 
                           searchParams.has('beds') || 
                           searchParams.has('baths');

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-colors shadow-sm inline-flex items-center gap-2 border ${
          hasActiveFilters 
            ? "bg-primary/10 text-primary border-primary/20 hover:bg-primary/20" 
            : "bg-white border-gray-200 text-nordic hover:bg-gray-50"
        }`}
      >
        <span className="material-icons text-base">filter_list</span> Filter
        {hasActiveFilters && <span className="w-2 h-2 rounded-full bg-primary ml-1"></span>}
      </button>
      <AdminFilterModal isOpen={isOpen} onClose={() => setIsOpen(false)} lang={lang} />
    </>
  );
}
