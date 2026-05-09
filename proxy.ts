import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { locales, defaultLocale } from './lib/i18n';
import { match } from '@formatjs/intl-localematcher';
import Negotiator from 'negotiator';
import { createServerClient } from '@supabase/ssr';

// ─── i18n helpers ─────────────────────────────────────────────────────────────

function getLocale(request: NextRequest): string {
  // 1. Check for cookie
  const cookieLocale = request.cookies.get('NEXT_LOCALE')?.value;
  if (cookieLocale && locales.includes(cookieLocale as any)) {
    return cookieLocale;
  }

  // 2. Check Accept-Language header
  const negotiatorHeaders: Record<string, string> = {};
  request.headers.forEach((value, key) => (negotiatorHeaders[key] = value));

  // @ts-ignore
  const languages = new Negotiator({ headers: negotiatorHeaders }).languages();

  try {
    return match(languages, locales as unknown as string[], defaultLocale);
  } catch (e) {
    return defaultLocale;
  }
}

// ─── Proxy ─────────────────────────────────────────────────────────────────────

export default async function proxy(request: NextRequest) {
  console.log('Proxy running for:', request.nextUrl.pathname);
  const { pathname } = request.nextUrl;

  // ── 1. i18n redirect ────────────────────────────────────────────────────────
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  if (!pathnameHasLocale) {
    const locale = getLocale(request);
    request.nextUrl.pathname = `/${locale}${pathname}`;
    return NextResponse.redirect(request.nextUrl);
  }

  // ── 2. RBAC: protect /[lang]/admin/** ────────────────────────────────────────
  // Determine current locale from path
  const lang = locales.find(
    (l) => pathname.startsWith(`/${l}/`) || pathname === `/${l}`
  ) ?? defaultLocale;

  const isAdminRoute = pathname.startsWith(`/${lang}/admin`);

  if (isAdminRoute) {
    // Build Supabase SSR client using request cookies (session refresh)
    let response = NextResponse.next({ request });

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) =>
              request.cookies.set(name, value)
            );
            response = NextResponse.next({ request });
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options)
            );
          },
        },
      }
    );

    // Verify session — always call getUser() per Supabase recommendation
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Not authenticated → redirect to login
    if (!user) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = `/${lang}/login`;
      loginUrl.searchParams.set('redirectTo', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Check role via RPC (avoids RLS self-referencing recursion)
    const { data: role } = await supabase.rpc('get_my_role');

    if (role !== 'admin') {
      // Authenticated but not admin → redirect to home
      const homeUrl = request.nextUrl.clone();
      homeUrl.pathname = `/${lang}`;
      homeUrl.search = '';
      return NextResponse.redirect(homeUrl);
    }

    // Admin ✓ — continue, passing refreshed cookies
    return response;
  }

  // Default: pass through
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     * - any file with an extension (e.g. .css, .js, .png, .jpg)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.[\\w]+$).*)',
  ],
};
