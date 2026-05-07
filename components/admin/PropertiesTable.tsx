'use client';

import { useState, useTransition } from 'react';
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
}

interface PropertiesTableProps {
  properties: AdminProperty[];
  lang: string;
}

const tagColors: Record<string, string> = {
  'for sale':    'bg-emerald-100 text-emerald-700',
  'for rent':    'bg-blue-100 text-blue-700',
  'exclusive':   'bg-purple-100 text-purple-700',
  'new arrival': 'bg-amber-100 text-amber-700',
};

export default function PropertiesTable({ properties, lang }: PropertiesTableProps) {
  const [items, setItems] = useState(properties);
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

  return (
    <div className="overflow-x-auto rounded-2xl border border-nordic-dark/10 bg-white shadow-sm">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="bg-background-light border-b border-nordic-dark/10">
            <th className="text-left px-5 py-3.5 font-semibold text-nordic-dark/60 uppercase text-xs tracking-wider">Propiedad</th>
            <th className="text-left px-5 py-3.5 font-semibold text-nordic-dark/60 uppercase text-xs tracking-wider">Ubicación</th>
            <th className="text-left px-5 py-3.5 font-semibold text-nordic-dark/60 uppercase text-xs tracking-wider">Precio</th>
            <th className="text-left px-5 py-3.5 font-semibold text-nordic-dark/60 uppercase text-xs tracking-wider">Estado</th>
            <th className="text-center px-5 py-3.5 font-semibold text-nordic-dark/60 uppercase text-xs tracking-wider">Dests.</th>
            <th className="text-left px-5 py-3.5 font-semibold text-nordic-dark/60 uppercase text-xs tracking-wider">Detalles</th>
            <th className="text-center px-5 py-3.5 font-semibold text-nordic-dark/60 uppercase text-xs tracking-wider">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-nordic-dark/5">
          {items.map((prop) => (
            <tr
              key={prop.id}
              className="hover:bg-background-light/50 transition-colors group"
            >
              {/* Title */}
              <td className="px-5 py-4 max-w-[220px]">
                <p className="font-medium text-nordic-dark truncate">{prop.title}</p>
                <p className="text-xs text-nordic-muted mt-0.5">
                  {new Date(prop.created_at).toLocaleDateString('es-ES')}
                </p>
              </td>

              {/* Location */}
              <td className="px-5 py-4 text-nordic-muted whitespace-nowrap">{prop.location}</td>

              {/* Price */}
              <td className="px-5 py-4 text-nordic-dark font-semibold whitespace-nowrap">
                {prop.price}
              </td>

              {/* Tag */}
              <td className="px-5 py-4">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    tagColors[prop.tag] ?? 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {prop.tag.toUpperCase()}
                </span>
              </td>

              {/* Featured */}
              <td className="px-5 py-4 text-center">
                <span
                  className={`material-icons text-[18px] ${
                    prop.is_featured ? 'text-mosque' : 'text-nordic-dark/20'
                  }`}
                >
                  {prop.is_featured ? 'star' : 'star_outline'}
                </span>
              </td>

              {/* Beds/Baths/Area */}
              <td className="px-5 py-4 text-nordic-muted text-xs whitespace-nowrap">
                <span className="flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <span className="material-icons text-[14px]">bed</span>{prop.beds}
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="material-icons text-[14px]">bathtub</span>{prop.baths}
                  </span>
                  <span>{prop.area}</span>
                </span>
              </td>

              {/* Actions */}
              <td className="px-5 py-4 text-center">
                <div className="flex items-center justify-center gap-2">
                  {prop.slug && (
                    <Link
                      href={`/${lang}/properties/${prop.slug}`}
                      target="_blank"
                      title="Ver propiedad"
                      className="w-8 h-8 flex items-center justify-center rounded-lg text-nordic-muted hover:text-mosque hover:bg-mosque/10 transition-all"
                    >
                      <span className="material-icons text-[18px]">open_in_new</span>
                    </Link>
                  )}
                  <button
                    onClick={() => handleDelete(prop.id)}
                    disabled={isPending && deletingId === prop.id}
                    title="Eliminar propiedad"
                    className="w-8 h-8 flex items-center justify-center rounded-lg text-nordic-muted hover:text-red-600 hover:bg-red-50 transition-all disabled:opacity-40"
                  >
                    <span className="material-icons text-[18px]">
                      {deletingId === prop.id ? 'hourglass_empty' : 'delete_outline'}
                    </span>
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {items.length === 0 && (
        <div className="py-16 text-center text-nordic-muted">
          <span className="material-icons text-4xl mb-3 block">home_work</span>
          No hay propiedades
        </div>
      )}
    </div>
  );
}
