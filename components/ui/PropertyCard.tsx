import Link from "next/link";
import { Property } from "../../lib/supabase";
import { Locale } from "../../lib/i18n";

export default function PropertyCard({ property, lang, dict, className = "" }: { property: Property, lang: Locale, dict: any, className?: string }) {
  const getTagColorClasses = (color?: string | null) => {
    switch (color) {
      case "mosque": return "bg-mosque/90 text-white";
      case "nordic-dark": return "bg-nordic-dark/90 text-white";
      case "white": return "bg-white/90 text-nordic-dark";
      default: return "bg-nordic-dark/90 text-white";
    }
  };

  return (
    <Link href={`/${lang}/properties/${property.slug}`} className={`bg-white rounded-xl overflow-hidden shadow-card hover:shadow-soft transition-all duration-300 group cursor-pointer h-full flex flex-col block ${className}`}>
      <div className="relative aspect-[4/3] overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img alt={property.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" src={property.images?.[0] || ""} />
        
        <button className="absolute top-3 right-3 p-2 bg-white/90 rounded-full hover:bg-mosque hover:text-white transition-colors text-nordic-dark">
          <span className="material-icons text-lg">favorite_border</span>
        </button>
        
        <div className="absolute bottom-3 left-3 flex flex-col gap-1">
          {property.tag && (
            <div className={`text-xs font-bold px-2 py-1 rounded ${getTagColorClasses(property.tag_color)}`}>
              {property.tag.charAt(0).toUpperCase() + property.tag.slice(1)}
            </div>
          )}
          {property.highlight_tag && (
            <div className="text-xs font-bold px-2 py-1 rounded bg-mosque/90 text-white">
              {property.highlight_tag.charAt(0).toUpperCase() + property.highlight_tag.slice(1)}
            </div>
          )}
        </div>
      </div>
      <div className="p-4 flex flex-col flex-grow">
        <div className="flex justify-between items-baseline mb-2">
          <h3 className="font-bold text-lg text-nordic-dark">
            {property.price}
            {property.price_suffix && <span className="text-sm font-normal text-nordic-muted">{property.price_suffix}</span>}
          </h3>
        </div>
        <h4 className="text-nordic-dark font-medium truncate mb-1">{property.title}</h4>
        <p className="text-nordic-muted text-xs mb-4">{property.location}</p>
        
        <div className="mt-auto flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="flex items-center gap-1 text-nordic-muted text-xs" title={dict.common.beds}>
            <span className="material-icons text-sm text-mosque/80">king_bed</span> {property.beds}
          </div>
          <div className="flex items-center gap-1 text-nordic-muted text-xs" title={dict.common.baths}>
            <span className="material-icons text-sm text-mosque/80">bathtub</span> {property.baths}
          </div>
          <div className="flex items-center gap-1 text-nordic-muted text-xs" title={dict.common.sqft}>
            <span className="material-icons text-sm text-mosque/80">square_foot</span> {property.area}
          </div>
        </div>
      </div>
    </Link>
  );
}
