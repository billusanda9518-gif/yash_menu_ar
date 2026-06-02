import { createServerClient } from '@supabase/ssr';
import { type NextRequest, NextResponse } from 'next/server';

/**
 * Refreshes the Supabase auth session within Next.js middleware.
 *
 * This function creates a Supabase client that reads cookies from the incoming
 * request and writes any updated session cookies onto the outgoing response.
 * Calling `getUser()` triggers a token refresh if the access token has expired,
 * and the refreshed tokens are written back via `setAll`.
 *
 * Returns `{ response, user }` so the middleware can make routing decisions.
 */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet, headers) {
          // Set cookies on the request so downstream Server Components see them.
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );

          // Clone the response to carry forward any previously set headers.
          response = NextResponse.next({
            request,
          });

          // Set cookies on the response so they propagate to the browser.
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );

          // Apply cache-busting headers from @supabase/ssr to prevent CDN
          // caching of responses that set auth cookies.
          if (headers) {
            Object.entries(headers).forEach(([key, value]) =>
              response.headers.set(key, value),
            );
          }
        },
      },
    },
  );

  // Calling getUser() triggers a token refresh when the access token has
  // expired. The refreshed tokens are written back via setAll above.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return { response, user };
}
