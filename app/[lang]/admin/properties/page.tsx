import { getAdminProperties } from '../../../../lib/actions/admin';
import PropertiesTable from '../../../../components/admin/PropertiesTable';
import AdminPagination from '../../../../components/admin/AdminPagination';
import { createClient } from '../../../../lib/supabase/server';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Properties | Admin — LuxeEstate',
};

export const dynamic = 'force-dynamic';

interface AdminPropertiesPageProps {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ page?: string }>;
}

export default async function AdminPropertiesPage({
  params,
  searchParams,
}: AdminPropertiesPageProps) {
  const { lang } = await params;
  const sp = await searchParams;
  const currentPage = Math.max(1, parseInt(sp.page ?? '1', 10));

  const { data: properties, total, totalPages, pageSize } = await getAdminProperties(currentPage);

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const currentUserData = user ? {
    name: user.user_metadata?.full_name || user.email || 'Admin User',
    role: 'Premium Agent',
    avatar: user.user_metadata?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.email ?? 'A')}&background=006655&color=fff`,
  } : null;

  // Fetch aggregate counts (all rows, not just current page)
  // We reuse `total` from getAdminProperties for total listing count
  // For sale/rent we need an extra lightweight query
  const supabaseForCounts = await createClient();
  const { data: tagCounts } = await supabaseForCounts
    .from('properties')
    .select('tag, is_featured');

  const allProps = tagCounts ?? [];
  const featured = allProps.filter((p) => p.is_featured).length;
  const forSale = allProps.filter((p) => p.tag === 'for sale').length;
  const forRent = allProps.filter((p) => p.tag === 'for rent').length;

  return (
    <div className="flex-grow flex flex-col w-full min-h-screen bg-background-light dark:bg-background-dark text-nordic-dark dark:text-gray-100 font-display antialiased">
      {/* Main Content */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-nordic-dark dark:text-white tracking-tight">My Properties</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Manage your portfolio and track performance.</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="bg-white dark:bg-[#152e2a] border border-gray-200 dark:border-mosque/30 text-nordic-dark dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-mosque/10 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors shadow-sm inline-flex items-center gap-2">
              <span className="material-icons text-base">filter_list</span> Filter
            </button>
            <button className="bg-mosque hover:bg-mosque/90 text-white px-5 py-2.5 rounded-lg text-sm font-medium shadow-md shadow-mosque/20 transition-all transform hover:-translate-y-0.5 inline-flex items-center gap-2">
              <span className="material-icons text-base">add</span> Add New Property
            </button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-[#152e2a] p-5 rounded-xl border border-mosque/10 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Listings</p>
              <p className="text-2xl font-bold text-nordic-dark dark:text-white mt-1">{total}</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-mosque/10 flex items-center justify-center text-mosque">
              <span className="material-icons">apartment</span>
            </div>
          </div>
          <div className="bg-white dark:bg-[#152e2a] p-5 rounded-xl border border-mosque/10 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">For Sale</p>
              <p className="text-2xl font-bold text-nordic-dark dark:text-white mt-1">{forSale}</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-hint-green flex items-center justify-center text-mosque">
              <span className="material-icons">sell</span>
            </div>
          </div>
          <div className="bg-white dark:bg-[#152e2a] p-5 rounded-xl border border-mosque/10 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">For Rent</p>
              <p className="text-2xl font-bold text-nordic-dark dark:text-white mt-1">{forRent}</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <span className="material-icons">key</span>
            </div>
          </div>
        </div>

        {/* Property List + Pagination */}
        <div className="bg-white dark:bg-[#152e2a] rounded-xl shadow-sm border border-gray-200 dark:border-mosque/20 overflow-hidden">
          <PropertiesTable properties={properties} lang={lang} />
          <AdminPagination
            currentPage={currentPage}
            totalPages={totalPages}
            total={total}
            pageSize={pageSize}
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-gray-200 dark:border-mosque/20 bg-white dark:bg-[#152e2a]">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-400 dark:text-gray-500">© 2023 Haven Property Management. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
