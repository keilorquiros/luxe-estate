import { getAdminProperties } from '../../../../lib/actions/admin';
import PropertiesTable from '../../../../components/admin/PropertiesTable';
import AdminPagination from '../../../../components/admin/AdminPagination';
import Footer from '../../../../components/layout/Footer';
import { createClient } from '../../../../lib/supabase/server';
import type { Metadata } from 'next';
import AdminFilterButton from '../../../../components/admin/AdminFilterButton';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Properties | Admin — LuxeEstate',
};

export const dynamic = 'force-dynamic';

interface AdminPropertiesPageProps {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ 
    page?: string; 
    minPrice?: string; 
    maxPrice?: string; 
    tag?: string; 
    highlightTag?: string;
    beds?: string; 
    baths?: string; 
    search?: string; 
  }>;
}

export default async function AdminPropertiesPage({
  params,
  searchParams,
}: AdminPropertiesPageProps) {
  const { lang } = await params;
  const sp = await searchParams;
  const currentPage = Math.max(1, parseInt(sp.page ?? '1', 10));

  const filters = {
    minPrice: sp.minPrice ? parseInt(sp.minPrice, 10) : undefined,
    maxPrice: sp.maxPrice ? parseInt(sp.maxPrice, 10) : undefined,
    tag: sp.tag,
    highlightTag: sp.highlightTag,
    beds: sp.beds ? parseInt(sp.beds, 10) : undefined,
    baths: sp.baths ? parseInt(sp.baths, 10) : undefined,
    search: sp.search,
  };

  const { data: properties, total, totalPages, pageSize } = await getAdminProperties(currentPage, filters);

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const currentUserData = user ? {
    name: user.user_metadata?.full_name || user.email || 'Admin User',
    role: 'Premium Agent',
    avatar: user.user_metadata?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.email ?? 'A')}&background=006655&color=fff`,
  } : null;

  // Fetch aggregate counts matching the current filters
  const supabaseForCounts = await createClient();
  let countsQuery = supabaseForCounts
    .from('properties')
    .select('tag, is_featured');

  // Apply filters to counts query
  if (filters.minPrice) {
    countsQuery = countsQuery.gte('price_numeric', filters.minPrice);
  }
  if (filters.maxPrice) {
    countsQuery = countsQuery.lte('price_numeric', filters.maxPrice);
  }
  if (filters.tag && filters.tag !== 'any tag') {
    countsQuery = countsQuery.eq('tag', filters.tag);
  }
  if (filters.highlightTag && filters.highlightTag !== 'any tag' && filters.highlightTag !== 'any highlight') {
    countsQuery = countsQuery.contains('highlight_tag', [filters.highlightTag]);
  }
  if (filters.beds) {
    countsQuery = countsQuery.gte('beds', filters.beds);
  }
  if (filters.baths) {
    countsQuery = countsQuery.gte('baths', filters.baths);
  }
  if (filters.search) {
    countsQuery = countsQuery.ilike('title', `%${filters.search}%`);
  }

  const { data: tagCounts } = await countsQuery;

  const allProps = tagCounts ?? [];
  const featured = allProps.filter((p) => p.is_featured).length;
  const forSale = allProps.filter((p) => p.tag === 'for-sale').length;
  const forRent = allProps.filter((p) => p.tag === 'for-rent').length;

  return (
    <div className="flex-grow flex flex-col w-full min-h-screen bg-background-light text-nordic font-display antialiased">
      {/* Main Content */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-nordic tracking-tight">My Properties</h1>
            <p className="text-gray-500 mt-1">Manage your portfolio and track performance.</p>
          </div>
          <div className="flex items-center gap-3">
            <AdminFilterButton lang={lang} />
            <Link href={`/${lang}/admin/properties/new`} className="bg-primary hover:bg-primary/90 text-white px-5 py-2.5 rounded-lg text-sm font-medium shadow-md shadow-primary/20 transition-all transform hover:-translate-y-0.5 inline-flex items-center gap-2">
              <span className="material-icons text-base">add</span> Add New Property
            </Link>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-5 rounded-xl border border-primary/10 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Listings</p>
              <p className="text-2xl font-bold text-nordic mt-1">{total}</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <span className="material-icons">apartment</span>
            </div>
          </div>
          <div className="bg-white p-5 rounded-xl border border-primary/10 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">For Sale</p>
              <p className="text-2xl font-bold text-nordic mt-1">{forSale}</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-hint-green flex items-center justify-center text-primary">
              <span className="material-icons">check_circle</span>
            </div>
          </div>
          <div className="bg-white p-5 rounded-xl border border-primary/10 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">For Rent</p>
              <p className="text-2xl font-bold text-nordic mt-1">{forRent}</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
              <span className="material-icons">pending</span>
            </div>
          </div>
        </div>

        {/* Property List + Pagination */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <PropertiesTable properties={properties} lang={lang} />
          <AdminPagination
            currentPage={currentPage}
            totalPages={totalPages}
            total={total}
            pageSize={pageSize}
          />
        </div>
      </main>

      <Footer />
    </div>
  );
}
