import { Metadata } from "next";
import { notFound } from "next/navigation";
import Navbar from "../../../../components/layout/Navbar";
import { propertyDescriptionParagraphs, resolvePropertyAmenities, resolvePropertyDescription } from "../../../../lib/property-i18n";
import { getPropertyBySlug } from "../../../../lib/supabase";
import PropertyGallery from "../../../../components/property/PropertyGallery";
import MapWrapper from "../../../../components/property/MapWrapper";
import { defaultLocale, getDictionary, Locale, locales } from "../../../../lib/i18n";

function fillTemplate(template: string, values: Record<string, string | number>) {
  return Object.entries(values).reduce(
    (acc, [key, val]) => acc.replaceAll(`{${key}}`, String(val)),
    template
  );
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string; slug: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  const { lang, slug } = resolvedParams;
  const locale = locales.includes(lang as Locale) ? (lang as Locale) : defaultLocale;
  const dict = await getDictionary(locale);
  const pd = dict.property_detail as {
    meta_title_not_found: string;
    meta_description: string;
  };

  const property = await getPropertyBySlug(slug);

  if (!property) {
    return { title: pd.meta_title_not_found };
  }

  const longDesc = resolvePropertyDescription(property, locale).replace(/\s+/g, " ").trim();

  return {
    title: `${property.title} | ${property.price}${property.price_suffix || ""} | LuxeEstate`,
    description:
      longDesc.slice(0, 155) ||
      fillTemplate(pd.meta_description, {
        location: property.location,
        beds: property.beds,
        baths: property.baths,
      }),
  };
}

export async function generateStaticParams() {
  return [];
}

export default async function PropertyDetailsPage({ params }: { params: Promise<{ lang: string; slug: string }> }) {
  const { lang, slug } = await params;

  if (!locales.includes(lang as Locale)) {
    notFound();
  }

  const dict = await getDictionary(lang as Locale);
  const property = await getPropertyBySlug(slug);

  if (!property) {
    notFound();
  }

  const pd = dict.property_detail as {
    badge_new: string;
    view_all_photos: string;
    gallery_thumb_alt: string;
    agent_avatar_alt: string;
    top_rated_agent: string;
    schedule_visit: string;
    contact_agent: string;
    garage: string;
    features_heading: string;
    about_heading: string;
    read_more: string;
    amenities_heading: string;
    map_loading: string;
  };

  const aboutParagraphs = propertyDescriptionParagraphs(property, lang as Locale);
  const amenityLines = resolvePropertyAmenities(property, lang as Locale);

  return (
    <>
      <Navbar lang={lang as Locale} dict={dict} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
          <div className="lg:col-span-8 space-y-4">
            <PropertyGallery
              images={property.images}
              title={property.title}
              tag={property.tag || undefined}
              highlightTag={property.highlight_tag}
              galleryDict={{
                badge_new: pd.badge_new,
                view_all_photos: pd.view_all_photos,
                gallery_thumb_alt: pd.gallery_thumb_alt,
              }}
            />
          </div>

          <div className="lg:col-span-4 relative">
            <div className="sticky top-28 space-y-6">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-mosque/5">
                <div className="mb-4">
                  <h1 className="text-4xl font-display font-light text-nordic-dark mb-2">
                    {property.price}
                    {property.price_suffix}
                  </h1>
                  <p className="text-nordic-dark/60 font-medium flex items-center gap-1">
                    <span className="material-icons text-mosque text-sm">location_on</span>
                    {property.location}
                  </p>
                </div>
                <div className="h-px bg-slate-100 my-6"></div>
                <div className="flex items-center gap-4 mb-6">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    alt={pd.agent_avatar_alt}
                    className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-sm"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuD4TxUmdQRb2VMjuaNxLEwLorv_dgHzoET2_wL5toSvew6nhtziaR3DX-U69DBN7J74yO6oKokpw8tqEFutJf13MeXghCy7FwZuAxnoJel6FYcKeCRUVinpZtrNnkZvXd-MY5_2MAtRD7JP5BieHixfCaeAPW04jm-y-nvF3HIrwcZ_HRDk_MrNP5WiPV3u9zNrEgM-SQoWGh4xLVSV444aZAbVl03mjjsW5WBpIeodCyqJxprTDp6Q157D06VxcdUSCf-l9UKQT-w"
                  />
                  <div>
                    <h3 className="font-semibold text-nordic-dark">Sarah Jenkins</h3>
                    <div className="flex items-center gap-1 text-xs text-mosque font-medium">
                      <span className="material-icons text-[14px]">star</span>
                      <span>{pd.top_rated_agent}</span>
                    </div>
                  </div>
                  <div className="ml-auto flex gap-2">
                    <button
                      type="button"
                      className="p-2 rounded-full bg-mosque/10 text-mosque hover:bg-mosque hover:text-white transition-colors"
                    >
                      <span className="material-icons text-sm">chat</span>
                    </button>
                    <button
                      type="button"
                      className="p-2 rounded-full bg-mosque/10 text-mosque hover:bg-mosque hover:text-white transition-colors"
                    >
                      <span className="material-icons text-sm">call</span>
                    </button>
                  </div>
                </div>
                <div className="space-y-3">
                  <button
                    type="button"
                    className="w-full bg-mosque hover:bg-primary-hover text-white py-4 px-6 rounded-lg font-medium transition-all shadow-lg shadow-mosque/20 flex items-center justify-center gap-2 group"
                  >
                    <span className="material-icons text-xl group-hover:scale-110 transition-transform">calendar_today</span>
                    {pd.schedule_visit}
                  </button>
                  <button
                    type="button"
                    className="w-full bg-transparent border border-nordic-dark/10 hover:border-mosque text-nordic-dark/80 hover:text-mosque py-4 px-6 rounded-lg font-medium transition-all flex items-center justify-center gap-2"
                  >
                    <span className="material-icons text-xl">mail_outline</span>
                    {pd.contact_agent}
                  </button>
                </div>
              </div>

              <div className="bg-white p-2 rounded-xl shadow-sm border border-mosque/5">
                <div className="relative w-full aspect-[4/3] rounded-lg overflow-hidden bg-slate-100">
                  <MapWrapper location={property.location} latitude={property.latitude} longitude={property.longitude} loadingLabel={pd.map_loading} />
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-8 lg:row-start-2 -mt-8 space-y-8">
            <div className="bg-white p-8 rounded-xl shadow-sm border border-mosque/5">
              <h2 className="text-lg font-semibold mb-6 text-nordic-dark">{pd.features_heading}</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="flex flex-col items-center justify-center p-4 bg-mosque/5 rounded-lg border border-mosque/10">
                  <span className="material-icons text-mosque text-2xl mb-2">square_foot</span>
                  <span className="text-xl font-bold text-nordic-dark">{property.area}</span>
                  <span className="text-xs uppercase tracking-wider text-nordic-dark/50">{dict.common.sqft}</span>
                </div>
                <div className="flex flex-col items-center justify-center p-4 bg-mosque/5 rounded-lg border border-mosque/10">
                  <span className="material-icons text-mosque text-2xl mb-2">bed</span>
                  <span className="text-xl font-bold text-nordic-dark">{property.beds}</span>
                  <span className="text-xs uppercase tracking-wider text-nordic-dark/50">{dict.common.beds}</span>
                </div>
                <div className="flex flex-col items-center justify-center p-4 bg-mosque/5 rounded-lg border border-mosque/10">
                  <span className="material-icons text-mosque text-2xl mb-2">shower</span>
                  <span className="text-xl font-bold text-nordic-dark">{property.baths}</span>
                  <span className="text-xs uppercase tracking-wider text-nordic-dark/50">{dict.common.baths}</span>
                </div>
                <div className="flex flex-col items-center justify-center p-4 bg-mosque/5 rounded-lg border border-mosque/10">
                  <span className="material-icons text-mosque text-2xl mb-2">directions_car</span>
                  <span className="text-xl font-bold text-nordic-dark">{property.garages || 0}</span>
                  <span className="text-xs uppercase tracking-wider text-nordic-dark/50">{pd.garage}</span>
                </div>
              </div>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-sm border border-mosque/5">
              <h2 className="text-lg font-semibold mb-4 text-nordic-dark">{pd.about_heading}</h2>
              <div className="prose prose-slate max-w-none text-nordic-dark/70 leading-relaxed">
                {aboutParagraphs.map((para, i) => (
                  <p key={`about-${slug}-${i}`} className={i < aboutParagraphs.length - 1 ? "mb-4" : ""}>
                    {para}
                  </p>
                ))}
              </div>
              <button type="button" className="mt-4 text-mosque font-semibold text-sm flex items-center gap-1 hover:gap-2 transition-all">
                {pd.read_more}
                <span className="material-icons text-sm">arrow_forward</span>
              </button>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-sm border border-mosque/5">
              <h2 className="text-lg font-semibold mb-6 text-nordic-dark">{pd.amenities_heading}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8">
                {amenityLines.map((label, i) => (
                  <div key={`amenity-${slug}-${i}-${label.slice(0, 32)}`} className="flex items-center gap-3 text-nordic-dark/70">
                    <span className="material-icons text-mosque/60 text-sm">check_circle</span>
                    <span>{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
