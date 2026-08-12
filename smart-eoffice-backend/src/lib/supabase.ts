import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { config } from '../config';

/**
 * Server-side Supabase clients.
 *
 * - `supabaseAdmin`: uses the service_role key → full database bypass, auth user
 *   administration (create/delete users), and Storage access.
 * - `supabaseAuth`: uses the anon key → used ONLY to verify user JWTs via
 *   `getUser(token)` (signature + expiry check). Never exposed to the client.
 */
export const supabaseAdmin: SupabaseClient = createClient(
  config.supabaseUrl,
  config.supabaseServiceRoleKey,
  { auth: { persistSession: false, autoRefreshToken: false } }
);

export const supabaseAuth: SupabaseClient = createClient(
  config.supabaseUrl,
  config.supabaseAnonKey,
  { auth: { persistSession: false, autoRefreshToken: false } }
);

/** Verify a user JWT and return the Supabase auth user, or null when invalid/expired. */
export async function verifyToken(token: string) {
  const { data, error } = await supabaseAuth.auth.getUser(token);
  if (error || !data.user) return null;
  return data.user;
}

export default supabaseAdmin;
