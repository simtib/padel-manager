import { useEffect, useState, type Dispatch, type SetStateAction } from 'react';
import type { EventItem, Facility, PartnerRequest, PlayerGroup, PlayerProfile } from '../types';

const STORAGE_KEY = 'padel_manager_v1_state';

type PersistenceOptions = {
  allPlayers: PlayerProfile[];
  setAllPlayers: Dispatch<SetStateAction<PlayerProfile[]>>;
  currentUser: PlayerProfile;
  setCurrentUser: Dispatch<SetStateAction<PlayerProfile>>;
  facilities: Facility[];
  setFacilities: Dispatch<SetStateAction<Facility[]>>;
  events: EventItem[];
  setEvents: Dispatch<SetStateAction<EventItem[]>>;
  playerGroups: PlayerGroup[];
  setPlayerGroups: Dispatch<SetStateAction<PlayerGroup[]>>;
  partnerRequests: PartnerRequest[];
  setPartnerRequests: Dispatch<SetStateAction<PartnerRequest[]>>;
};

const readJson = <T,>(key: string): T | undefined => {
  const value = localStorage.getItem(key);
  return value ? JSON.parse(value) as T : undefined;
};

export const usePadelPersistence = (options: PersistenceOptions) => {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const players = readJson<PlayerProfile[]>(`${STORAGE_KEY}_players`);
      if (players) options.setAllPlayers(players);
      const facilities = readJson<Facility[]>(`${STORAGE_KEY}_facilities`);
      if (facilities) options.setFacilities(facilities);
      const events = readJson<EventItem[]>(`${STORAGE_KEY}_events`);
      if (events) options.setEvents(events);
      const groups = readJson<PlayerGroup[]>(`${STORAGE_KEY}_groups`);
      if (groups) options.setPlayerGroups(groups);
      const requests = readJson<PartnerRequest[]>(`${STORAGE_KEY}_requests`);
      if (requests) options.setPartnerRequests(requests);

      const savedUserId = localStorage.getItem(`${STORAGE_KEY}_current_user`);
      const savedUser = players?.find((player) => player.id === savedUserId);
      if (savedUser) options.setCurrentUser(savedUser);
    } catch {
      // Corrupt demo state falls back to the provider's seed data.
    } finally {
      setHydrated(true);
    }
    // State setters are stable; hydration intentionally runs once.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(`${STORAGE_KEY}_players`, JSON.stringify(options.allPlayers));
    localStorage.setItem(`${STORAGE_KEY}_facilities`, JSON.stringify(options.facilities));
    localStorage.setItem(`${STORAGE_KEY}_events`, JSON.stringify(options.events));
    localStorage.setItem(`${STORAGE_KEY}_groups`, JSON.stringify(options.playerGroups));
    localStorage.setItem(`${STORAGE_KEY}_requests`, JSON.stringify(options.partnerRequests));
    localStorage.setItem(`${STORAGE_KEY}_current_user`, options.currentUser.id);
  }, [
    hydrated,
    options.allPlayers,
    options.currentUser.id,
    options.events,
    options.facilities,
    options.partnerRequests,
    options.playerGroups,
  ]);

  return hydrated;
};

export const clearPadelPersistence = () => {
  ['players', 'facilities', 'events', 'groups', 'requests', 'current_user'].forEach((suffix) => {
    localStorage.removeItem(`${STORAGE_KEY}_${suffix}`);
  });
};
