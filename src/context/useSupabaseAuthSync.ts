import { useEffect, type Dispatch, type SetStateAction } from 'react';
import type { PlayerProfile } from '../types';
import { createClient } from '../lib/supabase/client';
import { toPlayerProfile, type ProfileRow } from './authProfile';

type AuthSyncOptions = {
  setIsAuthenticated: Dispatch<SetStateAction<boolean>>;
  setCurrentUser: Dispatch<SetStateAction<PlayerProfile>>;
  setAllPlayers: Dispatch<SetStateAction<PlayerProfile[]>>;
};

export const useSupabaseAuthSync = ({
  setIsAuthenticated,
  setCurrentUser,
  setAllPlayers,
}: AuthSyncOptions) => {
  useEffect(() => {
    const supabase = createClient();

    const applySession = async (session: Awaited<ReturnType<typeof supabase.auth.getSession>>['data']['session']) => {
      if (!session?.user) {
        setIsAuthenticated(false);
        return;
      }

      setIsAuthenticated(true);
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .maybeSingle();
      if (!data) return;

      const playerProfile = toPlayerProfile(data as ProfileRow, session.user);
      setCurrentUser(playerProfile);
      setAllPlayers((previous) => previous.some((player) => player.id === playerProfile.id)
        ? previous
        : [playerProfile, ...previous]);
    };

    void supabase.auth.getSession()
      .then(({ data }) => applySession(data.session))
      .catch((error) => console.error('Error initializing Supabase Auth:', error));

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      void applySession(session);
    });

    return () => subscription.unsubscribe();
  }, [setAllPlayers, setCurrentUser, setIsAuthenticated]);
};
