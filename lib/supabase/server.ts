import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

/**
 * Creates a Supabase client for Server Components, Server Actions, and Route Handlers.
 *
 * In Next.js 16 `cookies()` returns a Promise, so this function must be async.
 * The `setAll` handler is provided so that token refreshes triggered by
 * `getUser()` / `getSession()` can write updated cookies back to the response.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // `setAll` is called from a Server Component where response cookies
            // cannot be set. This is safe to ignore when a middleware is
            // configured to handle session refresh.
          }
        },
      },
    },
  );
}
