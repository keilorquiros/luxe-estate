import Navbar from "../components/layout/Navbar";
import HeroSection from "../components/home/HeroSection";
import FeaturedPropertyCard from "../components/ui/FeaturedPropertyCard";
import PropertyCard from "../components/ui/PropertyCard";
import Pagination from "../components/ui/Pagination";
import { getFeaturedProperties, getMarketProperties } from "../lib/supabase";

// Tell Next.js this page is dynamically rendered (reads searchParams at request time)
export const dynamic = "force-dynamic";

interface HomePageProps {
  searchParams: Promise<{ 
    page?: string;
    q?: string;
    type?: string;
    beds?: string;
    baths?: string;
    minPrice?: string;
    maxPrice?: string;
    amenities?: string;
  }>;
}

export default async function Home({ searchParams }: HomePageProps) {
  const params = await searchParams;
  const currentPage = Math.max(1, parseInt(params.page ?? "1", 10));

  const filters = {
    q: params.q,
    type: params.type,
    beds: params.beds ? parseInt(params.beds, 10) : undefined,
    baths: params.baths ? parseInt(params.baths, 10) : undefined,
    minPrice: params.minPrice ? parseInt(params.minPrice, 10) : undefined,
    maxPrice: params.maxPrice ? parseInt(params.maxPrice, 10) : undefined,
    amenities: params.amenities ? params.amenities.split(",") : undefined,
  };

  // Fetch both sections in parallel on the server
  const [featuredProperties, marketData] = await Promise.all([
    getFeaturedProperties(),
    getMarketProperties(currentPage, filters),
  ]);

  const { properties: marketProperties, totalPages, total } = marketData;
  const startItem = total === 0 ? 0 : (currentPage - 1) * marketData.pageSize + 1;
  const endItem = Math.min(currentPage * marketData.pageSize, total);

  const isFilterApplied = !!(
    params.q ||
    params.type ||
    params.beds ||
    params.baths ||
    params.minPrice ||
    params.maxPrice ||
    params.amenities
  );

  return (
    <>
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <HeroSection />

        {/* ── Featured Collections ──────────────────────────────────────── */}
        {!isFilterApplied && (
          <section className="mb-16">
            <div className="flex items-end justify-between mb-8">
              <div>
                <h2 className="text-2xl font-light text-nordic-dark">Featured Collections</h2>
                <p className="text-nordic-muted mt-1 text-sm">Curated properties for the discerning eye.</p>
              </div>
              <a
                className="hidden sm:flex items-center gap-1 text-sm font-medium text-mosque hover:opacity-70 transition-opacity"
                href="#"
              >
                View all <span className="material-icons text-sm">arrow_forward</span>
              </a>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {featuredProperties.slice(0, 2).map((property) => (
                <FeaturedPropertyCard key={property.id} property={property} />
              ))}
            </div>
          </section>
        )}

        {/* ── New in Market ─────────────────────────────────────────────── */}
        <section>
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-2xl font-light text-nordic-dark">New in Market</h2>
              <p className="text-nordic-muted mt-1 text-sm">
                Fresh opportunities added this week.{" "}
                <span className="text-mosque font-medium">
                  Showing {startItem}–{endItem} of {total}
                </span>
              </p>
            </div>
            <div className="hidden md:flex bg-white p-1 rounded-lg">
              <button className="px-4 py-1.5 rounded-md text-sm font-medium bg-nordic-dark text-white shadow-sm">All</button>
              <button className="px-4 py-1.5 rounded-md text-sm font-medium text-nordic-muted hover:text-nordic-dark">Buy</button>
              <button className="px-4 py-1.5 rounded-md text-sm font-medium text-nordic-muted hover:text-nordic-dark">Rent</button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {marketProperties.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>

          {/* Server-side pagination */}
          <Pagination currentPage={currentPage} totalPages={totalPages} />
        </section>
      </main>
    </>
  );
}
