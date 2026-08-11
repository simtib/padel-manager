import { createBrowserClient } from '@supabase/ssr';
import { Database } from '../../types/database.types';
import type { SupabaseClient } from '@supabase/supabase-js';

export function createClient(): SupabaseClient<Database> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || 'placeholder-key';

  return createBrowserClient<Database>(supabaseUrl, supabaseKey, {
    // Auth listeners and callers should share one browser client. Creating a
    // client per action duplicates internal state and subscription work.
    isSingleton: true,
  });
}
