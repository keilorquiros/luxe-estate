import AdminSidebar from '../../../components/admin/AdminSidebar';
import { createClient } from '../../../lib/supabase/server';
import { redirect } from 'next/navigation';
import type { Metadata } from 'next';

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

  return (
    <div className="flex min-h-screen bg-background-light">
      <AdminSidebar lang={lang} />

      <div className="flex-1 overflow-auto">
        {/* Top bar */}
        <header className="sticky top-0 z-10 bg-white/90 backdrop-blur-md border-b border-nordic-dark/10 px-8 py-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-nordic-muted uppercase tracking-widest font-medium">Panel de Administración</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full overflow-hidden ring-2 ring-nordic-dark/10">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={
                  user.user_metadata?.avatar_url ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(
                    user.email ?? 'A'
                  )}&background=006655&color=fff`
                }
                alt="Admin avatar"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <p className="text-xs font-semibold text-nordic-dark">
                {user.user_metadata?.full_name ?? user.email}
              </p>
              <p className="text-[10px] text-mosque font-medium uppercase tracking-wide">Admin</p>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-8">{children}</main>
      </div>
    </div>
  );
}
