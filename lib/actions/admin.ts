'use server';

import { createClient } from '../supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';

// ─── Types ────────────────────────────────────────────────────────────────────

export type UserRole = 'admin' | 'agent' | 'user' | 'broker';

export interface UserWithRole {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
  role: UserRole;
  status: string;
  sales_ytd: number;
  last_login: string | null;
  properties_count: number;
}

// ─── Admin client (bypasses RLS via service role) ─────────────────────────────
// Falls back to anon key if service role is not configured.
function getAdminSupabaseClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (serviceRoleKey) {
    return createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      serviceRoleKey,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );
  }
  // No service role key — operations will go through RLS (caller must be admin)
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

// ─── Guard: ensure caller is admin ────────────────────────────────────────────
async function requireAdmin(): Promise<string> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error('Unauthorized');

  const { data: roleRow } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .single();

  if (roleRow?.role !== 'admin') throw new Error('Forbidden');

  return user.id;
}

// ─── Queries ──────────────────────────────────────────────────────────────────

/**
 * Fetch all auth users joined with their role.
 * Requires admin privileges.
 */
export async function getUsersWithRoles(): Promise<UserWithRole[]> {
  await requireAdmin();

  const adminClient = getAdminSupabaseClient();

  // List users from auth.users via Admin API
  const { data: authData, error: authError } =
    await adminClient.auth.admin.listUsers({ perPage: 1000 });

  if (authError) throw new Error(authError.message);

  const users = authData?.users ?? [];

  // Fetch all roles and metadata
  const { data: roles } = await adminClient
    .from('user_roles')
    .select('user_id, role, status, sales_ytd, last_login');

  const roleMap = new Map<string, { role: UserRole; status: string; sales_ytd: number; last_login: string | null }>(
    (roles ?? []).map((r) => [r.user_id, { 
      role: r.role as UserRole, 
      status: r.status ?? 'active', 
      sales_ytd: Number(r.sales_ytd ?? 0), 
      last_login: r.last_login 
    }])
  );

  // Fetch properties to count
  const { data: propCounts } = await adminClient
    .from('properties')
    .select('agent_id')
    .not('agent_id', 'is', null);
  
  const propCountMap = new Map<string, number>();
  (propCounts ?? []).forEach(p => {
    if (p.agent_id) {
      propCountMap.set(p.agent_id, (propCountMap.get(p.agent_id) ?? 0) + 1);
    }
  });

  return users.map((u) => {
    const roleData = roleMap.get(u.id);
    return {
      id: u.id,
      email: u.email ?? '',
      full_name: (u.user_metadata?.full_name as string) ?? null,
      avatar_url: (u.user_metadata?.avatar_url as string) ?? null,
      created_at: u.created_at,
      role: roleData?.role ?? 'user',
      status: roleData?.status ?? 'active',
      sales_ytd: roleData?.sales_ytd ?? 0,
      last_login: roleData?.last_login ?? null,
      properties_count: propCountMap.get(u.id) ?? 0,
    };
  });
}

/**
 * Fetch paginated users for admin view.
 */
export async function getAdminUsers(page = 1) {
  const allUsers = await getUsersWithRoles();
  const total = allUsers.length;
  const pageSize = 20;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const from = (page - 1) * pageSize;
  const to = from + pageSize;
  
  return {
    data: allUsers.slice(from, to),
    total,
    totalPages,
    page,
    pageSize,
  };
}

/**
 * Update the role of a user.
 * Only admins can call this.
 */
export async function updateUserRole(
  userId: string,
  role: UserRole
): Promise<{ success: boolean; error?: string }> {
  try {
    await requireAdmin();

    const adminClient = getAdminSupabaseClient();

    const { error } = await adminClient
      .from('user_roles')
      .upsert({ user_id: userId, role }, { onConflict: 'user_id' });

    if (error) throw new Error(error.message);

    revalidatePath('/[lang]/admin/users', 'page');
    return { success: true };
  } catch (e) {
    return { success: false, error: (e as Error).message };
  }
}

const ADMIN_PAGE_SIZE = 10;

export interface AdminPropertiesFilters {
  minPrice?: number;
  maxPrice?: number;
  tag?: string;
  highlightTag?: string;
  beds?: number;
  baths?: number;
  search?: string;
}

/**
 * Fetch paginated properties (no is_featured filter) for admin view.
 * Returns data for the requested page plus total count metadata.
 */
export async function getAdminProperties(page = 1, filters: AdminPropertiesFilters = {}) {
  await requireAdmin();

  const supabase = await createClient();

  const from = (page - 1) * ADMIN_PAGE_SIZE;
  const to = from + ADMIN_PAGE_SIZE - 1;

  let query = supabase
    .from('properties')
    .select(
      'id, title, location, price, price_numeric, tag, highlight_tag, tag_color, is_featured, is_favorite, beds, baths, area, slug, created_at, images',
      { count: 'exact' }
    );

  // Apply filters
  if (filters.minPrice) {
    query = query.gte('price_numeric', filters.minPrice);
  }
  if (filters.maxPrice) {
    query = query.lte('price_numeric', filters.maxPrice);
  }
  if (filters.tag && filters.tag !== 'any tag') {
    query = query.eq('tag', filters.tag);
  }
  if (filters.highlightTag && filters.highlightTag !== 'any tag' && filters.highlightTag !== 'any highlight') {
    query = query.contains('highlight_tag', [filters.highlightTag]);
  }
  if (filters.beds) {
    query = query.gte('beds', filters.beds);
  }
  if (filters.baths) {
    query = query.gte('baths', filters.baths);
  }
  if (filters.search) {
    query = query.ilike('title', `%${filters.search}%`);
  }

  const { data, error, count } = await query
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error) throw new Error(error.message);

  const total = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / ADMIN_PAGE_SIZE));

  return {
    data: data ?? [],
    total,
    totalPages,
    page,
    pageSize: ADMIN_PAGE_SIZE,
  };
}

/**
 * Delete a property by id.
 */
export async function deleteProperty(
  propertyId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await requireAdmin();

    const supabase = await createClient();
    const { error } = await supabase
      .from('properties')
      .delete()
      .eq('id', propertyId);

    if (error) throw new Error(error.message);

    revalidatePath('/[lang]/admin/properties', 'page');
    return { success: true };
  } catch (e) {
    return { success: false, error: (e as Error).message };
  }
}

/**
 * Fetch a single property by id.
 */
export async function getProperty(id: string) {
  await requireAdmin();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('properties')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw new Error(error.message);
  return data;
}

/**
 * Create a new property.
 */
export async function createProperty(data: any) {
  try {
    await requireAdmin();
    const supabase = await createClient();
    
    const slug = data.slug || data.title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');

    const payload = {
      title: data.title,
      location: data.location,
      price: data.price,
      price_numeric: data.price_numeric ? parseInt(data.price_numeric, 10) : null,
      beds: data.beds,
      baths: data.baths,
      area: data.area,
      tag: data.status, // map status to tag
      type: data.type,
      images: data.images,
      amenities: data.amenities,
      description_i18n: data.description_i18n,
      latitude: data.latitude ? parseFloat(data.latitude) : null,
      longitude: data.longitude ? parseFloat(data.longitude) : null,
      slug,
      garages: data.garages ? parseInt(data.garages, 10) : 0,
      highlight_tag: data.highlight_tag,
    };

    const { error } = await supabase
      .from('properties')
      .insert([payload]);

    if (error) throw new Error(error.message);

    revalidatePath('/[lang]/admin/properties', 'page');
    return { success: true };
  } catch (e) {
    return { success: false, error: (e as Error).message };
  }
}

/**
 * Update an existing property.
 */
export async function updateProperty(id: string, data: any) {
  try {
    await requireAdmin();
    const supabase = await createClient();

    const payload = {
      title: data.title,
      location: data.location,
      price: data.price,
      price_numeric: data.price_numeric ? parseInt(data.price_numeric, 10) : null,
      beds: data.beds,
      baths: data.baths,
      area: data.area,
      tag: data.status, // map status to tag
      type: data.type,
      images: data.images,
      amenities: data.amenities,
      description_i18n: data.description_i18n,
      latitude: data.latitude ? parseFloat(data.latitude) : null,
      longitude: data.longitude ? parseFloat(data.longitude) : null,
      garages: data.garages ? parseInt(data.garages, 10) : 0,
      highlight_tag: data.highlight_tag,
    };

    const { error } = await supabase
      .from('properties')
      .update(payload)
      .eq('id', id);

    if (error) throw new Error(error.message);

    revalidatePath('/[lang]/admin/properties', 'page');
    return { success: true };
  } catch (e) {
    return { success: false, error: (e as Error).message };
  }
}
