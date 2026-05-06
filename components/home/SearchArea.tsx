"use client";

import { useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import FilterModal from "./FilterModal";

export default function SearchArea() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const inputRef = useRef<HTMLInputElement>(null);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalInitialQuery, setModalInitialQuery] = useState("");

  const handleOpenModal = () => {
    setModalInitialQuery(inputRef.current?.value || searchParams.get("q") || "");
    setIsModalOpen(true);
  };

  const handleSearch = (e?: React.FormEvent<HTMLFormElement>) => {
    e?.preventDefault();
    const formData = new FormData(e?.currentTarget || document.querySelector('#search-form') as HTMLFormElement);
    const query = formData.get("q") as string;
    
    const params = new URLSearchParams(searchParams.toString());
    if (query?.trim()) {
      params.set("q", query.trim());
    } else {
      params.delete("q");
    }
    params.set("page", "1");
    router.push(`/?${params.toString()}`, { scroll: false });
  };

  const handleTypeClick = (type: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (type !== "All") {
      params.set("type", type);
    } else {
      params.delete("type");
    }
    params.set("page", "1");
    router.push(`/?${params.toString()}`, { scroll: false });
  };

  const currentType = searchParams.get("type") || "All";
  const hasActiveFilters = Array.from(searchParams.keys()).some(key => key !== "q" && key !== "page");

  return (
    <>
      <form id="search-form" onSubmit={handleSearch} className="relative group max-w-2xl mx-auto">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <span className="material-icons text-nordic-muted text-2xl group-focus-within:text-mosque transition-colors">search</span>
        </div>
        <input 
          ref={inputRef}
          name="q"
          className="block w-full pl-12 pr-32 py-4 rounded-xl border-none bg-white text-nordic-dark shadow-soft placeholder-nordic-muted/60 focus:ring-2 focus:ring-mosque focus:bg-white transition-all text-lg" 
          placeholder="Search by city, neighborhood, or address..." 
          type="text" 
          defaultValue={searchParams.get("q") || ""}
          key={searchParams.get("q")} // Reset input when URL changes (e.g. from FilterModal)
        />
        <button 
          type="submit"
          className="absolute inset-y-2 right-2 px-6 bg-mosque hover:bg-mosque/90 text-white font-medium rounded-lg transition-colors flex items-center justify-center shadow-lg shadow-mosque/20"
        >
          Search
        </button>
      </form>
      
      <div className="flex items-center justify-center gap-3 overflow-x-auto hide-scroll py-2 px-4 -mx-4">
        {["All", "House", "Apartment", "Villa", "Penthouse"].map(type => (
          <button 
            key={type}
            onClick={() => handleTypeClick(type)}
            className={`whitespace-nowrap px-5 py-2 rounded-full text-sm font-medium transition-all ${
              currentType === type 
                ? "bg-nordic-dark text-white shadow-lg shadow-nordic-dark/10 hover:-translate-y-0.5" 
                : "bg-white border border-nordic-dark/5 text-nordic-muted hover:text-nordic-dark hover:border-mosque/50 hover:bg-mosque/5"
            }`}
          >
            {type}
          </button>
        ))}
        
        <div className="w-px h-6 bg-nordic-dark/10 mx-2"></div>
        
        <button 
          onClick={handleOpenModal}
          className={`whitespace-nowrap flex items-center gap-1 px-4 py-2 rounded-full font-medium text-sm transition-all ${
            hasActiveFilters 
              ? "bg-mosque/10 text-mosque border border-mosque/20 hover:bg-mosque/20" 
              : "text-nordic-dark hover:bg-black/5"
          }`}
        >
          <span className="material-icons text-base">tune</span> Filters
          {hasActiveFilters && <span className="w-1.5 h-1.5 rounded-full bg-mosque ml-0.5"></span>}
        </button>
      </div>

      <FilterModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        initialSearchQuery={modalInitialQuery}
      />
    </>
  );
}
