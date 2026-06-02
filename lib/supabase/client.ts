import { createBrowserClient } from '@supabase/ssr';

/**
 * Creates a Supabase client for browser-side usage.
 * The browser client uses `document.cookie` under the hood to read/write
 * auth cookies automatically — no custom cookie handlers are needed.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
