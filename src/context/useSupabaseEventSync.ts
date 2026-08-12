import { useEffect, type Dispatch, type SetStateAction } from 'react';
import type { EventFormat, EventItem, EventStatus, EventType } from '../types';
import type { Database } from '../types/database.types';
import { createClient } from '../lib/supabase/client';

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

const reconcileEvents = (rows: EventRow[], previous: EventItem[]): EventItem[] => {
  const cachedById = new Map(previous.map((event) => [event.id, event]));

  return rows.map((row) => {
    const cached = cachedById.get(row.id);
    const type = eventType(row.event_type);
    const format: EventFormat = cached?.format || (type === 'normal_match' ? 'standard_3_sets' : 'custom');

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
      status: eventStatus(row.status),
      participants: cached?.participants || [],
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

    const refreshEvents = async () => {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Could not synchronize events from Supabase:', error.message);
        return;
      }
      if (active) setEvents((previous) => reconcileEvents(data || [], previous));
    };

    void refreshEvents();

    const channel = supabase
      .channel('padel-events-sync')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'events' }, () => {
        void refreshEvents();
      })
      .subscribe();

    const refreshWhenVisible = () => {
      if (document.visibilityState === 'visible') void refreshEvents();
    };
    window.addEventListener('focus', refreshEvents);
    document.addEventListener('visibilitychange', refreshWhenVisible);

    return () => {
      active = false;
      window.removeEventListener('focus', refreshEvents);
      document.removeEventListener('visibilitychange', refreshWhenVisible);
      void supabase.removeChannel(channel);
    };
  }, [isAuthenticated, setEvents]);
};
