'use client';

import { useState, useTransition, useEffect } from 'react';
import Link from 'next/link';
import { togglePropertyVisibility } from '../../lib/actions/admin';

interface AdminProperty {
  id: string;
  title: string;
  location: string;
  price: string;
  price_numeric: number | null;
  tag: string | null;
  highlight_tag: string[] | string | null;
  tag_color: string | null;
  is_featured: boolean;
  is_favorite: boolean;
  beds: number;
  baths: number;
  area: string;
  slug: string | null;
  created_at: string;
  images?: string[];
  is_active?: boolean;
}

interface PropertiesTableProps {
  properties: AdminProperty[];
  lang: string;
}

export default function PropertiesTable({ properties, lang }: PropertiesTableProps) {
  const [items, setItems] = useState(properties);

  useEffect(() => {
    setItems(properties);
  }, [properties]);

  const [isPending, startTransition] = useTransition();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleToggleVisibility = (id: string, currentStatus: boolean | undefined) => {
    const isActive = currentStatus !== undefined ? currentStatus : true;
    setDeletingId(id);
    startTransition(async () => {
      const res = await togglePropertyVisibility(id, !isActive);
      if (res.success) {
        setItems((prev) => prev.map((p) => p.id === id ? { ...p, is_active: !isActive } : p));
      } else {
        alert(`Error: ${res.error}`);
      }
      setDeletingId(null);
    });
  };

  const getStatusDisplay = (tag: string | null) => {
    if (!tag) return { label: 'Active', classes: 'bg-hint-green text-primary border-primary/10', dot: 'bg-primary' };
    
    const t = tag.toLowerCase();
    if (t === 'for-sale') return { label: 'For Sale', classes: 'bg-hint-green text-primary border-primary/10', dot: 'bg-primary' };
    if (t === 'for-rent') return { label: 'For Rent', classes: 'bg-orange-100 text-orange-700 border-orange-200', dot: 'bg-orange-500' };
    if (t === 'sold') return { label: 'Sold', classes: 'bg-gray-100 text-gray-600 border-gray-200', dot: 'bg-gray-500' };
    
    // Fallback to the tag itself capitalized
    return { 
      label: tag.charAt(0).toUpperCase() + tag.slice(1), 
      classes: 'bg-gray-100 text-gray-600 border-gray-200', 
      dot: 'bg-gray-500' 
    };
  };

  return (
    <>
      {/* Table Header */}
      <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-4 bg-gray-50/50 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wider">
        <div className="col-span-6">Property Details</div>
        <div className="col-span-2">Price</div>
        <div className="col-span-2">Status</div>
        <div className="col-span-2 text-right">Actions</div>
      </div>

      {/* Property List Container */}
      <div className="divide-y divide-gray-100">
        {items.map((prop) => {
          const status = getStatusDisplay(prop.tag);
          const isDeleting = deletingId === prop.id;

          return (
            <div 
              key={prop.id} 
              className={`group grid grid-cols-1 md:grid-cols-12 gap-4 px-6 py-5 hover:bg-active-green transition-colors items-center ${isDeleting ? 'opacity-50' : ''} ${prop.is_active === false ? 'opacity-60 bg-gray-50/50' : ''}`}
            >
              {/* Property Details */}
              <div className="col-span-12 md:col-span-6 flex gap-4 items-center">
                <div className="relative h-20 w-28 flex-shrink-0 rounded-lg overflow-hidden bg-gray-200">
                  {prop.images?.[0] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img 
                      src={prop.images[0]} 
                      alt={prop.title} 
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" 
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-gray-400">
                      <span className="material-icons">image</span>
                    </div>
                  )}
                </div>
                <div>
                  <Link href={`/${lang}/properties/${prop.slug}`} target="_blank" className="text-lg font-bold text-nordic group-hover:text-primary transition-colors cursor-pointer block truncate max-w-sm">
                    {prop.title}
                  </Link>
                  <p className="text-sm text-gray-500 truncate max-w-sm">{prop.location}</p>
                  <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-400">
                    <span className="flex items-center gap-1"><span className="material-icons text-[14px]">bed</span> {prop.beds} Beds</span>
                    <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                    <span className="flex items-center gap-1"><span className="material-icons text-[14px]">bathtub</span> {prop.baths} Baths</span>
                    <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                    <span>{prop.area}</span>
                  </div>
                </div>
              </div>

              {/* Price */}
              <div className="col-span-6 md:col-span-2">
                <div className="text-base font-semibold text-nordic">{prop.price}</div>
                <div className="text-xs text-gray-400 mt-1 uppercase tracking-wider">{prop.is_featured ? 'Featured' : 'Standard'}</div>
              </div>

              {/* Status */}
              <div className="col-span-6 md:col-span-2 flex flex-col gap-1 items-start">
                {prop.is_active === false && (
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border bg-red-100 text-red-700 border-red-200">
                    <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-red-500"></span>
                    Deactivated
                  </span>
                )}
                {prop.tag && (
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${status.classes}`}>
                    <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${status.dot}`}></span>
                    {status.label}
                  </span>
                )}
                {prop.highlight_tag && (Array.isArray(prop.highlight_tag) ? prop.highlight_tag : [prop.highlight_tag]).map((ht, idx) => (
                  <span key={idx} className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border bg-primary/10 text-primary border-primary/10">
                    <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-primary"></span>
                    {ht.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                  </span>
                ))}
              </div>

              {/* Actions */}
              <div className="col-span-12 md:col-span-2 flex items-center justify-end gap-2">
                <Link 
                  href={`/${lang}/admin/properties/${prop.id}`}
                  className="p-2 rounded-lg text-gray-400 hover:text-primary hover:bg-hint-green/30 transition-all" 
                  title="Edit Property"
                >
                  <span className="material-icons text-xl">edit</span>
                </Link>
                <button 
                  onClick={() => handleToggleVisibility(prop.id, prop.is_active)}
                  disabled={isDeleting || isPending}
                  className="p-2 rounded-lg text-gray-400 hover:text-primary hover:bg-hint-green/30 transition-all disabled:opacity-50" 
                  title={prop.is_active === false ? "Activate Property" : "Deactivate Property"}
                >
                  <span className={`material-icons text-xl ${isDeleting ? 'animate-spin' : ''}`}>
                    {isDeleting ? 'refresh' : (prop.is_active === false ? 'visibility_off' : 'visibility')}
                  </span>
                </button>
              </div>
            </div>
          );
        })}

        {items.length === 0 && (
          <div className="py-16 text-center text-gray-500">
            <span className="material-icons text-4xl mb-3 block text-gray-300">home_work</span>
            No properties found.
          </div>
        )}
      </div>
    </>
  );
}
