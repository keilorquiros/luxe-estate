"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

interface MarketFiltersProps {
  lang: string;
  dict: any;
}

export default function MarketFilters({ lang, dict }: MarketFiltersProps) {
  const searchParams = useSearchParams();
  const currentTag = searchParams.get("tag") || "";

  const getHref = (tagValue: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (tagValue) {
      params.set("tag", tagValue);
    } else {
      params.delete("tag");
    }
    // Optional: reset page to 1 when changing filters
    params.delete("page");
    return `/${lang}?${params.toString()}#market-section`;
  };

  const isAll = currentTag === "any tag" || currentTag === "" || !searchParams.has("tag");
  const isBuy = currentTag === "for-sale";
  const isRent = currentTag === "for-rent";

  return (
    <div className="hidden md:flex bg-white p-1 rounded-lg shadow-sm border border-gray-100">
      <Link 
        href={getHref(null)}
        className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
          isAll 
            ? "bg-nordic-dark text-white shadow-sm" 
            : "text-nordic-muted hover:text-nordic-dark"
        }`}
      >
        {dict.home.filters.all}
      </Link>
      <Link 
        href={getHref("for-sale")}
        className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
          isBuy 
            ? "bg-nordic-dark text-white shadow-sm" 
            : "text-nordic-muted hover:text-nordic-dark"
        }`}
      >
        {dict.home.filters.buy}
      </Link>
      <Link 
        href={getHref("for-rent")}
        className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
          isRent 
            ? "bg-nordic-dark text-white shadow-sm" 
            : "text-nordic-muted hover:text-nordic-dark"
        }`}
      >
        {dict.home.filters.rent}
      </Link>
    </div>
  );
}
