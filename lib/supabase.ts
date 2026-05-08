import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Property {
  id: string;
  title: string;
  location: string;
  price: string;
  price_suffix: string | null;
  price_numeric?: number; // Added for filtering
  latitude?: number;
  longitude?: number;
  beds: number;
  baths: number;
  area: string;
  images: string[];
  amenities?: string[]; // filter slugs — keep separate from multilingual display list
  /** English is canonical in Supabase rows; UI falls back locale → `en`. */
  description_i18n?: Record<string, string> | null;
  /** Parallel lists per locale, same phrases translated (not filter keys). */
  amenities_detail_i18n?: Record<string, string[]> | null;
  tag: string | null;
  highlight_tag: string | null;
  tag_color: "white" | "mosque" | "nordic-dark" | null;
  is_featured: boolean;
  is_favorite: boolean;
  created_at: string;
  slug: string;
}

// ─── Queries ──────────────────────────────────────────────────────────────────

const PAGE_SIZE = 8;

export async function getFeaturedProperties(): Promise<Property[]> {
  const { data, error } = await supabase
    .from("properties")
    .select("*")
    .eq("is_featured", true)
    .order("created_at", { ascending: true });

  if (error) throw new Error(error.message);
  return data ?? [];
}

export interface PaginatedProperties {
  properties: Property[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface PropertyFilters {
  q?: string;
  type?: string;
  beds?: number;
  baths?: number;
  minPrice?: number;
  maxPrice?: number;
  tag?: string;
  highlightTag?: string;
  amenities?: string[];
}

export async function getMarketProperties(
  page: number = 1,
  filters: PropertyFilters = {}
): Promise<PaginatedProperties> {
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  let query = supabase
    .from("properties")
    .select("*", { count: "exact" });

  const hasTypeFilter = filters.type && filters.type !== "All" && filters.type !== "Any Type";
  const hasTagFilter = filters.tag && filters.tag !== "Any Tag" && filters.tag !== "any tag";
  const hasHighlightTagFilter = filters.highlightTag && filters.highlightTag !== "Any Tag" && filters.highlightTag !== "any highlight";
  const hasAmenitiesFilter = filters.amenities && filters.amenities.length > 0;
  const hasAnyFilter = !!(filters.q || hasTypeFilter || filters.beds || filters.baths || filters.minPrice || filters.maxPrice || hasTagFilter || hasHighlightTagFilter || hasAmenitiesFilter);

  if (!hasAnyFilter) {
    query = query.eq("is_featured", false);
  }

  if (filters.q) {
    // Basic text search on location or title
    query = query.or(`location.ilike.%${filters.q}%,title.ilike.%${filters.q}%`);
  }
  
  if (filters.type && filters.type !== "All" && filters.type !== "Any Type") {
    if (filters.type === "House") {
      query = query.or(`title.ilike.%House%,title.ilike.%Home%,title.ilike.%Mansion%,title.ilike.%Estate%,title.ilike.%Chalet%,title.ilike.%Retreat%`);
    } else if (filters.type === "Apartment") {
      query = query.or(`title.ilike.%Apartment%,title.ilike.%Loft%,title.ilike.%Condo%,title.ilike.%Studio%`);
    } else {
      query = query.ilike('title', `%${filters.type}%`);
    }
  }
  
  if (filters.beds && filters.beds > 0) {
    query = query.gte('beds', filters.beds);
  }
  
  if (filters.baths && filters.baths > 0) {
    query = query.gte('baths', filters.baths);
  }
  
  if (filters.minPrice) {
    query = query.gte('price_numeric', filters.minPrice);
  }
  
  if (filters.maxPrice) {
    query = query.lte('price_numeric', filters.maxPrice);
  }

  if (filters.tag && filters.tag !== "Any Tag") {
    query = query.eq('tag', filters.tag);
  }

  if (filters.highlightTag && filters.highlightTag !== "Any Tag" && filters.highlightTag !== "any highlight") {
    query = query.eq('highlight_tag', filters.highlightTag);
  }

  if (filters.amenities && filters.amenities.length > 0) {
    query = query.contains('amenities', filters.amenities);
  }

  const { data, error, count } = await query
    .order("created_at", { ascending: false }) // Changed to false to show new properties first
    .range(from, to);

  if (error) throw new Error(error.message);

  const total = count ?? 0;
  return {
    properties: data ?? [],
    total,
    page,
    pageSize: PAGE_SIZE,
    totalPages: Math.ceil(total / PAGE_SIZE),
  };
}

export async function getPropertyBySlug(slug: string): Promise<Property | null> {
  const { data, error } = await supabase
    .from("properties")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null; // No rows found
    throw new Error(error.message);
  }
  return data;
}

