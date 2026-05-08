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

/**
 * Fetch paginated properties (no is_featured filter) for admin view.
 * Returns data for the requested page plus total count metadata.
 */
export async function getAdminProperties(page = 1) {
  await requireAdmin();

  const supabase = await createClient();

  const from = (page - 1) * ADMIN_PAGE_SIZE;
  const to = from + ADMIN_PAGE_SIZE - 1;

  const { data, error, count } = await supabase
    .from('properties')
    .select(
      'id, title, location, price, price_numeric, tag, tag_color, is_featured, is_favorite, beds, baths, area, slug, created_at, images',
      { count: 'exact' }
    )
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
