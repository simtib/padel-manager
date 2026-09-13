import { useEffect, type Dispatch, type SetStateAction } from 'react';
import type { EventFormat, EventItem, EventStatus, EventType, Participant } from '../types';
import type { Database } from '../types/database.types';
import { createClient } from '../lib/supabase/client';
import { reconcileRoster } from './eventRoster';
import { isValidUuid } from './contextHelpers';

type EventRow = Database['public']['Tables']['events']['Row'];

const eventType = (value: string): EventType =>
  value === 'normal_match' ? 'normal_match' : 'tournament';

const eventStatus = (value: string): EventStatus => {
  const statuses: EventStatus[] = [
    'draft', 'open', 'full', 'teams_generated', 'ready', 'in_progress',
    'knockout_stage', 'completed', 'cancelled',
  ];
  return statuses.includes(value as EventStatus) ? value as EventStatus : 'open';
};

const reconcileEvents = (rows: EventRow[], previous: EventItem[], participants: Map<string, Participant[]>): EventItem[] => {
  const cachedById = new Map(previous.map((event) => [event.id, event]));

  return rows.map((row) => {
    const cached = cachedById.get(row.id);
    const type = eventType(row.event_type);
    const storedFormat = (row as EventRow & { format?: string | null }).format;
    const format: EventFormat = storedFormat === 'standard_3_sets' || storedFormat === 'americano' || storedFormat === 'custom'
      ? storedFormat : cached?.format || (type === 'normal_match' ? 'standard_3_sets' : 'custom');
    const roster = reconcileRoster(participants.get(row.id) || [], cached?.participants);
    let status = eventStatus(row.status);
    if (roster.some((player) => !isValidUuid(player.id)) && (status === 'open' || status === 'full')) {
      const confirmedCount = roster.filter((player) => player.status === 'confirmed').length;
      status = confirmedCount >= row.max_players ? 'full' : 'open';
      if (cached && ['teams_generated', 'ready', 'in_progress', 'knockout_stage', 'completed'].includes(cached.status)) {
        status = cached.status;
      }
    }

    return {
      id: row.id,
      name: row.name,
      description: row.description || '',
      type,
      format,
      date: row.event_date,
      startTime: row.start_time,
      facilityId: row.facility_id || '',
      facilityName: cached?.facilityName || '',
      courtIds: cached?.courtIds || [],
      ownerId: row.owner_id,
      ownerName: cached?.ownerName || 'Event Owner',
      coAdminIds: cached?.coAdminIds || [],
      maxPlayers: row.max_players,
      maxTeams: row.max_players / 2,
      visibility: row.visibility === 'public' ? 'public' : 'private',
      playerGroupId: (row as EventRow & { player_group_id?: string | null }).player_group_id || undefined,
      status,
      participants: roster,
      teams: cached?.teams || [],
      groups: cached?.groups || [],
      matches: cached?.matches || [],
      rules: cached?.rules || {
        winPoints: 3,
        drawPoints: 1,
        lossPoints: 0,
        tiebreakOrder: ['points', 'matchesWon', 'scoreDiff', 'scoreFor'],
        qualifiersPerGroup: 2,
      },
      createdAt: row.created_at,
    };
  });
};

export const useSupabaseEventSync = (
  isAuthenticated: boolean,
  setEvents: Dispatch<SetStateAction<EventItem[]>>
) => {
  useEffect(() => {
    if (!isAuthenticated) return;

    const supabase = createClient();
    let active = true;
    let refreshing = false;

    const refreshEvents = async () => {
      if (!active || refreshing) return;
      refreshing = true;
      try {
        const { data, error } = await supabase
          .from('events')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Could not synchronize events from Supabase:', error.message);
          return;
        }
        const participants = new Map<string, Participant[]>();
        const pageSize = 500;
        for (let offset = 0; active; offset += pageSize) {
          const { data: registrations, error: registrationError } = await supabase
            .from('event_participants')
            .select('event_id, id, user_id, guest_player_id, registration_status, joined_at, profiles:player_directory!event_participants_user_id_fkey(display_name), guest_players!event_participants_guest_player_id_fkey(name)')
            .in('registration_status', ['confirmed', 'waiting_list'])
            .order('joined_at')
            .order('id')
            .range(offset, offset + pageSize - 1);
          if (registrationError) throw registrationError;
          for (const row of registrations) {
            const id = row.user_id || row.guest_player_id;
            if (!id) continue;
            const roster = participants.get(row.event_id) || [];
            const status = row.registration_status === 'waiting_list' ? 'waiting_list' : 'confirmed';
            roster.push({
              id,
              displayName: row.profiles?.display_name || row.guest_players?.name || 'Player',
              isGuest: !!row.guest_player_id,
              registeredAt: row.joined_at,
              status,
              waitingListPosition: status === 'waiting_list'
                ? roster.filter((player) => player.status === 'waiting_list').length + 1 : undefined,
            });
            participants.set(row.event_id, roster);
          }
          if (registrations.length < pageSize) break;
        }
        if (active) setEvents((previous) => reconcileEvents(data || [], previous, participants));
      } catch (error) {
        if (active) console.error('Could not synchronize event registrations:', error);
      } finally {
        refreshing = false;
      }
    };

    void refreshEvents();

    const channel = supabase
      .channel('padel-events-sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'events' }, () => {
        void refreshEvents();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'event_participants' }, () => {
        void refreshEvents();
      })
      .subscribe();

    const refreshWhenVisible = () => {
      if (document.visibilityState === 'visible') void refreshEvents();
    };
    window.addEventListener('focus', refreshEvents);
    document.addEventListener('visibilitychange', refreshWhenVisible);
    const interval = window.setInterval(refreshWhenVisible, 15_000);

    return () => {
      active = false;
      window.clearInterval(interval);
      window.removeEventListener('focus', refreshEvents);
      document.removeEventListener('visibilitychange', refreshWhenVisible);
      void supabase.removeChannel(channel);
    };
  }, [isAuthenticated, setEvents]);
};
