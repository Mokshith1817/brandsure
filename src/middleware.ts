import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { verifySignedSessionCookie } from '@/lib/session';
import { isDemoModeAllowed } from '@/lib/data-store';
import { getDemoDraftById } from '@/lib/demo-data';

const DEMO_COOKIE_NAME = 'brandsure_demo_session';

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const pathname = request.nextUrl.pathname;

  // 1. Check for Demo Cookie Session (strictly cryptographically verified)
  let user: { id: string; email: string } | null = null;
  let userRole: string | null = null;

  if (isDemoModeAllowed()) {
    const demoCookie = request.cookies.get(DEMO_COOKIE_NAME)?.value;
    if (demoCookie) {
      const verified = await verifySignedSessionCookie(demoCookie);
      if (verified) {
        const userId =
          verified.userId ||
          (verified.email === 'creator@paynest.demo'
            ? 'demo-creator'
            : verified.email === 'reviewer@paynest.demo'
            ? 'demo-reviewer'
            : verified.email === 'manager@paynest.demo'
            ? 'demo-manager'
            : verified.email === 'admin@paynest.demo'
            ? 'demo-admin'
            : `demo-${verified.email.split('@')[0]}`);
        user = { id: userId, email: verified.email };
        userRole = verified.role;
      }
    }
  }

  // 2. Check Supabase Auth if no verified demo cookie and Supabase credentials exist
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
    pathname.startsWith('/showcase') ||
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

  const isHtmlRequest = request.headers.get('accept')?.includes('text/html') ?? false;

  // Protected paths: If not logged in, reject with 401 for API/curl or redirect for browser
  if (!user) {
    if (!isHtmlRequest) {
      return NextResponse.json({ error: 'Unauthorized: Authentication required.' }, { status: 401 });
    }
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Role-based protection: Admin only routes
  if (pathname.startsWith('/admin')) {
    if (userRole !== 'admin') {
      if (!isHtmlRequest) {
        return NextResponse.json({ error: 'Forbidden: Admin role required.' }, { status: 403 });
      }
      return NextResponse.redirect(new URL('/drafts', request.url));
    }
  }

  // Audit log: Admin and Manager only
  if (pathname.startsWith('/audit')) {
    if (userRole !== 'admin' && userRole !== 'manager') {
      if (!isHtmlRequest) {
        return NextResponse.json({ error: 'Forbidden: Compliance Manager or Admin role required.' }, { status: 403 });
      }
      return NextResponse.redirect(new URL('/drafts', request.url));
    }
  }

  // Approvals queue: Manager and Admin only
  if (pathname.startsWith('/approvals')) {
    if (userRole !== 'admin' && userRole !== 'manager') {
      if (!isHtmlRequest) {
        return NextResponse.json({ error: 'Forbidden: Compliance Manager or Admin role required.' }, { status: 403 });
      }
      return NextResponse.redirect(new URL('/drafts', request.url));
    }
  }

  // Review queue: Reviewer, Manager, and Admin only
  if (pathname.startsWith('/reviews')) {
    if (userRole !== 'reviewer' && userRole !== 'manager' && userRole !== 'admin') {
      if (!isHtmlRequest) {
        return NextResponse.json({ error: 'Forbidden: Reviewer, Manager, or Admin role required.' }, { status: 403 });
      }
      return NextResponse.redirect(new URL('/drafts', request.url));
    }
  }

  // Creator Draft Isolation: Creator A cannot view Creator B's draft
  if (userRole === 'creator' && pathname.startsWith('/drafts/')) {
    const draftId = pathname.replace('/drafts/', '').split('/')[0];
    if (draftId && draftId !== 'new') {
      if (isDemoModeAllowed()) {
        const demoDraftObj = getDemoDraftById(draftId);
        if (demoDraftObj && user && demoDraftObj.draft.creator_id !== user.id) {
          if (!isHtmlRequest) {
            return NextResponse.json(
              { error: 'Forbidden: Creators may only access drafts they personally authored.' },
              { status: 403 }
            );
          }
          return new NextResponse(
            `<!DOCTYPE html><html><head><title>403 Forbidden | BrandSure</title></head><body style="font-family:sans-serif;padding:40px;text-align:center;">
              <h1 style="color:#dc2626;">Access Denied (403 Forbidden)</h1>
              <p>You do not have permission to view this draft. Creators may only access drafts they personally authored.</p>
              <a href="/drafts" style="color:#4f46e5;font-weight:600;">Return to My Drafts</a>
            </body></html>`,
            {
              status: 403,
              headers: { 'content-type': 'text/html; charset=utf-8' },
            }
          );
        }
      }
    }
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
