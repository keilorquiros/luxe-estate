'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { locales, getLocaleDisplayName, getLocaleFlagCountryCode, Locale } from '../../lib/i18n-config';

function LocaleFlagImage({ locale, className }: { locale: string; className?: string }) {
  const code = getLocaleFlagCountryCode(locale);
  if (code === 'xx') {
    return (
      <span
        className={`inline-flex h-[15px] w-5 shrink-0 items-center justify-center rounded-sm bg-nordic-dark/10 text-[10px] font-semibold ${className ?? ''}`}
        aria-hidden
      >
        ··
      </span>
    );
  }
  return (
    <span
      className={`inline-flex shrink-0 overflow-hidden rounded-sm shadow-sm ring-1 ring-black/[0.06] ${className ?? ''}`}
      aria-hidden
    >
      {/* flagcdn raster flags — avoids broken Unicode flag emoji on Windows */}
      <img
        src={`https://flagcdn.com/w40/${code}.png`}
        srcSet={`https://flagcdn.com/w80/${code}.png 2x`}
        alt=""
        width={20}
        height={15}
        className="pointer-events-none block h-[15px] w-5 object-cover select-none"
        decoding="async"
        referrerPolicy="no-referrer"
      />
    </span>
  );
}

interface LanguageSelectorProps {
  currentLocale: Locale;
  dict: any;
}

export default function LanguageSelector({ currentLocale, dict }: LanguageSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLocaleChange = (newLocale: Locale) => {
    // Set cookie
    document.cookie = `NEXT_LOCALE=${newLocale};path=/;max-age=31536000;SameSite=Lax`;
    
    // Redirect to new path
    const pathParts = pathname.split('/');
    pathParts[1] = newLocale;
    const newPath = pathParts.join('/');
    
    router.push(newPath);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-nordic-dark/10 hover:border-mosque hover:bg-mosque/5 transition-all text-sm font-medium text-nordic-dark"
      >
        <LocaleFlagImage locale={currentLocale} />
        <span>{getLocaleDisplayName(currentLocale)}</span>
        <span className={`material-icons text-sm transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
          expand_more
        </span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white/80 backdrop-blur-md rounded-xl shadow-xl border border-nordic-dark/5 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="px-3 py-2 text-xs font-semibold text-nordic-muted uppercase tracking-wider">
            {dict.nav.language}
          </div>
          {locales.map((loc) => (
            <button
              key={loc}
              onClick={() => handleLocaleChange(loc)}
              className={`w-full flex items-center justify-between px-4 py-2.5 text-sm transition-colors hover:bg-mosque/5 ${
                currentLocale === loc ? 'text-mosque font-semibold bg-mosque/5' : 'text-nordic-dark'
              }`}
            >
              <span className="flex items-center gap-2 min-w-0">
                <LocaleFlagImage locale={loc} />
                <span>{getLocaleDisplayName(loc)}</span>
              </span>
              {currentLocale === loc && (
                <span className="material-icons text-sm">check</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
