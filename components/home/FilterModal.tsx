"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Locale } from "../../lib/i18n";

const PROPERTY_TYPE_VALUES = ["any type", "house", "apartment", "condo", "townhouse", "villa", "penthouse"] as const;
const STATUS_TAG_VALUES = ["any status", "for-sale", "for-rent", "sold"] as const;
const HIGHLIGHT_TAG_VALUES = ["any highlight", "exclusive", "new-arrival"] as const;

const formatTag = (tag: string) => {
  if (tag.startsWith('any')) return tag.charAt(0).toUpperCase() + tag.slice(1);
  return tag
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const AMENITY_ITEMS = [
  { id: "pool", icon: "pool" },
  { id: "gym", icon: "fitness_center" },
  { id: "parking", icon: "local_parking" },
  { id: "ac", icon: "ac_unit" },
  { id: "wifi", icon: "wifi" },
  { id: "patio", icon: "deck" },
] as const;

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialSearchQuery?: string;
  lang: Locale;
  dict: Record<string, unknown>;
}

export default function FilterModal({ isOpen, onClose, initialSearchQuery, lang, dict }: FilterModalProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [searchQuery, setSearchQuery] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [propertyType, setPropertyType] = useState("any type");
  const [tag, setTag] = useState("any status");
  const [highlightTag, setHighlightTag] = useState("any highlight");
  const [beds, setBeds] = useState(0);
  const [baths, setBaths] = useState(0);
  const [amenities, setAmenities] = useState<string[]>([]);

  // Sync internal state with external query when modal opens
  useEffect(() => {
    if (isOpen) {
      setSearchQuery(initialSearchQuery || searchParams.get("q") || "");
      setMinPrice(searchParams.get("minPrice") || "");
      setMaxPrice(searchParams.get("maxPrice") || "");
      setPropertyType(searchParams.get("type") || "any type");
      setTag(searchParams.get("tag") || "any status");
      setHighlightTag(searchParams.get("highlightTag") || "any highlight");
      setBeds(parseInt(searchParams.get("beds") || "0", 10));
      setBaths(parseInt(searchParams.get("baths") || "0", 10));
      const urlAmenities = searchParams.get("amenities") ? searchParams.get("amenities")!.split(",") : [];
      setAmenities(urlAmenities);
    }
  }, [isOpen, initialSearchQuery, searchParams]);

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

  const home = dict.home as Record<string, unknown>;
  const fm = home.filter_modal as {
    title: string;
    search_keyword: string;
    search_placeholder: string;
    price_range: string;
    any: string;
    min_price: string;
    max_price: string;
    property_type: string;
    bedrooms: string;
    bathrooms: string;
    amenities_heading: string;
    clear_all: string;
    show_results: string;
    property_types: Record<string, string>;
    tag: string;
    tags: Record<string, string>;
    amenities: Record<string, string>;
  };

  const toggleAmenity = (amenity: string) => {
    setAmenities(prev => 
      prev.includes(amenity) ? prev.filter(a => a !== amenity) : [...prev, amenity]
    );
  };

  const handleApply = () => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (searchQuery) params.set("q", searchQuery); else params.delete("q");
    if (minPrice) params.set("minPrice", minPrice); else params.delete("minPrice");
    if (maxPrice) params.set("maxPrice", maxPrice); else params.delete("maxPrice");
    if (propertyType && propertyType !== "any type") params.set("type", propertyType); else params.delete("type");
    if (tag && tag !== "any status" && tag !== "any tag") params.set("tag", tag); else params.delete("tag");
    if (highlightTag && highlightTag !== "any highlight") params.set("highlightTag", highlightTag); else params.delete("highlightTag");
    if (beds > 0) params.set("beds", beds.toString()); else params.delete("beds");
    if (baths > 0) params.set("baths", baths.toString()); else params.delete("baths");
    if (amenities.length > 0) params.set("amenities", amenities.join(",")); else params.delete("amenities");
    
    params.set("page", "1"); // Reset pagination

    router.push(`/${lang}?${params.toString()}#market-section`, { scroll: true });
    onClose();
  };

  const clearFilters = () => {
    setSearchQuery("");
    setMinPrice("");
    setMaxPrice("");
    setPropertyType("any type");
    setTag("any status");
    setHighlightTag("any highlight");
    setBeds(0);
    setBaths(0);
    setAmenities([]);

    // Navegar a la raíz con el idioma pero sin parámetros (excepto página 1) y cerrar modal
    router.push(`/${lang}#market-section`, { scroll: true });
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-40 transition-opacity" onClick={onClose}></div>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div className="w-full max-w-2xl bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] pointer-events-auto">
          {/* Header */}
          <header className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-30">
            <h1 className="text-2xl font-semibold tracking-tight text-gray-900">{fm.title}</h1>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-500">
              <span className="material-icons">close</span>
            </button>
          </header>
          
          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-8 space-y-10 hide-scroll">
            
            {/* Search Keyword */}
            <section>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">{fm.search_keyword}</label>
              <div className="relative group">
                <span className="material-icons absolute left-4 top-3.5 text-gray-400 group-focus-within:text-mosque transition-colors">search</span>
                <input 
                  className="w-full pl-12 pr-4 py-3 bg-background border-0 rounded-lg text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-mosque focus:bg-white transition-all shadow-sm" 
                  placeholder={fm.search_placeholder} 
                  type="text" 
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
              </div>
            </section>

            {/* Price Range */}
            <section>
              <div className="flex justify-between items-end mb-4">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">{fm.price_range}</label>
                {(minPrice || maxPrice) && (
                  <span className="text-sm font-medium text-mosque">
                    {minPrice ? `$${parseInt(minPrice).toLocaleString()}` : "$0"} – {maxPrice ? `$${parseInt(maxPrice).toLocaleString()}` : fm.any}
                  </span>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-background p-3 rounded-lg border border-transparent focus-within:border-mosque/30 transition-colors">
                  <label className="block text-[10px] text-gray-500 uppercase font-medium mb-1">{fm.min_price}</label>
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
                <div className="bg-background p-3 rounded-lg border border-transparent focus-within:border-mosque/30 transition-colors">
                  <label className="block text-[10px] text-gray-500 uppercase font-medium mb-1">{fm.max_price}</label>
                  <div className="flex items-center">
                    <span className="text-gray-400 mr-1">$</span>
                    <input 
                      className="w-full bg-transparent border-0 p-0 text-gray-900 font-medium focus:ring-0 text-sm" 
                      type="number" 
                      placeholder={fm.any}
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
                {/* Property Type */}
                <div className="space-y-3">
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">{fm.property_type}</label>
                  <div className="relative">
                    <select 
                      className="w-full bg-background border-0 rounded-lg py-3 pl-4 pr-10 text-gray-900 appearance-none focus:ring-2 focus:ring-mosque cursor-pointer"
                      value={propertyType}
                      onChange={e => setPropertyType(e.target.value)}
                    >
                      {PROPERTY_TYPE_VALUES.map((value) => (
                        <option key={value} value={value}>
                          {fm.property_types[value] ?? value}
                        </option>
                      ))}
                    </select>
                    <span className="material-icons absolute right-3 top-3 text-gray-400 pointer-events-none">expand_more</span>
                  </div>
                </div>

                {/* Status / Tag */}
                <div className="space-y-3">
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</label>
                  <div className="relative">
                    <select 
                      className="w-full bg-background border-0 rounded-lg py-3 pl-4 pr-10 text-gray-900 appearance-none focus:ring-2 focus:ring-mosque cursor-pointer capitalize"
                      value={tag}
                      onChange={e => setTag(e.target.value)}
                    >
                      {STATUS_TAG_VALUES.map((value) => (
                        <option key={value} value={value}>
                          {formatTag(value)}
                        </option>
                      ))}
                    </select>
                    <span className="material-icons absolute right-3 top-3 text-gray-400 pointer-events-none">expand_more</span>
                  </div>
                </div>

                {/* Highlight Tag */}
                <div className="space-y-3">
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">Highlight</label>
                  <div className="relative">
                    <select 
                      className="w-full bg-background border-0 rounded-lg py-3 pl-4 pr-10 text-gray-900 appearance-none focus:ring-2 focus:ring-mosque cursor-pointer capitalize"
                      value={highlightTag}
                      onChange={e => setHighlightTag(e.target.value)}
                    >
                      {HIGHLIGHT_TAG_VALUES.map((value) => (
                        <option key={value} value={value}>
                          {formatTag(value)}
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
                  <span className="text-sm font-medium text-gray-900">{fm.bedrooms}</span>
                  <div className="flex items-center space-x-3 bg-background rounded-full p-1">
                    <button 
                      onClick={() => setBeds(Math.max(0, beds - 1))}
                      className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center text-gray-500 hover:text-mosque disabled:opacity-50 transition-colors"
                    >
                      <span className="material-icons text-base">remove</span>
                    </button>
                    <span className="text-sm font-semibold min-w-[4rem] text-center tabular-nums">{beds > 0 ? `${beds}+` : fm.any}</span>
                    <button 
                      onClick={() => setBeds(beds + 1)}
                      className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center text-mosque hover:bg-mosque hover:text-white transition-colors"
                    >
                      <span className="material-icons text-base">add</span>
                    </button>
                  </div>
                </div>

                {/* Bathrooms */}
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-900">{fm.bathrooms}</span>
                  <div className="flex items-center space-x-3 bg-background rounded-full p-1">
                    <button 
                      onClick={() => setBaths(Math.max(0, baths - 1))}
                      className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center text-gray-500 hover:text-mosque disabled:opacity-50 transition-colors"
                    >
                      <span className="material-icons text-base">remove</span>
                    </button>
                    <span className="text-sm font-semibold min-w-[4rem] text-center tabular-nums">{baths > 0 ? `${baths}+` : fm.any}</span>
                    <button 
                      onClick={() => setBaths(baths + 1)}
                      className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center text-mosque hover:bg-mosque hover:text-white transition-colors"
                    >
                      <span className="material-icons text-base">add</span>
                    </button>
                  </div>
                </div>
              </div>
            </section>

            {/* Amenities */}
            <section>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">{fm.amenities_heading}</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {AMENITY_ITEMS.map((amenity) => {
                  const isSelected = amenities.includes(amenity.id);
                  return (
                    <label key={amenity.id} className="cursor-pointer group relative">
                      <input 
                        type="checkbox" 
                        className="peer sr-only" 
                        checked={isSelected}
                        onChange={() => toggleAmenity(amenity.id)}
                      />
                      <div className={`h-full px-4 py-3 rounded-lg border text-sm flex items-center justify-center gap-2 transition-all ${
                        isSelected 
                          ? "border-mosque bg-mosque/5 text-mosque font-medium hover:bg-mosque/10" 
                          : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                      }`}>
                        <span className={`material-icons text-lg ${isSelected ? "" : "text-gray-400 group-hover:text-gray-500"}`}>
                          {amenity.icon}
                        </span>
                        {fm.amenities[amenity.id] ?? amenity.id}
                      </div>
                      {isSelected && (
                        <div className="absolute top-2 right-2 w-2 h-2 bg-mosque rounded-full opacity-100 transition-opacity"></div>
                      )}
                    </label>
                  );
                })}
              </div>
            </section>
          </div>
          
          {/* Footer */}
          <footer className="bg-white border-t border-gray-100 px-8 py-6 sticky bottom-0 z-30 flex items-center justify-between">
            <button 
              onClick={clearFilters}
              className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors underline decoration-gray-300 underline-offset-4"
            >
              {fm.clear_all}
            </button>
            <button 
              onClick={handleApply}
              className="bg-mosque hover:bg-mosque/90 text-white px-8 py-3 rounded-lg font-medium shadow-lg shadow-mosque/30 transition-all hover:shadow-mosque/40 flex items-center gap-2 transform active:scale-95"
            >
              {fm.show_results}
              <span className="material-icons text-sm">arrow_forward</span>
            </button>
          </footer>
        </div>
      </div>
    </>
  );
}
