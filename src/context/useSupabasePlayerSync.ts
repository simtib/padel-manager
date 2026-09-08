import { useEffect, type Dispatch, type SetStateAction } from 'react';
import type { PlayerProfile } from '../types';
import { createClient } from '../lib/supabase/client';
import { toPlayerProfile, type ProfileRow } from './authProfile';

export const useSupabasePlayerSync = (
  isAuthenticated: boolean,
  setAllPlayers: Dispatch<SetStateAction<PlayerProfile[]>>,
) => {
  useEffect(() => {
    if (!isAuthenticated) return;

    const supabase = createClient();
    let disposed = false;
    let loading = false;

    const refresh = async () => {
      if (disposed || loading || document.visibilityState === 'hidden') return;
      loading = true;
      try {
        const rows: ProfileRow[] = [];
        // Fetch every page so the directory is not capped by the API row limit.
        const pageSize = 500;
        for (let offset = 0; !disposed; offset += pageSize) {
          const { data, error } = await supabase.from('profiles')
            .select('id, first_name, last_name, display_name, email, phone, avatar_url, created_at')
            .order('id')
            .range(offset, offset + pageSize - 1);
          if (error) throw error;
          rows.push(...(data as ProfileRow[]));
          if (data.length < pageSize) break;
        }
        if (disposed) return;

        setAllPlayers((previous) => {
          const cached = new Map(previous.map((player) => [player.id, player]));
          return rows.map((row) => {
            const profile = toPlayerProfile(row, { id: row.id });
            const existing = cached.get(row.id);
            // Keep locally calculated match statistics while refreshing identity fields.
            return existing ? {
              ...existing,
              id: profile.id,
              firstName: profile.firstName,
              lastName: profile.lastName,
              displayName: profile.displayName,
              email: profile.email,
              mobileNumber: profile.mobileNumber,
              avatarUrl: profile.avatarUrl,
              createdAt: profile.createdAt,
            } : profile;
          });
        });
      } catch (error) {
        if (!disposed) console.error('Error refreshing player directory:', error);
      } finally {
        loading = false;
      }
    };

    const onRefresh = () => { void refresh(); };
    onRefresh();
    const interval = window.setInterval(onRefresh, 15_000);
    window.addEventListener('focus', onRefresh);
    document.addEventListener('visibilitychange', onRefresh);
    return () => {
      disposed = true;
      window.clearInterval(interval);
      window.removeEventListener('focus', onRefresh);
      document.removeEventListener('visibilitychange', onRefresh);
    };
  }, [isAuthenticated, setAllPlayers]);
};
