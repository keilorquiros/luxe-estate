import Link from "next/link";
import { Property } from "../../lib/supabase";
import { Locale } from "../../lib/i18n";

export default function FeaturedPropertyCard({ property, lang, dict }: { property: Property, lang: Locale, dict: any }) {
  return (
    <Link href={`/${lang}/properties/${property.slug}`} className="group relative rounded-xl overflow-hidden shadow-soft bg-white cursor-pointer block">
      <div className="aspect-[4/3] w-full overflow-hidden relative">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img alt={property.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" src={property.images?.[0] || ""} />
        
        <div className="absolute top-4 left-4 flex flex-col gap-1">
          {property.tag && (
            <div className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold tracking-wider text-nordic-dark">
              {property.tag.charAt(0).toUpperCase() + property.tag.slice(1)}
            </div>
          )}
          {property.highlight_tag && (
            <div className="bg-mosque/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold tracking-wider text-white">
              {property.highlight_tag.charAt(0).toUpperCase() + property.highlight_tag.slice(1)}
            </div>
          )}
        </div>
        
        <button className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center text-nordic-dark hover:bg-mosque hover:text-white transition-all">
          <span className="material-icons text-xl">favorite_border</span>
        </button>
        <div className="absolute bottom-0 inset-x-0 h-1/2 bg-gradient-to-t from-black/60 to-transparent opacity-60"></div>
      </div>
      <div className="p-6 relative">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="text-xl font-medium text-nordic-dark group-hover:text-mosque transition-colors">{property.title}</h3>
            <p className="text-nordic-muted text-sm flex items-center gap-1 mt-1">
              <span className="material-icons text-sm">place</span> {property.location}
            </p>
          </div>
          <span className="text-xl font-semibold text-mosque">{property.price}{property.price_suffix}</span>
        </div>
        <div className="flex items-center gap-6 mt-6 pt-6 border-t border-nordic-dark/5">
          <div className="flex items-center gap-2 text-nordic-muted text-sm">
            <span className="material-icons text-lg">king_bed</span> {property.beds} {dict.common.beds}
          </div>
          <div className="flex items-center gap-2 text-nordic-muted text-sm">
            <span className="material-icons text-lg">bathtub</span> {property.baths} {dict.common.baths}
          </div>
          <div className="flex items-center gap-2 text-nordic-muted text-sm">
            <span className="material-icons text-lg">square_foot</span> {property.area} {dict.common.sqft}
          </div>
        </div>
      </div>
    </Link>
  );
}
