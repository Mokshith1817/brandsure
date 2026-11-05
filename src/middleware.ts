import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

const DEMO_COOKIE_NAME = 'brandsure_demo_session';

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const pathname = request.nextUrl.pathname;

  // 1. Check for Demo Cookie Session
  let user: { id: string; email: string } | null = null;
  let userRole: string | null = null;

  const demoCookie = request.cookies.get(DEMO_COOKIE_NAME)?.value;
  if (demoCookie) {
    try {
      const parsed = JSON.parse(demoCookie);
      if (parsed.email && parsed.role) {
        user = { id: `demo-${parsed.role}`, email: parsed.email };
        userRole = parsed.role;
      }
    } catch {
      // Ignore invalid demo cookie
    }
  }

  // 2. Check Supabase Auth if no demo cookie and Supabase credentials exist
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const isRealSupabase = supabaseUrl && supabaseKey && !supabaseUrl.includes('placeholder.supabase.co');

  if (!user && isRealSupabase) {
    const supabase = createServerClient(supabaseUrl, supabaseKey, {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: '', ...options });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({ name, value: '', ...options });
        },
      },
    });

    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (authUser) {
      user = { id: authUser.id, email: authUser.email || '' };
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', authUser.id)
        .single();
      userRole = profile?.role || null;
    }
  }

  // Public paths allowed without login
  const isPublicPath =
    pathname === '/login' ||
    pathname.startsWith('/about-ai') ||
    pathname.startsWith('/demo-guide') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/') ||
    pathname === '/favicon.ico';

  if (isPublicPath) {
    if (user && pathname === '/login') {
      return NextResponse.redirect(new URL('/', request.url));
    }
    return response;
  }

  // Protected paths: If not logged in, redirect to /login
  if (!user) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Role-based protection: Admin only routes
  if (pathname.startsWith('/admin')) {
    if (userRole !== 'admin') {
      return NextResponse.redirect(new URL('/drafts', request.url));
    }
  }

  // Audit log: Admin and Manager only
  if (pathname.startsWith('/audit')) {
    if (userRole !== 'admin' && userRole !== 'manager') {
      return NextResponse.redirect(new URL('/drafts', request.url));
    }
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
