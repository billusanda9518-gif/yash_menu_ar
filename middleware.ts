import { type NextRequest, NextResponse } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

export async function middleware(request: NextRequest) {
  const { response, user } = await updateSession(request);
  const { pathname } = request.nextUrl;

  console.log(`[Middleware] Path: ${pathname}, User: ${user ? user.email : 'None'}`);

  // Protected routes — require authentication
  if (pathname.startsWith('/dashboard')) {
    if (!user) {
      console.log(`[Middleware] Unauthorized access to ${pathname}, redirecting to login`);
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = '/login';
      loginUrl.searchParams.set('redirect', pathname);
      
      const redirectResponse = NextResponse.redirect(loginUrl);
      // Copy refreshed session cookies to the redirect response
      response.cookies.getAll().forEach((cookie) => {
        redirectResponse.cookies.set(cookie.name, cookie.value, {
          path: cookie.path,
          domain: cookie.domain,
          maxAge: cookie.maxAge,
          secure: cookie.secure,
          httpOnly: cookie.httpOnly,
          sameSite: cookie.sameSite,
        });
      });
      return redirectResponse;
    }
  }

  // Auth pages — redirect authenticated users to dashboard
  const authPages = ['/login', '/signup'];
  if (authPages.includes(pathname)) {
    if (user) {
      console.log(`[Middleware] Authenticated user on ${pathname}, redirecting to dashboard`);
      const dashboardUrl = request.nextUrl.clone();
      dashboardUrl.pathname = '/dashboard';
      
      const redirectResponse = NextResponse.redirect(dashboardUrl);
      // Copy refreshed session cookies to the redirect response
      response.cookies.getAll().forEach((cookie) => {
        redirectResponse.cookies.set(cookie.name, cookie.value, {
          path: cookie.path,
          domain: cookie.domain,
          maxAge: cookie.maxAge,
          secure: cookie.secure,
          httpOnly: cookie.httpOnly,
          sameSite: cookie.sameSite,
        });
      });
      return redirectResponse;
    }
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon\\.ico|sitemap\\.xml|robots\\.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|glb|gltf)$).*)',
  ],
};
