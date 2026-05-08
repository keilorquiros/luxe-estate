import Navbar from "../../components/layout/Navbar";
import HeroSection from "../../components/home/HeroSection";
import FeaturedPropertyCard from "../../components/ui/FeaturedPropertyCard";
import PropertyCard from "../../components/ui/PropertyCard";
import Pagination from "../../components/ui/Pagination";
import MarketFilters from "../../components/home/MarketFilters";
import { getFeaturedProperties, getMarketProperties } from "../../lib/supabase";
import { getDictionary, Locale, locales } from "../../lib/i18n";
import { notFound } from "next/navigation";

// Tell Next.js this page is dynamically rendered
export const dynamic = "force-dynamic";

interface HomePageProps {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ 
    page?: string;
    q?: string;
    type?: string;
    beds?: string;
    baths?: string;
    minPrice?: string;
    maxPrice?: string;
    tag?: string;
    highlightTag?: string;
    amenities?: string;
  }>;
}

export default async function Home({ params, searchParams }: HomePageProps) {
  const { lang } = await params;
  
  if (!locales.includes(lang as any)) {
    notFound();
  }

  const dict = await getDictionary(lang as Locale);
  const searchP = await searchParams;
  const currentPage = Math.max(1, parseInt(searchP.page ?? "1", 10));

  const filters = {
    q: searchP.q,
    type: searchP.type,
    beds: searchP.beds ? parseInt(searchP.beds, 10) : undefined,
    baths: searchP.baths ? parseInt(searchP.baths, 10) : undefined,
    minPrice: searchP.minPrice ? parseInt(searchP.minPrice, 10) : undefined,
    maxPrice: searchP.maxPrice ? parseInt(searchP.maxPrice, 10) : undefined,
    tag: searchP.tag,
    highlightTag: searchP.highlightTag,
    amenities: searchP.amenities ? searchP.amenities.split(",") : undefined,
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
    searchP.q ||
    searchP.type ||
    searchP.beds ||
    searchP.baths ||
    searchP.minPrice ||
    searchP.maxPrice ||
    searchP.tag ||
    searchP.highlightTag ||
    searchP.amenities
  );

  return (
    <>
      <Navbar lang={lang as Locale} dict={dict} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <HeroSection lang={lang as Locale} dict={dict} />

        {/* ── Featured Collections ──────────────────────────────────────── */}
        {!isFilterApplied && (
          <section className="mb-16">
            <div className="flex items-end justify-between mb-8">
              <div>
                <h2 className="text-2xl font-light text-nordic-dark">{dict.home.featured_title}</h2>
                <p className="text-nordic-muted mt-1 text-sm">{dict.home.featured_subtitle}</p>
              </div>
              <a
                className="hidden sm:flex items-center gap-1 text-sm font-medium text-mosque hover:opacity-70 transition-opacity"
                href="#"
              >
                {dict.home.view_all} <span className="material-icons text-sm">arrow_forward</span>
              </a>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {featuredProperties.slice(0, 2).map((property) => (
                <FeaturedPropertyCard key={property.id} property={property} lang={lang as Locale} dict={dict} />
              ))}
            </div>
          </section>
        )}

        {/* ── New in Market ─────────────────────────────────────────────── */}
        <section id="market-section" className="scroll-mt-24">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-2xl font-light text-nordic-dark">{dict.home.market_title}</h2>
              <p className="text-nordic-muted mt-1 text-sm">
                {dict.home.market_subtitle}{" "}
                <span className="text-mosque font-medium">
                  {dict.home.showing.replace("{start}", startItem.toString()).replace("{end}", endItem.toString()).replace("{total}", total.toString())}
                </span>
              </p>
            </div>
            <MarketFilters lang={lang as string} dict={dict} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {marketProperties.map((property) => (
              <PropertyCard key={property.id} property={property} lang={lang as Locale} dict={dict} />
            ))}
          </div>

          {/* Server-side pagination */}
          <Pagination currentPage={currentPage} totalPages={totalPages} lang={lang as Locale} />
        </section>
      </main>
    </>
  );
}
