import { getUsersWithRoles } from '../../../../lib/actions/admin';
import UsersTable from '../../../../components/admin/UsersTable';
import Footer from '../../../../components/layout/Footer';
import AdminPagination from '../../../../components/admin/AdminPagination';
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
  searchParams: Promise<{ role?: string; page?: string; search?: string }>;
}) {
  const { lang } = await params;
  const sp = await searchParams;
  const { role, search } = sp;
  const currentPage = Math.max(1, parseInt(sp.page ?? '1', 10));
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
  let filteredUsers = role 
    ? sortedUsers.filter((u) => u.role === role) 
    : sortedUsers;

  // Filter by search query
  if (search) {
    const query = search.toLowerCase();
    filteredUsers = filteredUsers.filter((u) => {
      const fullName = u.full_name?.toLowerCase() || '';
      const email = u.email?.toLowerCase() || '';
      return fullName.includes(query) || email.includes(query);
    });
  }

  // Pagination logic
  const pageSize = 20;
  const total = filteredUsers.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const from = (currentPage - 1) * pageSize;
  const to = from + pageSize;
  const paginatedUsers = filteredUsers.slice(from, to);

  const currentUserData = user ? {
    name: user.user_metadata?.full_name || user.email || 'Admin User',
    avatar: user.user_metadata?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.email ?? 'A')}&background=006655&color=fff`,
  } : null;  const getTabHref = (r?: string) => {
    const params = new URLSearchParams();
    if (r) params.set('role', r);
    if (search) params.set('search', search);
    const qs = params.toString();
    return `/${lang}/admin/users${qs ? `?${qs}` : ''}`;
  };

  return (
    <div className="flex-grow flex flex-col w-full min-h-screen bg-background-light text-nordic font-display antialiased">
      <header className="w-full pt-8 pb-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-nordic">User Directory</h1>
            <p className="text-nordic/60 mt-1 text-sm">Manage user access and roles for your properties.</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <form action="" method="get" className="relative group w-full md:w-80">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="material-icons text-nordic/40 group-focus-within:text-primary text-xl">search</span>
              </div>
              <input 
                name="search"
                defaultValue={search || ""}
                className="block w-full pl-10 pr-3 py-2.5 border border-transparent rounded-lg bg-white text-nordic shadow-soft placeholder-nordic/30 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all text-sm outline-none" 
                placeholder="Search by name, email..." 
                type="text"
              />
              {role && <input type="hidden" name="role" value={role} />}
            </form>
            <button className="inline-flex items-center justify-center px-4 py-2.5 border border-primary text-sm font-medium rounded-lg text-primary bg-transparent hover:bg-primary/5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors whitespace-nowrap">
              <span className="material-icons text-lg mr-2">mail</span>
              Invite Agent
            </button>
          </div>
        </div>
        <div className="mt-8 flex gap-6 border-b border-nordic/10 overflow-x-auto hide-scroll">
          <Link 
            href={getTabHref()}
            className={`pb-3 text-sm font-medium whitespace-nowrap ${!role ? 'text-primary border-b-2 border-primary font-semibold' : 'text-nordic/60 hover:text-nordic'}`}
          >
            All Users
          </Link>
          <Link 
            href={getTabHref('agent')}
            className={`pb-3 text-sm font-medium whitespace-nowrap ${role === 'agent' ? 'text-primary border-b-2 border-primary font-semibold' : 'text-nordic/60 hover:text-nordic'}`}
          >
            Agents
          </Link>
          <Link 
            href={getTabHref('broker')}
            className={`pb-3 text-sm font-medium whitespace-nowrap ${role === 'broker' ? 'text-primary border-b-2 border-primary font-semibold' : 'text-nordic/60 hover:text-nordic'}`}
          >
            Brokers
          </Link>
          <Link 
            href={getTabHref('admin')}
            className={`pb-3 text-sm font-medium whitespace-nowrap ${role === 'admin' ? 'text-primary border-b-2 border-primary font-semibold' : 'text-nordic/60 hover:text-nordic'}`}
          >
            Admins
          </Link>
        </div>
      </header>

      {/* Table / List Container */}
      <UsersTable users={paginatedUsers} currentUserId={currentUserId} />

      {/* Pagination */}
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <AdminPagination
            currentPage={currentPage}
            totalPages={totalPages}
            total={total}
            pageSize={pageSize}
            itemName="users"
          />
        </div>
      </div>

      <Footer />
    </div>
  );
}
