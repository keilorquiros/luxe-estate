import { getUsersWithRoles } from '../../../../lib/actions/admin';
import UsersTable from '../../../../components/admin/UsersTable';
import Footer from '../../../../components/layout/Footer';
import { createClient } from '../../../../lib/supabase/server';
import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'User Directory | Admin — LuxeEstate',
};

export const dynamic = 'force-dynamic';

export default async function AdminUsersPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ role?: string }>;
}) {
  const { lang } = await params;
  const { role } = await searchParams;
  const users = await getUsersWithRoles();
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const currentUserId = user?.id;

  // Move current user to top
  const sortedUsers = [...users].sort((a, b) => {
    if (a.id === currentUserId) return -1;
    if (b.id === currentUserId) return 1;
    return 0;
  });

  // Filter by role
  const filteredUsers = role 
    ? sortedUsers.filter((u) => u.role === role) 
    : sortedUsers;

  const currentUserData = user ? {
    name: user.user_metadata?.full_name || user.email || 'Admin User',
    avatar: user.user_metadata?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.email ?? 'A')}&background=006655&color=fff`,
  } : null;

  return (
    <div className="flex-grow flex flex-col w-full min-h-screen bg-background-light text-nordic font-display antialiased">
      <header className="w-full pt-8 pb-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-nordic">User Directory</h1>
            <p className="text-nordic/60 mt-1 text-sm">Manage user access and roles for your properties.</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <div className="relative group w-full md:w-80">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="material-icons text-nordic/40 group-focus-within:text-primary text-xl">search</span>
              </div>
              <input 
                className="block w-full pl-10 pr-3 py-2.5 border border-transparent rounded-lg bg-white text-nordic shadow-soft placeholder-nordic/30 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all text-sm outline-none" 
                placeholder="Search by name, email..." 
                type="text"
              />
            </div>
            <button className="inline-flex items-center justify-center px-4 py-2.5 border border-primary text-sm font-medium rounded-lg text-primary bg-transparent hover:bg-primary/5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors whitespace-nowrap">
              <span className="material-icons text-lg mr-2">add</span>
              Add User
            </button>
          </div>
        </div>
        <div className="mt-8 flex gap-6 border-b border-nordic/10 overflow-x-auto hide-scroll">
          <Link 
            href={`/${lang}/admin/users`}
            className={`pb-3 text-sm font-medium whitespace-nowrap ${!role ? 'text-primary border-b-2 border-primary font-semibold' : 'text-nordic/60 hover:text-nordic'}`}
          >
            All Users
          </Link>
          <Link 
            href={`/${lang}/admin/users?role=agent`}
            className={`pb-3 text-sm font-medium whitespace-nowrap ${role === 'agent' ? 'text-primary border-b-2 border-primary font-semibold' : 'text-nordic/60 hover:text-nordic'}`}
          >
            Agents
          </Link>
          <Link 
            href={`/${lang}/admin/users?role=broker`}
            className={`pb-3 text-sm font-medium whitespace-nowrap ${role === 'broker' ? 'text-primary border-b-2 border-primary font-semibold' : 'text-nordic/60 hover:text-nordic'}`}
          >
            Brokers
          </Link>
          <Link 
            href={`/${lang}/admin/users?role=admin`}
            className={`pb-3 text-sm font-medium whitespace-nowrap ${role === 'admin' ? 'text-primary border-b-2 border-primary font-semibold' : 'text-nordic/60 hover:text-nordic'}`}
          >
            Admins
          </Link>
        </div>
      </header>

      {/* Table / List Container */}
      <UsersTable users={filteredUsers} currentUserId={currentUserId} />

      <Footer />
    </div>
  );
}
