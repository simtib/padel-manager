import 'server-only';
import { createClient } from './supabase/server';

export class AdminError extends Error {
  constructor(message: string, public status: number) { super(message); }
}

// Check the current database role on every request, not a cached JWT claim or
// user-editable metadata. All subsequent queries also run under this user's RLS.
export async function requireAdmin(superOnly = false) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) throw new AdminError('Please sign in.', 401);
  const { data: profile, error } = await supabase.from('profiles').select('id, role, display_name').eq('id', user.id).single();
  if (error || !profile || !['admin', 'super_admin'].includes(profile.role) || (superOnly && profile.role !== 'super_admin')) {
    throw new AdminError('You do not have access to this admin operation.', 403);
  }
  return { supabase, user, profile };
}
