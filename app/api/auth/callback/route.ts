import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * OAuth callback route handler.
 *
 * After a user authenticates with an OAuth provider (Google, GitHub, etc.),
 * Supabase redirects back to this endpoint with a `code` query parameter.
 * We exchange that code for a session, then redirect the user to their
 * intended destination (or /dashboard by default).
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/dashboard';

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Use 303 See Other so the browser issues a GET to the redirect target.
      return Response.redirect(`${origin}${next}`, 303);
    }
  }

  // If there's no code or the exchange failed, redirect to an error page.
  return Response.redirect(`${origin}/login?error=auth_callback_failed`, 303);
}
