'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface AdminSidebarProps {
  lang: string;
}

const navItems = [
  { href: 'properties', label: 'Propiedades', icon: 'home_work' },
  { href: 'users', label: 'Usuarios', icon: 'manage_accounts' },
];

export default function AdminSidebar({ lang }: AdminSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="w-64 min-h-screen bg-nordic text-white flex flex-col">
      {/* Brand */}
      <div className="px-6 py-6 border-b border-white/10">
        <Link href={`/${lang}`} className="flex items-center gap-2 group">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.svg" alt="Logo" className="w-7 h-7 invert brightness-200" />
          <div>
            <p className="text-sm font-semibold tracking-wide">LuxeEstate</p>
            <p className="text-[10px] text-white/40 uppercase tracking-widest">Admin Panel</p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-6 space-y-1">
        {navItems.map((item) => {
          const href = `/${lang}/admin/${item.href}`;
          const isActive = pathname.startsWith(href);
          return (
            <Link
              key={item.href}
              href={href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-150 ${
                isActive
                  ? 'bg-mosque text-white shadow-lg shadow-mosque/30'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              <span className="material-icons text-[20px]">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-white/10">
        <Link
          href={`/${lang}`}
          className="flex items-center gap-2 text-white/40 hover:text-white/70 text-xs transition-colors"
        >
          <span className="material-icons text-[16px]">arrow_back</span>
          Volver al sitio
        </Link>
      </div>
    </aside>
  );
}
