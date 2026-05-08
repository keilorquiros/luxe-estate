import Navbar from "../../../components/layout/Navbar";
import FeaturedPropertyCard from "../../../components/ui/FeaturedPropertyCard";
import Pagination from "../../../components/ui/Pagination";
import { getPaginatedFeaturedProperties } from "../../../lib/supabase";
import { getDictionary, Locale, locales } from "../../../lib/i18n";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

interface FeaturedPageProps {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ page?: string }>;
}

export default async function FeaturedPage({ params, searchParams }: FeaturedPageProps) {
  const { lang } = await params;
  
  if (!locales.includes(lang as any)) {
    notFound();
  }

  const dict = await getDictionary(lang as Locale);
  const searchP = await searchParams;
  const currentPage = Math.max(1, parseInt(searchP.page ?? "1", 10));
  const pageSize = 10;

  const { properties, total, totalPages } = await getPaginatedFeaturedProperties(currentPage, pageSize);

  const startItem = total === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, total);

  return (
    <>
      <Navbar lang={lang as Locale} dict={dict} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 pt-8">
        <div className="mb-12">
          <h1 className="text-4xl font-light text-nordic-dark mb-2">{dict.home.featured_title}</h1>
          <p className="text-nordic-muted text-lg">
            {dict.home.featured_subtitle}
            {total > 0 && (
              <span className="text-mosque font-medium ml-2">
                {dict.home.showing.replace("{start}", startItem.toString()).replace("{end}", endItem.toString()).replace("{total}", total.toString())}
              </span>
            )}
          </p>
        </div>

        {properties.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-nordic-muted text-lg">No featured properties found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {properties.map((property) => (
              <FeaturedPropertyCard key={property.id} property={property} lang={lang as Locale} dict={dict} />
            ))}
          </div>
        )}

        <div className="mt-12">
          <Pagination 
            currentPage={currentPage} 
            totalPages={totalPages} 
            lang={lang as Locale} 
            basePath={`/${lang}/featured`}
          />
        </div>
      </main>
    </>
  );
}
