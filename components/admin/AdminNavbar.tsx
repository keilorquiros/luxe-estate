'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { createClient } from '../../lib/supabase/client';

interface AdminNavbarProps {
  lang: string;
  currentUserData: {
    name: string;
    role: string;
    avatar: string;
  } | null;
}

export default function AdminNavbar({ lang, currentUserData }: AdminNavbarProps) {
  const pathname = usePathname();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSignOut = async () => {
    try {
      supabase.auth.signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
    setTimeout(() => {
      window.location.href = `/${lang}`;
    }, 500);
  };

  const navLinks = [
    { name: 'Dashboard', href: `/${lang}/admin`, exact: true },
    { name: 'Listings', href: `/${lang}/admin/properties`, exact: false },
    { name: 'Users', href: `/${lang}/admin/users`, exact: false },
    { name: 'Finance', href: '#', exact: false },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-nordic/5 backdrop-blur-md bg-opacity-90">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo & Primary Nav */}
          <div className="flex">
            <Link href={`/${lang}/admin`} className="flex-shrink-0 flex items-center gap-2 cursor-pointer">
              <img src="/logo.svg" alt="LuxeEstate Logo" className="w-8 h-8" />
              <span className="font-bold text-xl tracking-tight text-nordic">LuxeEstate</span>
            </Link>
            <div className="hidden md:ml-10 md:flex md:space-x-8">
              {navLinks.map((link) => {
                const isActive = link.exact 
                  ? pathname === link.href 
                  : pathname.startsWith(link.href) && link.href !== '#';
                
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors ${
                      isActive
                        ? 'border-primary text-primary'
                        : 'border-transparent text-gray-500 hover:text-primary hover:border-primary/30'
                    }`}
                  >
                    {link.name}
                  </Link>
                );
              })}
            </div>
          </div>
          {/* Secondary Nav / Profile */}
          <div className="flex items-center gap-4">
            <button className="p-2 rounded-full text-gray-400 hover:text-primary hover:bg-primary/5 transition-colors">
              <span className="material-icons text-xl">notifications_none</span>
            </button>
            <div ref={dropdownRef} className="flex items-center gap-3 pl-4 border-l border-gray-200 relative">
              <div className="flex flex-col items-end hidden sm:flex">
                <span className="text-sm font-semibold text-nordic">{currentUserData?.name}</span>
                <span className="text-xs text-gray-500">{currentUserData?.role}</span>
              </div>
              <div 
                className="h-9 w-9 rounded-full bg-gray-200 overflow-hidden ring-2 ring-white hover:ring-primary cursor-pointer flex items-center justify-center transition-all duration-200 hover:scale-105"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                {currentUserData?.avatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={currentUserData.avatar} alt="User profile" className="h-full w-full object-cover" />
                ) : (
                  <span className="material-icons text-gray-400">person</span>
                )}
              </div>

              {/* Dropdown */}
              {isDropdownOpen && (
                <div className="absolute top-full right-0 mt-2 w-48 rounded-lg shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none overflow-hidden z-50 origin-top-right animate-in fade-in zoom-in-95 duration-100">
                  <div className="py-1" role="menu" aria-orientation="vertical">
                    <Link
                      href={`/${lang}`}
                      className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      role="menuitem"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      <span className="material-icons text-[18px] mr-2 text-gray-400">visibility</span>
                      Ir a la Página Principal
                    </Link>
                    <div className="border-t border-gray-100 my-1"></div>
                    <Link
                      href={`/${lang}/profile`}
                      className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      role="menuitem"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      <span className="material-icons text-[18px] mr-2 text-gray-400">person</span>
                      Mi Perfil
                    </Link>
                    <div className="border-t border-gray-100 my-1"></div>
                    <button
                      onClick={handleSignOut}
                      className="w-full flex items-center px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                      role="menuitem"
                    >
                      <span className="material-icons text-[18px] mr-2 text-red-500">logout</span>
                      Cerrar Sesión
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
