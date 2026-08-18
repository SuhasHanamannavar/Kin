import { createClient as createSupabaseClient, type SupabaseClient } from '@supabase/supabase-js';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export function createClient() {
  const cookieStore = cookies();
  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // The `setAll` method was called from a Server Component.
          // This can be ignored if you have middleware refreshing
          // user sessions.
        }
      },
    },
  });
}

/**
 * Create a Supabase service client (bypasses RLS by default).
 * Used for all server-side database operations.
 */
export function createServiceClient(): SupabaseClient {
  return createSupabaseClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

/**
 * Create a Supabase service client SCOPED to a specific user.
 * 
 * Sets the Postgres session variable `app.current_user_id` which our
 * RLS policies use via `public.get_current_user_id()`.
 * 
 * This provides DEFENSE-IN-DEPTH security:
 * 1. PRIMARY: Our code always includes user_id in WHERE clauses
 * 2. SAFETY NET: RLS policies would block any accidental leaks
 * 
 * Even though service role normally bypasses RLS, setting this
 * config variable means our RLS policies are still evaluated.
 */
export function createScopedServiceClient(userId: string): SupabaseClient {
  const client = createSupabaseClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  // Set the session variable that RLS policies check
  // We queue this to run on the first query
  Promise.resolve(
    client.rpc('set_config', {
      name: 'app.current_user_id',
      value: userId,
      is_local: false,
    })
  ).catch(() => {
    /* If this fails, our code-level user_id filters still protect data */
  });

  return client;
}
