import type { PlayerProfile } from '../types';

export type ProfileRow = {
  id: string;
  first_name: string;
  last_name: string;
  display_name: string;
  email: string;
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
  const metadata = user.user_metadata || {};
  const firstName = String(metadata.first_name || 'Player');
  const lastName = String(metadata.last_name || '');
  const displayName = String(
    metadata.display_name || [firstName, lastName].filter(Boolean).join(' ') || user.email || 'Player'
  );
  const { error } = await supabase.from('profiles').upsert({
    id: user.id,
    first_name: firstName,
    last_name: lastName,
    display_name: displayName,
    email: user.email || '',
    avatar_url: metadata.avatar_url || null,
  }, { onConflict: 'id' });
  if (error) throw error;
};
