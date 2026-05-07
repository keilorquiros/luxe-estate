import { createClient } from '../../../lib/supabase/server';
import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import AdminNavbar from '../../../components/admin/AdminNavbar';

export const metadata: Metadata = {
  title: 'Admin Panel | LuxeEstate',
};

// Force dynamic rendering — admin pages are never statically cached
export const dynamic = 'force-dynamic';

export default async function AdminLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;

  // Secondary guard (middleware is the primary guard)
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/${lang}/login`);
  }

  const { data: role } = await supabase.rpc('get_my_role');

  if (role !== 'admin') {
    redirect(`/${lang}`);
  }

  const currentUserData = {
    name: user.user_metadata?.full_name || user.email || 'Admin User',
    role: 'Administrator', // Since we checked role === 'admin' above
    avatar: user.user_metadata?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.email ?? 'A')}&background=006655&color=fff`,
  };

  return (
    <div className="flex min-h-screen bg-background-light dark:bg-background-dark font-display flex-col">
      <AdminNavbar lang={lang} currentUserData={currentUserData} />
      {/* Page content handles its own layout */}
      <div className="flex-1 overflow-auto flex flex-col">
        {children}
      </div>
    </div>
  );
}
