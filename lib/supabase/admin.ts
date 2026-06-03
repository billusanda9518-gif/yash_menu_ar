import { createClient, type SupabaseClient } from '@supabase/supabase-js';

/**
 * Admin Supabase client that uses the service role key.
 * This client bypasses Row Level Security (RLS) — use only for
 * trusted server-side operations such as:
 *  - Creating profiles via auth trigger fallbacks
 *  - Admin-level data operations
 *  - Background jobs / webhooks
 *
 * NEVER expose this client or the service role key to the browser.
 *
 * Lazily initialized to avoid crashing during build-time static
 * page generation when environment variables are not yet available.
 */
let _supabaseAdmin: SupabaseClient | null = null;

function getSupabaseAdmin(): SupabaseClient {
  if (!_supabaseAdmin) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) {
      throw new Error(
        'Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables',
      );
    }
    _supabaseAdmin = createClient(url, key, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }
  return _supabaseAdmin;
}

/**
 * Lazy-initialized admin client.
 * Access via property getter so it's only created at runtime, not build time.
 */
export const supabaseAdmin = new Proxy({} as SupabaseClient, {
  get(_target, prop, receiver) {
    const client = getSupabaseAdmin();
    const value = Reflect.get(client, prop, receiver);
    if (typeof value === 'function') {
      return value.bind(client);
    }
    return value;
  },
});

