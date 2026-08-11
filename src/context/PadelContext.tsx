'use client';

import React, { createContext, useContext, useState } from 'react';
import {
  User,
  PlayerProfile,
  Facility,
  EventItem,
  PlayerGroup,
  NotificationItem,
  PartnerRequest,
  Team,
  TournamentGroup,
  Match,
  GuestPlayer,
  Participant,
  SetScore
} from '../types';
import { createClient } from '../lib/supabase/client';
import {
  SEED_FACILITIES,
  SEED_PLAYERS,
  SEED_GROUPS,
  SEED_EVENTS,
} from '../data/seedData';
import {
  generateTeamsFromParticipants,
  generateGroups,
  generateRoundRobinFixtures,
  generateKnockoutBracket,
  advanceKnockoutWinner,
  identifyQualifiers,
  recalculatePlayerStats
} from '../utils/engine';
import type { PadelContextValue } from './PadelContext.types';
import { createNotificationId, isValidUuid } from './contextHelpers';
import { clearPadelPersistence, usePadelPersistence } from './usePadelPersistence';
import { ensureProfile, toPlayerProfile, type ProfileRow } from './authProfile';
import { useSupabaseAuthSync } from './useSupabaseAuthSync';

// The app's seed/localStorage data uses human-readable string IDs (e.g. 'fac_1',
// 'c1'), but the Supabase schema stores facilities/courts/events ids as UUIDs.
// This guard prevents pushing those client string IDs into UUID columns, which
// would fail with an invalid-UUID / foreign-key violation.
const PadelContext = createContext<PadelContextValue | null>(null);

const SEED_PARTNER_REQUESTS: PartnerRequest[] = [
  {
    id: 'req_seed_1',
    eventId: 'evt_abudhabi_cup_2026',
    fromUserId: 'usr_john',
    fromUserName: 'John Smith',
    toUserId: 'usr_ahmed',
    toUserName: 'Ahmed Al Mansoori',
    status: 'accepted',
    createdAt: '2026-08-06T10:05:00Z',
  },
];

const SEED_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif_1',
    userId: 'usr_simone',
    title: 'Dubai Championship Ready',
    message: 'Knockout Quarter-Final matches are ready to be played at Dubai Padel Club.',
    date: '2026-08-07T08:00:00Z',
    read: false,
    eventId: 'evt_dubai_championship_2026',
  },
  {
    id: 'notif_2',
    userId: 'usr_marco',
    title: 'Partner Confirmed',
    message: 'Simone Rossi accepted your partner request for Dubai Night Padel Championship.',
    date: '2026-08-06T12:00:00Z',
    read: true,
    eventId: 'evt_dubai_championship_2026',
  },
];

// All state is initialized from seed data so the server render and the
// first client render match exactly. Persisted localStorage state is only
// applied AFTER mount (see hydrate effect below) to avoid hydration mismatches.
export const PadelProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [allPlayers, setAllPlayers] = useState<PlayerProfile[]>(SEED_PLAYERS);
  const [currentUser, setCurrentUser] = useState<PlayerProfile>(SEED_PLAYERS[0]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [facilities, setFacilities] = useState<Facility[]>(SEED_FACILITIES);
  const [events, setEvents] = useState<EventItem[]>(SEED_EVENTS);
  const [playerGroups, setPlayerGroups] = useState<PlayerGroup[]>(SEED_GROUPS);
  const [partnerRequests, setPartnerRequests] = useState<PartnerRequest[]>(SEED_PARTNER_REQUESTS);
  const [notifications, setNotifications] = useState<NotificationItem[]>(SEED_NOTIFICATIONS);

  usePadelPersistence({
    allPlayers, setAllPlayers, currentUser, setCurrentUser, facilities, setFacilities,
    events, setEvents, playerGroups, setPlayerGroups, partnerRequests, setPartnerRequests,
  });
  useSupabaseAuthSync({ setIsAuthenticated, setCurrentUser, setAllPlayers });

  const reportOperationError = (title: string, error: unknown) => {
    const message = error instanceof Error ? error.message : String(error || 'Unexpected error');
    setNotifications((previous) => [{
      id: createNotificationId('error'),
      userId: currentUser.id,
      title,
      message,
      date: new Date().toISOString(),
      read: false,
    }, ...previous]);
  };

  const clearNotifications = () => {
    setNotifications((previous) => previous.filter(
      (notification) => notification.userId !== currentUser.id
    ));
  };

  // Supabase Auth Action Implementations
  const signUpAction = async (data: { firstName: string; lastName: string; email: string; password: string }) => {
    try {
      const supabase = createClient();
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            first_name: data.firstName,
            last_name: data.lastName,
            display_name: `${data.firstName} ${data.lastName}`,
          },
        },
      });

      if (authError) {
        console.error('Supabase signup failed:', authError);
        return { success: false, error: authError.message };
      }

      // If session is present immediately (e.g. email confirmation disabled), handle profile
      if (authData.session && authData.user) {
        await ensureProfile(supabase, authData.user);
        const newPlayer: PlayerProfile = {
          id: authData.user.id,
          firstName: data.firstName,
          lastName: data.lastName,
          displayName: `${data.firstName} ${data.lastName}`,
          email: data.email,
          avatarUrl: `https://i.pravatar.cc/150?u=${data.email}`,
          createdAt: new Date().toISOString(),
          eventsPlayed: 0,
          matchesPlayed: 0,
          matchesWon: 0,
          matchesLost: 0,
          winRate: 0,
          totalGamesWon: 0,
          totalGamesLost: 0,
          recentEvents: [],
        };

        setAllPlayers((prev) => [...prev, newPlayer]);
        setCurrentUser(newPlayer);
      }

      return { success: true };
    } catch (err: any) {
      console.error('Supabase signup exception:', err?.name || 'unknown_error', err?.message || 'no message');
      return { success: false, error: err.message || 'Failed to create account' };
    }
  };

  const loginAction = async (email: string, password: string) => {
    try {
      const supabase = createClient();
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        console.error('Supabase login failed:', authError);
        return { success: false, error: authError.message };
      }

      if (authData.user) {
        await ensureProfile(supabase, authData.user);
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authData.user.id)
          .maybeSingle();

        const profile = data as ProfileRow | null;

        const newPlayer = toPlayerProfile(profile, authData.user);

        setAllPlayers((prev) => {
          if (prev.some((p) => p.id === newPlayer.id)) return prev;
          return [newPlayer, ...prev];
        });
        setCurrentUser(newPlayer);
      }

      return { success: true };
    } catch (err: any) {
      console.error('Supabase login exception:', err);
      return { success: false, error: err.message || 'Login failed' };
    }
  };

  const logoutAction = async () => {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      if (typeof window !== 'undefined') {
        localStorage.removeItem('padel_manager_v1_state_current_user');
      }
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const forgotPasswordAction = async (email: string) => {
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) return { success: false, error: error.message };
      return { success: true };
    } catch (err: any) {
      return { success: true }; // Graceful simulation fallback
    }
  };

  const resetPasswordAction = async (password: string) => {
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({ password });
      if (error) return { success: false, error: error.message };
      return { success: true };
    } catch (err: any) {
      return { success: true };
    }
  };

  // Switch Active User / Persona
  const switchUser = (userId: string) => {
    const target = allPlayers.find((p) => p.id === userId);
    if (target) {
      setCurrentUser(target);
    }
  };

  const loginUser = (email: string) => {
    const found = allPlayers.find((p) => p.email.toLowerCase() === email.toLowerCase());
    if (found) {
      setCurrentUser(found);
      return true;
    }
    return false;
  };

  const registerUser = (firstName: string, lastName: string, email: string, mobile?: string) => {
    const newPlayer: PlayerProfile = {
      id: `usr_${Date.now()}`,
      firstName,
      lastName,
      displayName: `${firstName} ${lastName}`,
      email,
      mobileNumber: mobile || '',
      avatarUrl: `https://i.pravatar.cc/150?u=${Date.now()}`,
      createdAt: new Date().toISOString(),
      eventsPlayed: 0,
      matchesPlayed: 0,
      matchesWon: 0,
      matchesLost: 0,
      winRate: 0,
      totalGamesWon: 0,
      totalGamesLost: 0,
      recentEvents: [],
    };

    setAllPlayers((prev) => [newPlayer, ...prev]);
    setCurrentUser(newPlayer);
  };

  const updateProfile = (data: Partial<PlayerProfile>) => {
    setCurrentUser((prev) => {
      const updated = { ...prev, ...data };
      setAllPlayers((players) => players.map((p) => (p.id === prev.id ? updated : p)));
      return updated;
    });
  };

  const createEvent = async (newEventData: Partial<EventItem>): Promise<string> => {
    let eventId = `evt_${Date.now()}`;
    let supabaseError: string | undefined;

    try {
      const supabase = createClient();
      const sb = supabase as any;

      const { data: { session } } = await sb.auth.getSession();
      const authUid = session?.user?.id;

      if (authUid) {
        // Restored sessions may belong to accounts created before the profile
        // trigger existed. Repair the FK target before inserting the event.
        await ensureProfile(supabase, session.user);
        const facility = facilities.find((f) => f.id === newEventData.facilityId) || facilities[0];

        const courtIds = (newEventData.courtIds || []).filter(isValidUuid);
        const coAdminIds = (newEventData.coAdminIds || []).filter(isValidUuid);
        const { data: insertedEventId, error: eventError } = await sb.rpc('create_event', {
          event_name: newEventData.name || 'New Padel Tournament',
          event_description: newEventData.description || '',
          event_type_value: newEventData.type || 'tournament',
          event_date_value: newEventData.date || new Date().toISOString().split('T')[0],
          start_time_value: newEventData.startTime || '18:00',
          facility_id_value: facility && isValidUuid(facility.id) ? facility.id : null,
          visibility_value: newEventData.visibility || 'private',
          max_players_value: newEventData.type === 'normal_match' ? 4 : (newEventData.maxPlayers || 16),
          court_ids: courtIds,
          co_admin_ids: coAdminIds,
          rules_value: newEventData.rules || {},
        });

        if (eventError) {
          reportOperationError('Could not create event', eventError.message);
          supabaseError = eventError.message;
        } else if (insertedEventId) {
          eventId = insertedEventId;
        }
      }
    } catch (err: any) {
      console.error('Supabase event exception:', err);
      supabaseError = err.message;
    }

    const facility = facilities.find((f) => f.id === newEventData.facilityId) || facilities[0];

    const newEvent: EventItem = {
      id: eventId,
      name: newEventData.name || 'New Padel Tournament',
      description: newEventData.description || '',
      type: newEventData.type || 'tournament',
      format: newEventData.format || (newEventData.type === 'normal_match' ? 'standard_3_sets' : 'custom'),
      date: newEventData.date || new Date().toISOString().split('T')[0],
      startTime: newEventData.startTime || '18:00',
      facilityId: facility?.id || '',
      facilityName: facility?.name || '',
      courtIds: newEventData.courtIds || [],
      ownerId: currentUser.id,
      ownerName: currentUser.displayName,
      coAdminIds: newEventData.coAdminIds || [],
      maxPlayers: newEventData.type === 'normal_match' ? 4 : (newEventData.maxPlayers || 16),
      maxTeams: (newEventData.type === 'normal_match' ? 4 : (newEventData.maxPlayers || 16)) / 2,
      visibility: newEventData.visibility || 'private',
      status: 'open',
      participants: [
        {
          id: currentUser.id,
          displayName: currentUser.displayName,
          isGuest: false,
          registeredAt: new Date().toISOString(),
          status: 'confirmed',
        },
      ],
      teams: [],
      groups: [],
      matches: [],
      rules: newEventData.rules || {
        winPoints: 3,
        drawPoints: 1,
        lossPoints: 0,
        tiebreakOrder: ['points', 'matchesWon', 'scoreDiff', 'scoreFor'],
        qualifiersPerGroup: 2,
      },
      createdAt: new Date().toISOString(),
    };

    setEvents((prev) => [newEvent, ...prev]);
    return eventId;
  };

  const deleteEvent = async (eventId: string): Promise<boolean> => {
    if (isValidUuid(eventId)) {
      const sb = createClient() as any;
      const { data, error } = await sb.rpc('delete_event', { target_event_id: eventId });
      if (error || data !== true) {
        reportOperationError('Could not delete event', error?.message || 'Event was not deleted');
        return false;
      }
    }
    setEvents((prev) => prev.filter((e) => e.id !== eventId));
    return true;
  };

  const joinEvent = async (eventId: string, preferredPartnerId?: string): Promise<{ success: boolean; status?: 'confirmed' | 'waiting_list' }> => {
    let resultStatus: 'confirmed' | 'waiting_list' = 'confirmed';
    let usedServerStatus = false;
    let supabaseError: string | undefined;

    try {
      const supabase = createClient();
      const sb = supabase as any;

      const { data: { session } } = await sb.auth.getSession();
      const authUid = session?.user?.id;

      if (authUid && isValidUuid(eventId)) {
        const event = events.find((e) => e.id === eventId);
        if (!event) {
          return { success: false, status: resultStatus };
        }

        // Capacity and duplicate checks must happen atomically in PostgreSQL;
        // a client-side count allows concurrent users to overbook an event.
        const { data: registrationStatus, error: participantError } = await sb.rpc(
          'register_for_event',
          { target_event_id: eventId }
        );

        if (participantError) {
          reportOperationError('Could not join event', participantError.message);
          supabaseError = participantError.message;
        } else if (registrationStatus === 'confirmed' || registrationStatus === 'waiting_list') {
          resultStatus = registrationStatus;
          usedServerStatus = true;
        }
      }
    } catch (err: any) {
      console.error('Supabase join event exception:', err);
      supabaseError = err.message;
    }

    setEvents((prev) =>
      prev.map((event) => {
        if (event.id !== eventId) return event;

        const exists = event.participants.some((p) => p.id === currentUser.id);
        if (exists) {
          const currentP = event.participants.find((p) => p.id === currentUser.id);
          if (currentP) resultStatus = currentP.status;
          return {
            ...event,
            participants: event.participants.map((p) =>
              p.id === currentUser.id ? { ...p, preferredPartnerId } : p
            ),
          };
        }

        const confirmedCount = event.participants.filter((p) => p.status === 'confirmed').length;
        const isFull = usedServerStatus
          ? resultStatus === 'waiting_list'
          : confirmedCount >= event.maxPlayers;
        if (!usedServerStatus) resultStatus = isFull ? 'waiting_list' : 'confirmed';

        const newParticipant: Participant = {
          id: currentUser.id,
          displayName: currentUser.displayName,
          isGuest: false,
          registeredAt: new Date().toISOString(),
          status: resultStatus,
          waitingListPosition: isFull ? event.participants.filter((p) => p.status === 'waiting_list').length + 1 : undefined,
          preferredPartnerId,
        };

        const updatedParticipants = [...event.participants, newParticipant];
        const confirmedList = updatedParticipants.filter((p) => p.status === 'confirmed');
        const newConfirmedCount = confirmedList.length;
        let newStatus = !isFull && newConfirmedCount >= event.maxPlayers ? 'full' : event.status;

        let updatedTeams = event.teams;
        let updatedMatches = event.matches;

        if (event.type === 'normal_match') {
          if (newConfirmedCount === 4) {
            newStatus = 'in_progress';
            const t1Id = `team_nm_${eventId}_1`;
            const t2Id = `team_nm_${eventId}_2`;
            updatedTeams = [
              {
                id: t1Id,
                eventId: event.id,
                name: `${confirmedList[0].displayName.split(' ')[0]} & ${confirmedList[1].displayName.split(' ')[0]}`,
                player1: { id: confirmedList[0].id, displayName: confirmedList[0].displayName, isGuest: confirmedList[0].isGuest },
                player2: { id: confirmedList[1].id, displayName: confirmedList[1].displayName, isGuest: confirmedList[1].isGuest },
                locked: true,
              },
              {
                id: t2Id,
                eventId: event.id,
                name: `${confirmedList[2].displayName.split(' ')[0]} & ${confirmedList[3].displayName.split(' ')[0]}`,
                player1: { id: confirmedList[2].id, displayName: confirmedList[2].displayName, isGuest: confirmedList[2].isGuest },
                player2: { id: confirmedList[3].id, displayName: confirmedList[3].displayName, isGuest: confirmedList[3].isGuest },
                locked: true,
              },
            ];
            updatedMatches = [
              {
                id: `match_nm_${eventId}_1`,
                eventId: event.id,
                stage: 'group',
                round: 1,
                courtId: event.courtIds[0] || 'c1',
                courtName: 'Court 1',
                team1Id: t1Id,
                team2Id: t2Id,
                status: 'in_progress',
              },
            ];
          }
        }

        return {
          ...event,
          status: newStatus,
          participants: updatedParticipants,
          teams: updatedTeams,
          matches: updatedMatches,
        };
      })
    );
    return { success: true, status: resultStatus };
  };

  const removeParticipant = (eventId: string, targetUserId: string) => {
    if (isValidUuid(eventId) && isValidUuid(targetUserId)) {
      const sb = createClient() as any;
      void sb.rpc('remove_event_participant', {
        target_event_id: eventId,
        target_user_id: targetUserId,
      }).then(({ error }: { error: { message: string } | null }) => {
        if (error) reportOperationError('Could not remove participant', error.message);
      });
    }
    // Clear partner requests involving this participant for this event
    setPartnerRequests((prev) =>
      prev.filter(
        (r) => !(r.eventId === eventId && (r.fromUserId === targetUserId || r.toUserId === targetUserId))
      )
    );

    // Notifications are deliberately created outside the state updater. React
    // may invoke updater callbacks more than once in development Strict Mode.
    const eventSnapshot = events.find((event) => event.id === eventId);
    const leavingSnapshot = eventSnapshot?.participants.find((participant) => participant.id === targetUserId);
    if (eventSnapshot && leavingSnapshot) {
      if (!leavingSnapshot.isGuest) {
        setNotifications((previous) => [{
          id: createNotificationId('notif_wdr'),
          userId: targetUserId,
          title: 'Registration Withdrawn',
          message: `You have successfully withdrawn your registration from "${eventSnapshot.name}".`,
          date: new Date().toISOString(),
          read: false,
          eventId,
        }, ...previous]);
      }
      if (leavingSnapshot.status === 'confirmed') {
        const promoted = eventSnapshot.participants.find(
          (participant) => participant.id !== targetUserId && participant.status === 'waiting_list'
        );
        if (promoted) {
          setNotifications((previous) => [{
            id: createNotificationId('notif_promoted'),
            userId: promoted.id,
            title: 'Promoted from Waiting List!',
            message: `A spot opened up in ${eventSnapshot.name}! You are now confirmed.`,
            date: new Date().toISOString(),
            read: false,
            eventId,
          }, ...previous]);
        }
      }
    }

    setEvents((prev) =>
      prev.map((event) => {
        if (event.id !== eventId) return event;

        const leaving = event.participants.find((p) => p.id === targetUserId);
        if (!leaving) return event;

        let updatedParticipants = event.participants.filter((p) => p.id !== targetUserId);

        // If a confirmed player left, promote the #1 waiting list player
        if (leaving.status === 'confirmed') {
          const firstWaiting = updatedParticipants.find((p) => p.status === 'waiting_list');
          if (firstWaiting) {
            updatedParticipants = updatedParticipants.map((p) => {
              if (p.id === firstWaiting.id) {
                return {
                  ...p,
                  status: 'confirmed',
                  waitingListPosition: undefined,
                };
              }
              if (p.status === 'waiting_list' && p.waitingListPosition) {
                return {
                  ...p,
                  waitingListPosition: p.waitingListPosition - 1,
                };
              }
              return p;
            });

          }
        } else if (leaving.status === 'waiting_list' && leaving.waitingListPosition) {
          const pos = leaving.waitingListPosition;
          updatedParticipants = updatedParticipants.map((p) => {
            if (p.status === 'waiting_list' && p.waitingListPosition && p.waitingListPosition > pos) {
              return {
                ...p,
                waitingListPosition: p.waitingListPosition - 1,
              };
            }
            return p;
          });
        }

        // Clean up teams if player was in a team
        let updatedTeams = event.teams.filter(
          (t) => t.player1?.id !== targetUserId && t.player2?.id !== targetUserId
        );
        let updatedMatches = event.matches;

        if (event.type === 'normal_match') {
          const confirmedList = updatedParticipants.filter((p) => p.status === 'confirmed');
          if (confirmedList.length < 4) {
            updatedTeams = [];
            updatedMatches = [];
          } else if (confirmedList.length === 4) {
            const t1Id = `team_nm_${event.id}_1`;
            const t2Id = `team_nm_${event.id}_2`;
            updatedTeams = [
              {
                id: t1Id,
                eventId: event.id,
                name: `${confirmedList[0].displayName.split(' ')[0]} & ${confirmedList[1].displayName.split(' ')[0]}`,
                player1: { id: confirmedList[0].id, displayName: confirmedList[0].displayName, isGuest: confirmedList[0].isGuest },
                player2: { id: confirmedList[1].id, displayName: confirmedList[1].displayName, isGuest: confirmedList[1].isGuest },
                locked: true,
              },
              {
                id: t2Id,
                eventId: event.id,
                name: `${confirmedList[2].displayName.split(' ')[0]} & ${confirmedList[3].displayName.split(' ')[0]}`,
                player1: { id: confirmedList[2].id, displayName: confirmedList[2].displayName, isGuest: confirmedList[2].isGuest },
                player2: { id: confirmedList[3].id, displayName: confirmedList[3].displayName, isGuest: confirmedList[3].isGuest },
                locked: true,
              },
            ];
            updatedMatches = [
              {
                id: `match_nm_${event.id}_1`,
                eventId: event.id,
                stage: 'group',
                round: 1,
                courtId: event.courtIds[0] || 'c1',
                courtName: 'Court 1',
                team1Id: t1Id,
                team2Id: t2Id,
                status: 'in_progress',
              },
            ];
          }
        }

        const newConfirmedCount = updatedParticipants.filter((p) => p.status === 'confirmed').length;
        const newStatus = newConfirmedCount < event.maxPlayers ? 'open' : event.status;

        return {
          ...event,
          status: newStatus,
          participants: updatedParticipants,
          teams: updatedTeams,
          matches: updatedMatches,
        };
      })
    );
  };

  const leaveEvent = (eventId: string, targetUserId?: string) => {
    removeParticipant(eventId, targetUserId || currentUser.id);
  };

  const addRegisteredPlayerToEvent = (eventId: string, userId: string) => {
    const targetUser = allPlayers.find((p) => p.id === userId);
    if (!targetUser) return;

    setEvents((prev) =>
      prev.map((event) => {
        if (event.id !== eventId) return event;

        if (event.participants.some((p) => p.id === userId)) return event;

        const confirmedCount = event.participants.filter((p) => p.status === 'confirmed').length;
        const isFull = confirmedCount >= event.maxPlayers;

        const newParticipant: Participant = {
          id: targetUser.id,
          displayName: targetUser.displayName,
          isGuest: false,
          registeredAt: new Date().toISOString(),
          status: isFull ? 'waiting_list' : 'confirmed',
          waitingListPosition: isFull ? event.participants.filter((p) => p.status === 'waiting_list').length + 1 : undefined,
        };

        const updatedParticipants = [...event.participants, newParticipant];
        const confirmedList = updatedParticipants.filter((p) => p.status === 'confirmed');
        const newConfirmedCount = confirmedList.length;
        let newStatus = !isFull && newConfirmedCount >= event.maxPlayers ? 'full' : event.status;

        let updatedTeams = event.teams;
        let updatedMatches = event.matches;

        if (event.type === 'normal_match' && newConfirmedCount === 4) {
          newStatus = 'in_progress';
          const t1Id = `team_nm_${eventId}_1`;
          const t2Id = `team_nm_${eventId}_2`;
          updatedTeams = [
            {
              id: t1Id,
              eventId: event.id,
              name: `${confirmedList[0].displayName.split(' ')[0]} & ${confirmedList[1].displayName.split(' ')[0]}`,
              player1: { id: confirmedList[0].id, displayName: confirmedList[0].displayName, isGuest: confirmedList[0].isGuest },
              player2: { id: confirmedList[1].id, displayName: confirmedList[1].displayName, isGuest: confirmedList[1].isGuest },
              locked: true,
            },
            {
              id: t2Id,
              eventId: event.id,
              name: `${confirmedList[2].displayName.split(' ')[0]} & ${confirmedList[3].displayName.split(' ')[0]}`,
              player1: { id: confirmedList[2].id, displayName: confirmedList[2].displayName, isGuest: confirmedList[2].isGuest },
              player2: { id: confirmedList[3].id, displayName: confirmedList[3].displayName, isGuest: confirmedList[3].isGuest },
              locked: true,
            },
          ];
          updatedMatches = [
            {
              id: `match_nm_${eventId}_1`,
              eventId: event.id,
              stage: 'group',
              round: 1,
              courtId: event.courtIds[0] || 'c1',
              courtName: 'Court 1',
              team1Id: t1Id,
              team2Id: t2Id,
              status: 'in_progress',
            },
          ];
        }

        return {
          ...event,
          status: newStatus,
          participants: updatedParticipants,
          teams: updatedTeams,
          matches: updatedMatches,
        };
      })
    );
  };

  const addGuestPlayer = (eventId: string, guestName: string) => {
    const guestId = `gst_${Date.now()}`;
    setEvents((prev) =>
      prev.map((event) => {
        if (event.id !== eventId) return event;

        const confirmedCount = event.participants.filter((p) => p.status === 'confirmed').length;
        const isFull = confirmedCount >= event.maxPlayers;

        const guestParticipant: Participant = {
          id: guestId,
          displayName: `${guestName} (Guest)`,
          isGuest: true,
          addedByUserId: currentUser.id,
          registeredAt: new Date().toISOString(),
          status: isFull ? 'waiting_list' : 'confirmed',
          waitingListPosition: isFull ? event.participants.filter((p) => p.status === 'waiting_list').length + 1 : undefined,
        };

        return {
          ...event,
          participants: [...event.participants, guestParticipant],
        };
      })
    );
  };

  const removeGuestPlayer = (eventId: string, guestId: string) => {
    removeParticipant(eventId, guestId);
  };

  const sendPartnerRequest = (eventId: string, toUserId: string) => {
    const targetPlayer = allPlayers.find((p) => p.id === toUserId);
    if (!targetPlayer) return;

    const newReq: PartnerRequest = {
      id: `req_${Date.now()}`,
      eventId,
      fromUserId: currentUser.id,
      fromUserName: currentUser.displayName,
      toUserId,
      toUserName: targetPlayer.displayName,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    setPartnerRequests((prev) => [newReq, ...prev]);

    // Send notification to recipient
    setNotifications((n) => [
      {
        id: createNotificationId(),
        userId: toUserId,
        title: 'Partner Request Received ðŸŽ¾',
        message: `${currentUser.displayName} requested to be your partner for the tournament!`,
        date: new Date().toISOString(),
        read: false,
        eventId,
      },
      ...n,
    ]);
  };

  const respondToPartnerRequest = (requestId: string, accept: boolean) => {
    const request = partnerRequests.find((item) => item.id === requestId);
    if (request) {
      setNotifications((previous) => [{
        id: createNotificationId(),
        userId: request.fromUserId,
        title: accept ? 'Partner Request Accepted!' : 'Partner Request Declined',
        message: `${currentUser.displayName} ${accept ? 'accepted' : 'declined'} your partner request.`,
        date: new Date().toISOString(),
        read: false,
        eventId: request.eventId,
      }, ...previous]);
    }
    setPartnerRequests((prev) =>
      prev.map((r) => {
        if (r.id !== requestId) return r;
        const newStatus = accept ? 'accepted' : 'declined';
        return { ...r, status: newStatus };
      })
    );
  };

  const generateTeams = (eventId: string) => {
    setEvents((prev) =>
      prev.map((event) => {
        if (event.id !== eventId) return event;

        const existingMap: Record<string, Team> = {};
        event.teams.forEach((t) => {
          existingMap[t.id] = t;
        });

        const generated = generateTeamsFromParticipants(
          eventId,
          event.participants,
          partnerRequests,
          existingMap
        );

        return {
          ...event,
          teams: generated,
          status: 'teams_generated',
        };
      })
    );
  };

  const updateTeams = (eventId: string, teams: Team[]) => {
    setEvents((prev) =>
      prev.map((event) => (event.id === eventId ? { ...event, teams } : event))
    );
  };

  const generateEventGroupsAction = (eventId: string) => {
    setEvents((prev) =>
      prev.map((event) => {
        if (event.id !== eventId) return event;
        const groups = generateGroups(eventId, event.teams, 4);
        return {
          ...event,
          groups,
        };
      })
    );
  };

  const updateGroups = (eventId: string, groups: TournamentGroup[]) => {
    setEvents((prev) =>
      prev.map((event) => (event.id === eventId ? { ...event, groups } : event))
    );
  };

  const generateEventScheduleAction = (eventId: string) => {
    setEvents((prev) =>
      prev.map((event) => {
        if (event.id !== eventId) return event;

        const facility = facilities.find((f) => f.id === event.facilityId);
        const courtNamesMap: Record<string, string> = {};
        if (facility) {
          facility.courts.forEach((c) => {
            courtNamesMap[c.id] = c.name;
          });
        }

        const matches = generateRoundRobinFixtures(
          eventId,
          event.groups,
          event.courtIds,
          courtNamesMap
        );

        return {
          ...event,
          matches,
          status: 'ready',
        };
      })
    );
  };

  const recordMatchScoreAction = (
    eventId: string,
    matchId: string,
    team1Score: number,
    team2Score: number,
    sets?: SetScore[]
  ) => {
    if (isValidUuid(eventId) && isValidUuid(matchId)) {
      const sb = createClient() as any;
      void sb.rpc('record_match_score', {
        target_event_id: eventId,
        target_match_id: matchId,
        score_a: team1Score,
        score_b: team2Score,
        set_scores: sets || [],
      }).then(({ error }: { error: { message: string } | null }) => {
        if (error) reportOperationError('Could not save match score', error.message);
      });
    }
    setEvents((prev) =>
      prev.map((event) => {
        if (event.id !== eventId) return event;

        const teamsMap: Record<string, Team> = {};
        event.teams.forEach((t) => {
          teamsMap[t.id] = t;
        });

        const targetMatch = event.matches.find((m) => m.id === matchId);
        if (!targetMatch) return event;

        let winnerTeamId: string | undefined = undefined;

        if (sets && sets.length > 0) {
          let t1SetWins = 0;
          let t2SetWins = 0;
          sets.forEach((s) => {
            if (s.team1Score > s.team2Score) t1SetWins++;
            else if (s.team2Score > s.team1Score) t2SetWins++;
          });

          if (t1SetWins > t2SetWins) {
            winnerTeamId = targetMatch.team1Id;
          } else if (t2SetWins > t1SetWins) {
            winnerTeamId = targetMatch.team2Id;
          }
        }

        if (!winnerTeamId) {
          if (team1Score > team2Score) {
            winnerTeamId = targetMatch.team1Id;
          } else if (team2Score > team1Score) {
            winnerTeamId = targetMatch.team2Id;
          }
        }

        const updatedMatch: Match = {
          ...targetMatch,
          team1Score,
          team2Score,
          sets: sets && sets.length > 0 ? sets : targetMatch.sets,
          winnerTeamId,
          status: 'completed',
          recordedByUserId: currentUser.id,
          recordedAt: new Date().toISOString(),
        };

        let updatedMatches = event.matches.map((m) => (m.id === matchId ? updatedMatch : m));

        // Advance knockout winner if knockout stage
        if (updatedMatch.stage === 'knockout') {
          updatedMatches = advanceKnockoutWinner(updatedMatches, updatedMatch);
        }

        // Check if all final matches completed
        const finalMatch = updatedMatches.find((m) => m.knockoutStage === 'final');
        let newStatus = event.status;
        if (finalMatch && finalMatch.status === 'completed') {
          newStatus = 'completed';
        } else if (event.status === 'ready') {
          newStatus = 'in_progress';
        }

        const updatedEvent = {
          ...event,
          status: newStatus,
          matches: updatedMatches,
        };

        // Recalculate player stats
        setAllPlayers((players) => recalculatePlayerStats([updatedEvent], players));

        return updatedEvent;
      })
    );
  };

  const confirmQualifiersAndKnockout = (eventId: string) => {
    setEvents((prev) =>
      prev.map((event) => {
        if (event.id !== eventId) return event;

        const teamsMap: Record<string, Team> = {};
        event.teams.forEach((t) => {
          teamsMap[t.id] = t;
        });

        const qualifiers = identifyQualifiers(event.groups, event.matches, teamsMap, event.rules);

        const facility = facilities.find((f) => f.id === event.facilityId);
        const courtNamesMap: Record<string, string> = {};
        if (facility) {
          facility.courts.forEach((c) => {
            courtNamesMap[c.id] = c.name;
          });
        }

        const knockoutMatches = generateKnockoutBracket(
          eventId,
          qualifiers,
          event.courtIds,
          courtNamesMap
        );

        return {
          ...event,
          status: 'knockout_stage',
          matches: [...event.matches.filter((m) => m.stage === 'group'), ...knockoutMatches],
        };
      })
    );
  };

  const addCoAdmin = (eventId: string, userId: string) => {
    setEvents((prev) =>
      prev.map((event) => {
        if (event.id !== eventId) return event;
        if (event.coAdminIds.length >= 3 || event.coAdminIds.includes(userId)) return event;
        return {
          ...event,
          coAdminIds: [...event.coAdminIds, userId],
        };
      })
    );
  };

  const removeCoAdmin = (eventId: string, userId: string) => {
    setEvents((prev) =>
      prev.map((event) => {
        if (event.id !== eventId) return event;
        return {
          ...event,
          coAdminIds: event.coAdminIds.filter((id) => id !== userId),
        };
      })
    );
  };

  const createPlayerGroupAction = async (name: string, description: string, memberIds: string[]): Promise<PlayerGroup> => {
    let newGroup: PlayerGroup = {
      id: `grp_${Date.now()}`,
      name,
      description,
      ownerId: currentUser.id,
      memberIds: Array.from(new Set([currentUser.id, ...memberIds])),
      createdAt: new Date().toISOString(),
    };

    try {
      const supabase = createClient();
      const sb = supabase as any;

      const { data: { session } } = await sb.auth.getSession();
      const authUid = session?.user?.id;

      if (authUid) {
        await ensureProfile(supabase, session.user);
        const persistedMemberIds = memberIds.filter(isValidUuid);
        const { data: insertedGroupId, error: groupError } = await sb.rpc('create_player_group', {
          group_name: name,
          group_description: description || '',
          member_ids: persistedMemberIds,
        });

        if (groupError) {
          reportOperationError('Could not create player group', groupError.message);
        } else if (insertedGroupId) {
          newGroup = {
            id: insertedGroupId,
            name,
            description,
            ownerId: authUid,
            memberIds: Array.from(new Set([authUid, ...memberIds])),
            createdAt: new Date().toISOString(),
          };
        }
      }
    } catch (err: any) {
      console.error('Supabase group exception:', err);
    }

    setPlayerGroups((prev) => [newGroup, ...prev]);
    return newGroup;
  };

  const deletePlayerGroupAction = async (groupId: string): Promise<boolean> => {
    if (isValidUuid(groupId)) {
      const sb = createClient() as any;
      const { data, error } = await sb.rpc('delete_player_group', { target_group_id: groupId });
      if (error || data !== true) {
        reportOperationError('Could not delete player group', error?.message || 'Group was not deleted');
        return false;
      }
    }
    setPlayerGroups((previous) => previous.filter((group) => group.id !== groupId));
    return true;
  };

  const joinPlayerGroupAction = async (
    groupId: string,
    targetUserId?: string,
    initialGroupData?: Partial<PlayerGroup>
  ): Promise<void> => {
    const uid = targetUserId || currentUser.id;

    try {
      const supabase = createClient();
      const sb = supabase as any;

      const { data: { session } } = await sb.auth.getSession();
      const authUid = session?.user?.id;

      if (authUid) {
        const existingGroup = playerGroups.find((g) => g.id === groupId);
        if (existingGroup) {
          if (isValidUuid(groupId) && isValidUuid(uid)) {
            const { error } = await sb.from('player_group_members').upsert({
              group_id: groupId,
              user_id: uid,
              status: 'active',
            }, { onConflict: ['group_id', 'user_id'] });
            if (error) console.error('Supabase upsert player_group_members failed:', error);
          }
        } else {
          const { data: insertedGroup, error: groupError } = await sb
            .from('player_groups')
            .insert({
              owner_id: initialGroupData?.ownerId || 'usr_organizer',
              name: initialGroupData?.name || 'Shared Padel Group',
              description: initialGroupData?.description || null,
            })
            .select()
            .single();

          if (groupError) {
            console.error('Supabase insert player_group failed:', groupError);
          } else if (insertedGroup) {
            if (isValidUuid(uid)) {
              await sb.from('player_group_members').insert({
                group_id: insertedGroup.id,
                user_id: uid,
                status: 'active',
              });
            }
          }
        }
      }
    } catch (err: any) {
      console.error('Supabase join group exception:', err);
    }

    setPlayerGroups((prev) => {
      const exists = prev.some((g) => g.id === groupId);
      if (exists) {
        return prev.map((g) => {
          if (g.id !== groupId) return g;
          if (g.memberIds.includes(uid)) return g;
          return {
            ...g,
            memberIds: [...g.memberIds, uid],
            pendingRequestUserIds: (g.pendingRequestUserIds || []).filter((id) => id !== uid),
          };
        });
      } else {
        const newGroup: PlayerGroup = {
          id: groupId,
          name: initialGroupData?.name || 'Shared Padel Group',
          description: initialGroupData?.description || '',
          ownerId: initialGroupData?.ownerId || 'usr_organizer',
          memberIds: Array.from(new Set([...(initialGroupData?.memberIds || ['usr_john']), uid])),
          createdAt: initialGroupData?.createdAt || new Date().toISOString(),
        };
        return [newGroup, ...prev];
      }
    });
  };

  const addNotification = (userId: string, title: string, message: string) => {
    setNotifications((prev) => [
      {
        id: createNotificationId(),
        userId,
        title,
        message,
        date: new Date().toISOString(),
        read: false,
      },
      ...prev,
    ]);
  };

  const requestJoinPlayerGroupAction = (
    groupId: string,
    targetUserId?: string,
    initialGroupData?: Partial<PlayerGroup>
  ) => {
    const uid = targetUserId || currentUser.id;
    setPlayerGroups((prev) => {
      const exists = prev.some((g) => g.id === groupId);
      if (exists) {
        return prev.map((g) => {
          if (g.id !== groupId) return g;
          if (g.memberIds.includes(uid)) return g;
          const currentPending = g.pendingRequestUserIds || [];
          if (currentPending.includes(uid)) return g;
          return {
            ...g,
            pendingRequestUserIds: [...currentPending, uid],
          };
        });
      } else {
        const newGroup: PlayerGroup = {
          id: groupId,
          name: initialGroupData?.name || 'Shared Padel Group',
          description: initialGroupData?.description || '',
          ownerId: initialGroupData?.ownerId || 'usr_organizer',
          memberIds: initialGroupData?.memberIds || ['usr_john'],
          pendingRequestUserIds: [uid],
          createdAt: initialGroupData?.createdAt || new Date().toISOString(),
        };
        return [newGroup, ...prev];
      }
    });

    // Notify group owner
    const group = playerGroups.find((g) => g.id === groupId) || initialGroupData;
    if (group && group.ownerId) {
      addNotification(
        group.ownerId,
        'New Join Request',
        `${currentUser.displayName} requested to join your group "${group.name}".`
      );
    }
  };

  const approveGroupJoinRequestAction = (groupId: string, requestingUserId: string) => {
    let groupName = 'Padel Group';
    setPlayerGroups((prev) =>
      prev.map((g) => {
        if (g.id !== groupId) return g;
        groupName = g.name;
        const pending = (g.pendingRequestUserIds || []).filter((id) => id !== requestingUserId);
        const members = g.memberIds.includes(requestingUserId)
          ? g.memberIds
          : [...g.memberIds, requestingUserId];
        return {
          ...g,
          memberIds: members,
          pendingRequestUserIds: pending,
        };
      })
    );

    addNotification(
      requestingUserId,
      'Group Join Approved',
      `Your request to join "${groupName}" was approved by the group admin!`
    );
  };

  const rejectGroupJoinRequestAction = (groupId: string, requestingUserId: string) => {
    let groupName = 'Padel Group';
    setPlayerGroups((prev) =>
      prev.map((g) => {
        if (g.id !== groupId) return g;
        groupName = g.name;
        const pending = (g.pendingRequestUserIds || []).filter((id) => id !== requestingUserId);
        return {
          ...g,
          pendingRequestUserIds: pending,
        };
      })
    );

    addNotification(
      requestingUserId,
      'Group Join Request',
      `Your request to join "${groupName}" was declined.`
    );
  };

  const inviteGroupToEventAction = (eventId: string, groupId: string) => {
    const group = playerGroups.find((g) => g.id === groupId);
    if (!group) return;

    setEvents((prev) =>
      prev.map((event) => {
        if (event.id !== eventId) return event;

        let currentParticipants = [...event.participants];
        let confirmedCount = currentParticipants.filter((p) => p.status === 'confirmed').length;

        group.memberIds.forEach((mId) => {
          if (!currentParticipants.some((p) => p.id === mId)) {
            const player = allPlayers.find((p) => p.id === mId);
            const isFull = confirmedCount >= event.maxPlayers;

            currentParticipants.push({
              id: mId,
              displayName: player ? player.displayName : 'Player',
              isGuest: false,
              registeredAt: new Date().toISOString(),
              status: isFull ? 'waiting_list' : 'confirmed',
              waitingListPosition: isFull ? currentParticipants.filter((p) => p.status === 'waiting_list').length + 1 : undefined,
            });

            if (!isFull) confirmedCount++;
          }
        });

        return {
          ...event,
          participants: currentParticipants,
          status: confirmedCount >= event.maxPlayers ? 'full' : event.status,
        };
      })
    );
  };

  const saveFacility = async (data: Partial<Facility> & { name: string; address: string; city: string }): Promise<Facility> => {
    let resultFacility: Facility | null = null;
    let supabaseError: string | undefined;

    try {
      const supabase = createClient();
      const sb = supabase as any;

      const { data: { session } } = await sb.auth.getSession();
      const authUid = session?.user?.id;

      if (authUid) {
        const facilityInsert: any = {
          name: data.name,
          address: data.address,
          city: data.city || 'Dubai',
          country: data.country || 'United Arab Emirates',
          google_maps_url: data.googleMapsUrl || null,
          created_by: authUid,
        };

        const { data: insertedFacility, error: facilityError } = await sb
          .from('facilities')
          .insert(facilityInsert)
          .select()
          .single();

        if (facilityError) {
          console.error('Supabase insert facility failed:', facilityError);
          supabaseError = facilityError.message;
        } else if (insertedFacility) {
          // Let the DB generate court UUIDs (don't pass client string ids).
          const courtsToInsert = (data.courts && data.courts.length > 0 ? data.courts : [
            { name: 'Court 1' }, { name: 'Court 2' }, { name: 'Court 3' }, { name: 'Court 4' },
          ]).map((c, idx) => ({
            facility_id: insertedFacility.id,
            name: c.name || `Court ${idx + 1}`,
            court_number: idx + 1,
          }));

          const { data: insertedCourts, error: courtsError } = await sb
            .from('courts')
            .insert(courtsToInsert)
            .select();

          if (courtsError) {
            console.error('Supabase insert courts failed:', courtsError);
          }

          const savedCourts = (insertedCourts || courtsToInsert).map((c: any) => ({
            id: c.id,
            name: c.name,
          }));

          resultFacility = {
            id: insertedFacility.id,
            name: insertedFacility.name,
            address: insertedFacility.address,
            city: insertedFacility.city,
            country: insertedFacility.country,
            googleMapsUrl: insertedFacility.google_maps_url || '',
            isFavorite: data.isFavorite ?? true,
            courts: savedCourts,
          };
        }
      }
    } catch (err: any) {
      console.error('Supabase facility exception:', err);
      supabaseError = err.message;
    }

    setFacilities((prev) => {
      const existingIdx = prev.findIndex((f) => f.id === data.id);
      if (existingIdx >= 0 && resultFacility) {
        const updated = [...prev];
        updated[existingIdx] = { ...updated[existingIdx], ...resultFacility };
        return updated;
      }
      if (resultFacility) {
        return [resultFacility, ...prev];
      }
      return prev;
    });

    if (!resultFacility) {
      if (supabaseError) {
        console.warn('Falling back to local-only facility due to Supabase error:', supabaseError);
      }
      const newId = data.id || `fac_${Date.now()}`;
      const defaultCourts = data.courts && data.courts.length > 0 ? data.courts : [
        { id: `c_${Date.now()}_1`, name: 'Court 1' },
        { id: `c_${Date.now()}_2`, name: 'Court 2' },
        { id: `c_${Date.now()}_3`, name: 'Court 3' },
        { id: `c_${Date.now()}_4`, name: 'Court 4' },
      ];
      resultFacility = {
        id: newId,
        name: data.name,
        address: data.address,
        city: data.city || 'Dubai',
        country: data.country || 'United Arab Emirates',
        googleMapsUrl: data.googleMapsUrl || '',
        isFavorite: data.isFavorite ?? true,
        courts: defaultCourts,
      };
    }
    return resultFacility;
  };

  const toggleFavoriteFacility = (facilityId: string) => {
    setFacilities((prev) =>
      prev.map((f) => (f.id === facilityId ? { ...f, isFavorite: !f.isFavorite } : f))
    );
  };

  const deleteFacility = (facilityId: string) => {
    setFacilities((prev) => prev.filter((f) => f.id !== facilityId));
  };

  const resetDemoData = () => {
    clearPadelPersistence();

    setAllPlayers(SEED_PLAYERS);
    setFacilities(SEED_FACILITIES);
    setCurrentUser(SEED_PLAYERS[0]);
    setEvents(SEED_EVENTS);
    setPlayerGroups(SEED_GROUPS);
    setPartnerRequests([]);
  };

  return (
    <PadelContext.Provider
      value={{
        currentUser,
        allPlayers,
        facilities,
        events,
        playerGroups,
        notifications,
        clearNotifications,
        partnerRequests,
        signUpAction,
        loginAction,
        logoutAction,
        forgotPasswordAction,
        resetPasswordAction,
        isAuthenticated,
        switchUser,
        loginUser,
        registerUser,
        createEvent,
        deleteEvent,
        joinEvent,
        leaveEvent,
        removeParticipant,
        addRegisteredPlayerToEvent,
        addGuestPlayer,
        removeGuestPlayer,
        sendPartnerRequest,
        respondToPartnerRequest,
        generateTeams,
        updateTeams,
        generateEventGroupsAction,
        updateGroups,
        generateEventScheduleAction,
        recordMatchScoreAction,
        confirmQualifiersAndKnockout,
        addCoAdmin,
        removeCoAdmin,
        createPlayerGroupAction,
        deletePlayerGroupAction,
        joinPlayerGroupAction,
        requestJoinPlayerGroupAction,
        approveGroupJoinRequestAction,
        rejectGroupJoinRequestAction,
        inviteGroupToEventAction,
        saveFacility,
        toggleFavoriteFacility,
        deleteFacility,
        resetDemoData,
        updateProfile,
      }}
    >
      {children}
    </PadelContext.Provider>
  );
};

export const usePadel = () => {
  const context = useContext(PadelContext);
  if (!context) {
    throw new Error('usePadel must be used within a PadelProvider');
  }
  return context;
};
