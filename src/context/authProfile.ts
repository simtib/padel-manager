import type { AppRole, PlayerProfile } from '../types';

export type ProfileRow = {
  id: string;
  first_name: string;
  last_name: string;
  display_name: string;
  email?: string;
  role?: AppRole;
  plan?: 'free' | 'pro';
  phone?: string | null;
  avatar_url?: string | null;
  created_at?: string;
};

type AuthUser = {
  id: string;
  email?: string | null;
  user_metadata?: Record<string, unknown>;
};

export const toPlayerProfile = (profile: ProfileRow | null, user: AuthUser): PlayerProfile => {
  const metadata = user.user_metadata || {};
  const email = profile?.email || user.email || '';
  return {
    role: profile?.role || 'user',
    plan: profile?.plan || 'free',
    id: profile?.id || user.id,
    firstName: profile?.first_name || String(metadata.first_name || 'Player'),
    lastName: profile?.last_name || String(metadata.last_name || ''),
    displayName: profile?.display_name || String(metadata.display_name || email || 'Player'),
    email,
    mobileNumber: profile?.phone || '',
    avatarUrl: profile?.avatar_url || `https://i.pravatar.cc/150?u=${encodeURIComponent(email)}`,
    createdAt: profile?.created_at || new Date().toISOString(),
    eventsPlayed: 0,
    matchesPlayed: 0,
    matchesWon: 0,
    matchesLost: 0,
    winRate: 0,
    totalGamesWon: 0,
    totalGamesLost: 0,
    recentEvents: [],
  };
};

export const ensureProfile = async (supabase: any, user: AuthUser) => {
  const { data: existing, error: readError } = await supabase.from('profiles').select('id').eq('id', user.id).maybeSingle();
  if (readError) throw readError;
  if (existing) return;
  // A cached session can survive a database reset or account deletion.
  // Only repair profiles for accounts that still exist in Supabase Auth.
  const { data, error: authError } = await supabase.auth.getUser();
  if (authError || !data?.user || data.user.id !== user.id) {
    throw new Error('Your account could not be verified. Please sign out and sign in again before continuing.');
  }
  user = data.user;
  const metadata = user.user_metadata || {};
  const firstName = String(metadata.first_name || 'Player');
  const lastName = String(metadata.last_name || '');
  const displayName = String(
    metadata.display_name || [firstName, lastName].filter(Boolean).join(' ') || user.email || 'Player'
  );
  const { error } = await supabase.from('profiles').insert({
    id: user.id,
    first_name: firstName,
    last_name: lastName,
    display_name: displayName,
    email: user.email || '',
    avatar_url: metadata.avatar_url || null,
  });
  if (error?.code === '23503') {
    throw new Error('Your account is no longer available. Please sign out and sign in again before continuing.');
  }
  if (error && error.code !== '23505') throw error;
};
