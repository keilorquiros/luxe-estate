import { getUsersWithRoles } from '../../../../lib/actions/admin';
import UsersTable from '../../../../components/admin/UsersTable';
import { createClient } from '../../../../lib/supabase/server';
import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'User Directory | Admin — LuxeEstate',
};

export const dynamic = 'force-dynamic';

export default async function AdminUsersPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
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

  const currentUserData = user ? {
    name: user.user_metadata?.full_name || user.email || 'Admin User',
    avatar: user.user_metadata?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.email ?? 'A')}&background=006655&color=fff`,
  } : null;

  return (
    <div className="flex-grow flex flex-col w-full min-h-screen bg-background-light dark:bg-background-dark text-nordic-dark dark:text-gray-100 font-display antialiased">
      <header className="w-full pt-8 pb-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-nordic-dark dark:text-white">User Directory</h1>
            <p className="text-nordic-dark/60 dark:text-gray-400 mt-1 text-sm">Manage user access and roles for your properties.</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <div className="relative group w-full md:w-80">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="material-icons text-nordic-dark/40 group-focus-within:text-mosque text-xl">search</span>
              </div>
              <input 
                className="block w-full pl-10 pr-3 py-2.5 border border-transparent rounded-lg bg-white dark:bg-gray-800 text-nordic-dark dark:text-white shadow-soft placeholder-nordic-dark/30 focus:border-mosque focus:ring-2 focus:ring-mosque/20 focus:bg-white transition-all text-sm outline-none" 
                placeholder="Search by name, email..." 
                type="text"
              />
            </div>
            <button className="inline-flex items-center justify-center px-4 py-2.5 border border-mosque text-sm font-medium rounded-lg text-mosque bg-transparent hover:bg-mosque/5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-mosque transition-colors whitespace-nowrap">
              <span className="material-icons text-lg mr-2">add</span>
              Add User
            </button>
          </div>
        </div>
        <div className="mt-8 flex gap-6 border-b border-nordic-dark/10 overflow-x-auto hide-scroll">
          <button className="pb-3 text-sm font-semibold text-mosque border-b-2 border-mosque whitespace-nowrap">All Users</button>
          <button className="pb-3 text-sm font-medium text-nordic-dark/60 hover:text-nordic-dark transition-colors whitespace-nowrap">Agents</button>
          <button className="pb-3 text-sm font-medium text-nordic-dark/60 hover:text-nordic-dark transition-colors whitespace-nowrap">Brokers</button>
          <button className="pb-3 text-sm font-medium text-nordic-dark/60 hover:text-nordic-dark transition-colors whitespace-nowrap">Admins</button>
        </div>
      </header>

      {/* Table / List Container */}
      <UsersTable users={sortedUsers} currentUserId={currentUserId} />

      <footer className="mt-auto border-t border-nordic-dark/5 bg-background-light dark:bg-background-dark py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-nordic-dark/60 dark:text-gray-400">
                Showing <span className="font-medium text-nordic-dark dark:text-white">1</span> to <span className="font-medium text-nordic-dark dark:text-white">{users.length}</span> of <span className="font-medium text-nordic-dark dark:text-white">{users.length}</span> users
              </p>
            </div>
            <div>
              <nav aria-label="Pagination" className="relative z-0 inline-flex rounded-md shadow-none -space-x-px">
                <button className="relative inline-flex items-center px-2 py-2 rounded-l-md text-sm font-medium text-nordic-dark/50 hover:text-mosque transition-colors">
                  <span className="sr-only">Previous</span>
                  <span className="material-icons text-xl">chevron_left</span>
                </button>
                <button aria-current="page" className="z-10 bg-mosque text-white relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-md mx-1 shadow-sm">
                  1
                </button>
                <button className="relative inline-flex items-center px-2 py-2 rounded-r-md text-sm font-medium text-nordic-dark/50 hover:text-mosque transition-colors">
                  <span className="sr-only">Next</span>
                  <span className="material-icons text-xl">chevron_right</span>
                </button>
              </nav>
            </div>
          </div>
          <div className="flex items-center justify-between w-full sm:hidden">
            <button className="relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-md text-nordic-dark bg-white border border-gray-300 hover:bg-gray-50">
              Previous
            </button>
            <button className="ml-3 relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-md text-nordic-dark bg-white border border-gray-300 hover:bg-gray-50">
              Next
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
