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
  beds: number;
  baths: number;
  area: string;
  image_url: string;
  image_alt: string;
  tag: string;
  tag_color: "white" | "mosque" | "nordic-dark" | null;
  is_featured: boolean;
  is_favorite: boolean;
  created_at: string;
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

export async function getMarketProperties(
  page: number = 1
): Promise<PaginatedProperties> {
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const { data, error, count } = await supabase
    .from("properties")
    .select("*", { count: "exact" })
    .eq("is_featured", false)
    .order("created_at", { ascending: true })
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
