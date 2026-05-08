'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

interface AdminFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: string;
}

const TAG_VALUES = ["any tag", "for sale", "for rent", "exclusive", "new arrival"] as const;

export default function AdminFilterModal({ isOpen, onClose, lang }: AdminFilterModalProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [searchQuery, setSearchQuery] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [tag, setTag] = useState("any tag");
  const [beds, setBeds] = useState(0);
  const [baths, setBaths] = useState(0);

  // Sync internal state with external query when modal opens
  useEffect(() => {
    if (isOpen) {
      setSearchQuery(searchParams.get("search") || "");
      setMinPrice(searchParams.get("minPrice") || "");
      setMaxPrice(searchParams.get("maxPrice") || "");
      setTag(searchParams.get("tag") || "any tag");
      setBeds(parseInt(searchParams.get("beds") || "0", 10));
      setBaths(parseInt(searchParams.get("baths") || "0", 10));
    }
  }, [isOpen, searchParams]);

  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleApply = () => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (searchQuery) params.set("search", searchQuery); else params.delete("search");
    if (minPrice) params.set("minPrice", minPrice); else params.delete("minPrice");
    if (maxPrice) params.set("maxPrice", maxPrice); else params.delete("maxPrice");
    if (tag && tag !== "any tag") params.set("tag", tag); else params.delete("tag");
    if (beds > 0) params.set("beds", beds.toString()); else params.delete("beds");
    if (baths > 0) params.set("baths", baths.toString()); else params.delete("baths");
    
    params.set("page", "1"); // Reset pagination

    router.push(`/${lang}/admin/properties?${params.toString()}`, { scroll: false });
    onClose();
  };

  const clearFilters = () => {
    setSearchQuery("");
    setMinPrice("");
    setMaxPrice("");
    setTag("any tag");
    setBeds(0);
    setBaths(0);

    router.push(`/${lang}/admin/properties`, { scroll: false });
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-40 transition-opacity" onClick={onClose}></div>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div className="w-full max-w-2xl bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] pointer-events-auto">
          {/* Header */}
          <header className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-30">
            <h1 className="text-2xl font-semibold tracking-tight text-gray-900">Filter Properties</h1>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-500">
              <span className="material-icons">close</span>
            </button>
          </header>
          
          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-8 space-y-10 hide-scroll">
            
            {/* Search Keyword */}
            <section>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Search Keyword</label>
              <div className="relative group">
                <span className="material-icons absolute left-4 top-3.5 text-gray-400 group-focus-within:text-primary transition-colors">search</span>
                <input 
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border-0 rounded-lg text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-primary focus:bg-white transition-all shadow-sm" 
                  placeholder="Search by title..." 
                  type="text" 
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
              </div>
            </section>

            {/* Price Range */}
            <section>
              <div className="flex justify-between items-end mb-4">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">Price Range</label>
                {(minPrice || maxPrice) && (
                  <span className="text-sm font-medium text-primary">
                    {minPrice ? `$${parseInt(minPrice).toLocaleString()}` : "$0"} – {maxPrice ? `$${parseInt(maxPrice).toLocaleString()}` : "Any"}
                  </span>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-3 rounded-lg border border-transparent focus-within:border-primary/30 transition-colors">
                  <label className="block text-[10px] text-gray-500 uppercase font-medium mb-1">Min Price</label>
                  <div className="flex items-center">
                    <span className="text-gray-400 mr-1">$</span>
                    <input 
                      className="w-full bg-transparent border-0 p-0 text-gray-900 font-medium focus:ring-0 text-sm" 
                      type="number" 
                      placeholder="0"
                      value={minPrice}
                      onChange={e => setMinPrice(e.target.value)}
                    />
                  </div>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg border border-transparent focus-within:border-primary/30 transition-colors">
                  <label className="block text-[10px] text-gray-500 uppercase font-medium mb-1">Max Price</label>
                  <div className="flex items-center">
                    <span className="text-gray-400 mr-1">$</span>
                    <input 
                      className="w-full bg-transparent border-0 p-0 text-gray-900 font-medium focus:ring-0 text-sm" 
                      type="number" 
                      placeholder="Any"
                      value={maxPrice}
                      onChange={e => setMaxPrice(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* Property Details */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                {/* Status / Tag */}
                <div className="space-y-3">
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</label>
                  <div className="relative">
                    <select 
                      className="w-full bg-gray-50 border-0 rounded-lg py-3 pl-4 pr-10 text-gray-900 appearance-none focus:ring-2 focus:ring-primary cursor-pointer capitalize"
                      value={tag}
                      onChange={e => setTag(e.target.value)}
                    >
                      {TAG_VALUES.map((value) => (
                        <option key={value} value={value}>
                          {value.charAt(0).toUpperCase() + value.slice(1)}
                        </option>
                      ))}
                    </select>
                    <span className="material-icons absolute right-3 top-3 text-gray-400 pointer-events-none">expand_more</span>
                  </div>
                </div>
              </div>

              {/* Rooms */}
              <div className="space-y-4">
                {/* Bedrooms */}
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-900">Bedrooms</span>
                  <div className="flex items-center space-x-3 bg-gray-50 rounded-full p-1">
                    <button 
                      onClick={() => setBeds(Math.max(0, beds - 1))}
                      className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center text-gray-500 hover:text-primary disabled:opacity-50 transition-colors"
                    >
                      <span className="material-icons text-base">remove</span>
                    </button>
                    <span className="text-sm font-semibold min-w-[4rem] text-center tabular-nums">{beds > 0 ? `${beds}+` : "Any"}</span>
                    <button 
                      onClick={() => setBeds(beds + 1)}
                      className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-colors"
                    >
                      <span className="material-icons text-base">add</span>
                    </button>
                  </div>
                </div>

                {/* Bathrooms */}
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-900">Bathrooms</span>
                  <div className="flex items-center space-x-3 bg-gray-50 rounded-full p-1">
                    <button 
                      onClick={() => setBaths(Math.max(0, baths - 1))}
                      className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center text-gray-500 hover:text-primary disabled:opacity-50 transition-colors"
                    >
                      <span className="material-icons text-base">remove</span>
                    </button>
                    <span className="text-sm font-semibold min-w-[4rem] text-center tabular-nums">{baths > 0 ? `${baths}+` : "Any"}</span>
                    <button 
                      onClick={() => setBaths(baths + 1)}
                      className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-colors"
                    >
                      <span className="material-icons text-base">add</span>
                    </button>
                  </div>
                </div>
              </div>
            </section>
          </div>
          
          {/* Footer */}
          <footer className="bg-white border-t border-gray-100 px-8 py-6 sticky bottom-0 z-30 flex items-center justify-between">
            <button 
              onClick={clearFilters}
              className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors underline decoration-gray-300 underline-offset-4"
            >
              Clear All
            </button>
            <button 
              onClick={handleApply}
              className="bg-primary hover:bg-primary/90 text-white px-8 py-3 rounded-lg font-medium shadow-lg shadow-primary/30 transition-all hover:shadow-primary/40 flex items-center gap-2 transform active:scale-95"
            >
              Show Results
              <span className="material-icons text-sm">arrow_forward</span>
            </button>
          </footer>
        </div>
      </div>
    </>
  );
}
