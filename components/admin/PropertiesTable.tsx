'use client';

import { useState, useTransition, useEffect } from 'react';
import Link from 'next/link';
import { deleteProperty } from '../../lib/actions/admin';

interface AdminProperty {
  id: string;
  title: string;
  location: string;
  price: string;
  price_numeric: number | null;
  tag: string;
  tag_color: string | null;
  is_featured: boolean;
  is_favorite: boolean;
  beds: number;
  baths: number;
  area: string;
  slug: string | null;
  created_at: string;
  images?: string[];
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

  const handleDelete = (id: string) => {
    if (!confirm('¿Eliminar esta propiedad? Esta acción no se puede deshacer.')) return;
    setDeletingId(id);
    startTransition(async () => {
      const res = await deleteProperty(id);
      if (res.success) {
        setItems((prev) => prev.filter((p) => p.id !== id));
      } else {
        alert(`Error: ${res.error}`);
      }
      setDeletingId(null);
    });
  };

  const getStatusDisplay = (tag: string) => {
    const t = tag.toLowerCase();
    if (t === 'for sale') return { label: 'For Sale', classes: 'bg-hint-green text-primary border-primary/10', dot: 'bg-primary' };
    if (t === 'for rent') return { label: 'For Rent', classes: 'bg-orange-100 text-orange-700 border-orange-200', dot: 'bg-orange-500' };
    if (t === 'sold') return { label: 'Sold', classes: 'bg-gray-100 text-gray-600 border-gray-200', dot: 'bg-gray-500' };
    return { label: 'Active', classes: 'bg-hint-green text-primary border-primary/10', dot: 'bg-primary' };
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
              className={`group grid grid-cols-1 md:grid-cols-12 gap-4 px-6 py-5 hover:bg-background-light transition-colors items-center ${isDeleting ? 'opacity-50' : ''}`}
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
              <div className="col-span-6 md:col-span-2">
                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${status.classes}`}>
                  <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${status.dot}`}></span>
                  {status.label}
                </span>
              </div>

              {/* Actions */}
              <div className="col-span-12 md:col-span-2 flex items-center justify-end gap-2">
                <button 
                  className="p-2 rounded-lg text-gray-400 hover:text-primary hover:bg-hint-green/30 transition-all" 
                  title="Edit Property"
                >
                  <span className="material-icons text-xl">edit</span>
                </button>
                <button 
                  onClick={() => handleDelete(prop.id)}
                  disabled={isDeleting || isPending}
                  className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all disabled:opacity-50" 
                  title="Delete Property"
                >
                  <span className={`material-icons text-xl ${isDeleting ? 'animate-spin' : ''}`}>
                    {isDeleting ? 'refresh' : 'delete_outline'}
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
