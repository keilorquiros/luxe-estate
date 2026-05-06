"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function FilterModal({ isOpen, onClose }: FilterModalProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [location, setLocation] = useState(searchParams.get("location") || "");
  const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") || "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") || "");
  const [propertyType, setPropertyType] = useState(searchParams.get("type") || "Any Type");
  const [beds, setBeds] = useState(parseInt(searchParams.get("beds") || "0", 10));
  const [baths, setBaths] = useState(parseInt(searchParams.get("baths") || "0", 10));
  
  const initialAmenities = searchParams.get("amenities") ? searchParams.get("amenities")!.split(",") : [];
  const [amenities, setAmenities] = useState<string[]>(initialAmenities);

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

  const toggleAmenity = (amenity: string) => {
    setAmenities(prev => 
      prev.includes(amenity) ? prev.filter(a => a !== amenity) : [...prev, amenity]
    );
  };

  const handleApply = () => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (location) params.set("location", location); else params.delete("location");
    if (minPrice) params.set("minPrice", minPrice); else params.delete("minPrice");
    if (maxPrice) params.set("maxPrice", maxPrice); else params.delete("maxPrice");
    if (propertyType && propertyType !== "Any Type") params.set("type", propertyType); else params.delete("type");
    if (beds > 0) params.set("beds", beds.toString()); else params.delete("beds");
    if (baths > 0) params.set("baths", baths.toString()); else params.delete("baths");
    if (amenities.length > 0) params.set("amenities", amenities.join(",")); else params.delete("amenities");
    
    params.set("page", "1"); // Reset pagination

    router.push(`/?${params.toString()}`, { scroll: false });
    onClose();
  };

  const clearFilters = () => {
    setLocation("");
    setMinPrice("");
    setMaxPrice("");
    setPropertyType("Any Type");
    setBeds(0);
    setBaths(0);
    setAmenities([]);
  };

  return (
    <>
      <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-40 transition-opacity" onClick={onClose}></div>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div className="w-full max-w-2xl bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] pointer-events-auto">
          {/* Header */}
          <header className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-30">
            <h1 className="text-2xl font-semibold tracking-tight text-gray-900">Filters</h1>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-500">
              <span className="material-icons">close</span>
            </button>
          </header>
          
          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-8 space-y-10 hide-scroll">
            
            {/* Location */}
            <section>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Location</label>
              <div className="relative group">
                <span className="material-icons absolute left-4 top-3.5 text-gray-400 group-focus-within:text-mosque transition-colors">location_on</span>
                <input 
                  className="w-full pl-12 pr-4 py-3 bg-background border-0 rounded-lg text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-mosque focus:bg-white transition-all shadow-sm" 
                  placeholder="City, neighborhood, or address" 
                  type="text" 
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                />
              </div>
            </section>

            {/* Price Range */}
            <section>
              <div className="flex justify-between items-end mb-4">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">Price Range</label>
                {(minPrice || maxPrice) && (
                  <span className="text-sm font-medium text-mosque">
                    {minPrice ? `$${parseInt(minPrice).toLocaleString()}` : "$0"} – {maxPrice ? `$${parseInt(maxPrice).toLocaleString()}` : "Any"}
                  </span>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-background p-3 rounded-lg border border-transparent focus-within:border-mosque/30 transition-colors">
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
                <div className="bg-background p-3 rounded-lg border border-transparent focus-within:border-mosque/30 transition-colors">
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
              {/* Property Type */}
              <div className="space-y-3">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">Property Type</label>
                <div className="relative">
                  <select 
                    className="w-full bg-background border-0 rounded-lg py-3 pl-4 pr-10 text-gray-900 appearance-none focus:ring-2 focus:ring-mosque cursor-pointer"
                    value={propertyType}
                    onChange={e => setPropertyType(e.target.value)}
                  >
                    <option>Any Type</option>
                    <option>House</option>
                    <option>Apartment</option>
                    <option>Condo</option>
                    <option>Townhouse</option>
                    <option>Villa</option>
                    <option>Penthouse</option>
                  </select>
                  <span className="material-icons absolute right-3 top-3 text-gray-400 pointer-events-none">expand_more</span>
                </div>
              </div>

              {/* Rooms */}
              <div className="space-y-4">
                {/* Beds */}
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-900">Bedrooms</span>
                  <div className="flex items-center space-x-3 bg-background rounded-full p-1">
                    <button 
                      onClick={() => setBeds(Math.max(0, beds - 1))}
                      className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center text-gray-500 hover:text-mosque disabled:opacity-50 transition-colors"
                    >
                      <span className="material-icons text-base">remove</span>
                    </button>
                    <span className="text-sm font-semibold w-4 text-center">{beds > 0 ? `${beds}+` : "Any"}</span>
                    <button 
                      onClick={() => setBeds(beds + 1)}
                      className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center text-mosque hover:bg-mosque hover:text-white transition-colors"
                    >
                      <span className="material-icons text-base">add</span>
                    </button>
                  </div>
                </div>

                {/* Baths */}
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-900">Bathrooms</span>
                  <div className="flex items-center space-x-3 bg-background rounded-full p-1">
                    <button 
                      onClick={() => setBaths(Math.max(0, baths - 1))}
                      className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center text-gray-500 hover:text-mosque disabled:opacity-50 transition-colors"
                    >
                      <span className="material-icons text-base">remove</span>
                    </button>
                    <span className="text-sm font-semibold w-4 text-center">{baths > 0 ? `${baths}+` : "Any"}</span>
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
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Amenities & Features</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {[
                  { id: "pool", label: "Swimming Pool", icon: "pool" },
                  { id: "gym", label: "Gym", icon: "fitness_center" },
                  { id: "parking", label: "Parking", icon: "local_parking" },
                  { id: "ac", label: "Air Conditioning", icon: "ac_unit" },
                  { id: "wifi", label: "High-speed Wifi", icon: "wifi" },
                  { id: "patio", label: "Patio / Terrace", icon: "deck" },
                ].map(amenity => {
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
                        {amenity.label}
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
              Clear all filters
            </button>
            <button 
              onClick={handleApply}
              className="bg-mosque hover:bg-mosque/90 text-white px-8 py-3 rounded-lg font-medium shadow-lg shadow-mosque/30 transition-all hover:shadow-mosque/40 flex items-center gap-2 transform active:scale-95"
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
