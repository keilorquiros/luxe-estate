'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

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

  const navLinks = [
    { name: 'Dashboard', href: `/${lang}/admin`, exact: true },
    { name: 'Listings', href: `/${lang}/admin/properties`, exact: false },
    { name: 'Users', href: `/${lang}/admin/users`, exact: false },
    { name: 'Finance', href: '#', exact: false },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-white dark:bg-[#152e2a] border-b border-mosque/10 dark:border-mosque/20 backdrop-blur-md bg-opacity-90">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo & Primary Nav */}
          <div className="flex">
            <Link href={`/${lang}/admin`} className="flex-shrink-0 flex items-center gap-2 cursor-pointer">
              <img src="/logo.svg" alt="LuxeEstate Logo" className="w-8 h-8" />
              <span className="font-bold text-xl tracking-tight text-nordic-dark dark:text-white">LuxeEstate</span>
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
                        ? 'border-mosque text-nordic-dark dark:text-white'
                        : 'border-transparent text-gray-500 hover:text-mosque hover:border-mosque/30 dark:text-gray-400'
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
            <button className="p-2 rounded-full text-gray-400 hover:text-mosque hover:bg-mosque/5 transition-colors">
              <span className="material-icons text-xl">notifications_none</span>
            </button>
            <div className="flex items-center gap-3 pl-4 border-l border-gray-200 dark:border-gray-700">
              <div className="flex flex-col items-end hidden sm:flex">
                <span className="text-sm font-semibold text-nordic-dark dark:text-white">{currentUserData?.name}</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">{currentUserData?.role}</span>
              </div>
              <div className="h-9 w-9 rounded-full bg-gray-200 overflow-hidden ring-2 ring-white dark:ring-mosque/20 cursor-pointer flex items-center justify-center">
                {currentUserData?.avatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={currentUserData.avatar} alt="User profile" className="h-full w-full object-cover" />
                ) : (
                  <span className="material-icons text-gray-400">person</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
