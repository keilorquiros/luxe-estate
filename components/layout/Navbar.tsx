'use client';

import Link from "next/link";
import { useState, useEffect } from "react";
import LanguageSelector from "../ui/LanguageSelector";
import { Locale } from "../../lib/i18n";
import { createClient } from "../../lib/supabase/client";
import { User } from "@supabase/supabase-js";

interface NavbarProps {
  lang?: Locale;
  dict?: any;
}

export default function Navbar({ lang = 'es', dict }: NavbarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const supabase = createClient();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  // If dict is not provided, we could fetch it, but better to pass it from server component
  // For now, if no dict, use fallback or limited UI
  
  return (
    <nav className="sticky top-0 z-50 bg-background-light/95 backdrop-blur-md border-b border-nordic-dark/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <Link href={`/${lang}`} className="flex-shrink-0 flex items-center gap-2 cursor-pointer">
            <div className="w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo.svg" alt="Luxe Estate Logo" className="w-full h-full object-contain" />
            </div>
            <span className="text-xl font-semibold tracking-tight text-nordic-dark">LuxeEstate</span>
          </Link>
          <div className="hidden lg:flex items-center space-x-8">
            <Link className="text-mosque font-medium text-sm border-b-2 border-mosque px-1 py-1" href={`/${lang}`}>{dict?.home?.filters?.buy || 'Buy'}</Link>
            <Link className="text-nordic-dark/70 hover:text-nordic-dark font-medium text-sm hover:border-b-2 hover:border-nordic-dark/20 px-1 py-1 transition-all" href={`/${lang}`}>{dict?.home?.filters?.rent || 'Rent'}</Link>
            <Link className="text-nordic-dark/70 hover:text-nordic-dark font-medium text-sm hover:border-b-2 hover:border-nordic-dark/20 px-1 py-1 transition-all" href={`/${lang}`}>{dict?.nav?.about || 'About'}</Link>
            <Link className="text-nordic-dark/70 hover:text-nordic-dark font-medium text-sm hover:border-b-2 hover:border-nordic-dark/20 px-1 py-1 transition-all" href={`/${lang}`}>{dict?.nav?.contact || 'Contact'}</Link>
          </div>
          <div className="flex items-center space-x-4 md:space-x-6">
            <div className="hidden sm:block">
              <LanguageSelector currentLocale={lang} dict={dict} />
            </div>
            <button className="text-nordic-dark hover:text-mosque transition-colors">
              <span className="material-icons">search</span>
            </button>
            <button className="text-nordic-dark hover:text-mosque transition-colors relative">
              <span className="material-icons">notifications_none</span>
              <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border-2 border-background-light"></span>
            </button>
            <div className="flex items-center gap-2 pl-2 border-l border-nordic-dark/10 ml-2">
              {user ? (
                <button 
                  onClick={handleSignOut}
                  title="Sign out"
                  className="w-9 h-9 rounded-full bg-gray-200 overflow-hidden ring-2 ring-transparent hover:ring-red-500 transition-all flex items-center justify-center group relative cursor-pointer"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    alt="Profile" 
                    className="w-full h-full object-cover group-hover:opacity-30 transition-opacity" 
                    src={user.user_metadata?.avatar_url || "https://ui-avatars.com/api/?name=" + (user.email || "User")} 
                  />
                  <span className="material-icons absolute opacity-0 group-hover:opacity-100 text-red-500 text-sm">logout</span>
                </button>
              ) : (
                <Link 
                  href={`/${lang}/login`}
                  className="flex items-center justify-center w-9 h-9 rounded-full text-nordic-dark hover:text-mosque hover:bg-mosque/5 transition-all"
                  title="Sign in"
                >
                  <span className="material-icons text-2xl">account_circle</span>
                </Link>
              )}
            </div>
            <button 
              className="lg:hidden flex items-center justify-center w-9 h-9 text-nordic-dark hover:text-mosque hover:bg-mosque/5 rounded-full transition-colors ml-2"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle menu"
            >
              <span className="material-icons">{isMobileMenuOpen ? 'close' : 'menu'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t border-nordic-dark/10 bg-background-light px-4 py-4 space-y-2 shadow-lg animate-in fade-in slide-in-from-top-2 duration-200">
          <Link 
            className="block text-mosque font-medium text-base hover:bg-mosque/5 px-3 py-2 rounded-lg transition-colors" 
            href={`/${lang}`}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            {dict?.home?.filters?.buy || 'Buy'}
          </Link>
          <Link 
            className="block text-nordic-dark/70 hover:text-nordic-dark font-medium text-base hover:bg-mosque/5 px-3 py-2 rounded-lg transition-colors" 
            href={`/${lang}`}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            {dict?.home?.filters?.rent || 'Rent'}
          </Link>
          <Link 
            className="block text-nordic-dark/70 hover:text-nordic-dark font-medium text-base hover:bg-mosque/5 px-3 py-2 rounded-lg transition-colors" 
            href={`/${lang}`}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            {dict?.nav?.about || 'About'}
          </Link>
          <Link 
            className="block text-nordic-dark/70 hover:text-nordic-dark font-medium text-base hover:bg-mosque/5 px-3 py-2 rounded-lg transition-colors" 
            href={`/${lang}`}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            {dict?.nav?.contact || 'Contact'}
          </Link>
        </div>
      )}
    </nav>
  );
}
