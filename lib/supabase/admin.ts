import { createClient } from '@supabase/supabase-js';

/**
 * Admin Supabase client that uses the service role key.
 * This client bypasses Row Level Security (RLS) — use only for
 * trusted server-side operations such as:
 *  - Creating profiles via auth trigger fallbacks
 *  - Admin-level data operations
 *  - Background jobs / webhooks
 *
 * NEVER expose this client or the service role key to the browser.
 */
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  },
);
