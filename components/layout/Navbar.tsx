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
  const [isAdmin, setIsAdmin] = useState(false);
  const supabase = createClient();

  const checkRole = async (userId: string | undefined) => {
    if (!userId) { setIsAdmin(false); return; }
    const { data } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .single();
    setIsAdmin(data?.role === 'admin');
  };

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      await checkRole(user?.id);
    };
    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setUser(session?.user ?? null);
        await checkRole(session?.user?.id);
      }
    );

    return () => subscription.unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
            {isAdmin && (
              <Link
                href={`/${lang}/admin`}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-mosque/10 text-mosque hover:bg-mosque hover:text-white font-medium text-sm transition-all"
              >
                <span className="material-icons text-[16px]">admin_panel_settings</span>
                Admin
              </Link>
            )}
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
            <div className="flex items-center gap-1 pl-2 border-l border-nordic-dark/10 ml-2">
              {user ? (
                <>
                  {/* Avatar → future profile page */}
                  <Link
                    href={`/${lang}/profile`}
                    title={user.user_metadata?.full_name || user.email || 'Profile'}
                    className="w-9 h-9 rounded-full overflow-hidden ring-2 ring-transparent hover:ring-mosque transition-all flex-shrink-0"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      alt="Profile"
                      className="w-full h-full object-cover"
                      src={user.user_metadata?.avatar_url || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(user.email || 'User')}
                    />
                  </Link>
                  {/* Sign Out button */}
                  <button
                    onClick={handleSignOut}
                    title={dict?.nav?.logout || 'Sign out'}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-nordic-dark/60 hover:text-red-600 hover:bg-red-50 transition-all text-sm font-medium"
                  >
                    <span className="material-icons text-[18px]">logout</span>
                    <span className="hidden sm:block">{dict?.nav?.logout || 'Sign out'}</span>
                  </button>
                </>
              ) : (
                <Link
                  href={`/${lang}/login`}
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-mosque text-white hover:bg-mosque/90 transition-all shadow-sm"
                  title={dict?.nav?.login || 'Sign in'}
                >
                  <span className="material-icons text-[20px] hidden sm:block">login</span>
                  <span className="text-sm font-medium">{dict?.nav?.login || 'Sign In'}</span>
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
          {isAdmin && (
            <Link 
              className="flex items-center gap-2 text-mosque font-medium text-base hover:bg-mosque/5 px-3 py-2 rounded-lg transition-colors" 
              href={`/${lang}/admin`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <span className="material-icons text-[18px]">admin_panel_settings</span>
              Admin Panel
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}
