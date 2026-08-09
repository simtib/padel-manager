import React, { createContext, useContext, useState, useEffect } from 'react';
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

interface PadelContextType {
  currentUser: PlayerProfile;
  allPlayers: PlayerProfile[];
  facilities: Facility[];
  events: EventItem[];
  playerGroups: PlayerGroup[];
  notifications: NotificationItem[];
  partnerRequests: PartnerRequest[];
  signUpAction: (data: { firstName: string; lastName: string; email: string; password: string }) => Promise<{ success: boolean; error?: string }>;
  loginAction: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logoutAction: () => Promise<void>;
  forgotPasswordAction: (email: string) => Promise<{ success: boolean; error?: string }>;
  resetPasswordAction: (password: string) => Promise<{ success: boolean; error?: string }>;
  isAuthenticated: boolean;
  switchUser: (userId: string) => void;
  loginUser: (email: string) => boolean;
  registerUser: (firstName: string, lastName: string, email: string, mobile?: string) => void;
  createEvent: (newEventData: Partial<EventItem>) => string;
  deleteEvent: (eventId: string) => void;
  joinEvent: (eventId: string, preferredPartnerId?: string) => { success: boolean; status?: 'confirmed' | 'waiting_list' };
  leaveEvent: (eventId: string, targetUserId?: string) => void;
  removeParticipant: (eventId: string, targetUserId: string) => void;
  addRegisteredPlayerToEvent: (eventId: string, userId: string) => void;
  addGuestPlayer: (eventId: string, guestName: string) => void;
  removeGuestPlayer: (eventId: string, guestId: string) => void;
  sendPartnerRequest: (eventId: string, toUserId: string) => void;
  respondToPartnerRequest: (requestId: string, accept: boolean) => void;
  generateTeams: (eventId: string) => void;
  updateTeams: (eventId: string, teams: Team[]) => void;
  generateEventGroupsAction: (eventId: string) => void;
  updateGroups: (eventId: string, groups: TournamentGroup[]) => void;
  generateEventScheduleAction: (eventId: string) => void;
  recordMatchScoreAction: (
    eventId: string,
    matchId: string,
    team1Score: number,
    team2Score: number,
    sets?: SetScore[]
  ) => void;
  confirmQualifiersAndKnockout: (eventId: string) => void;
  addCoAdmin: (eventId: string, userId: string) => void;
  removeCoAdmin: (eventId: string, userId: string) => void;
  createPlayerGroupAction: (name: string, description: string, memberIds: string[]) => PlayerGroup;
  joinPlayerGroupAction: (groupId: string, targetUserId?: string, initialGroupData?: Partial<PlayerGroup>) => void;
  requestJoinPlayerGroupAction: (groupId: string, targetUserId?: string, initialGroupData?: Partial<PlayerGroup>) => void;
  approveGroupJoinRequestAction: (groupId: string, requestingUserId: string) => void;
  rejectGroupJoinRequestAction: (groupId: string, requestingUserId: string) => void;
  inviteGroupToEventAction: (eventId: string, groupId: string) => void;
  saveFacility: (data: Partial<Facility> & { name: string; address: string; city: string }) => Facility;
  toggleFavoriteFacility: (facilityId: string) => void;
  deleteFacility: (facilityId: string) => void;
  resetDemoData: () => void;
  updateProfile: (data: Partial<PlayerProfile>) => void;
}

const STORAGE_KEY = 'padel_manager_v1_state';

const PadelContext = createContext<PadelContextType | null>(null);

export const PadelProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [allPlayers, setAllPlayers] = useState<PlayerProfile[]>(() => {
    if (typeof window === 'undefined') return SEED_PLAYERS;
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_players`);
      return saved ? JSON.parse(saved) : SEED_PLAYERS;
    } catch {
      return SEED_PLAYERS;
    }
  });

  const [currentUser, setCurrentUser] = useState<PlayerProfile>(() => {
    if (typeof window === 'undefined') return SEED_PLAYERS[0];
    try {
      const savedUserId = localStorage.getItem(`${STORAGE_KEY}_current_user`);
      const found = allPlayers.find((p) => p.id === savedUserId);
      return found || allPlayers[0] || SEED_PLAYERS[0];
    } catch {
      return SEED_PLAYERS[0];
    }
  });

  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const [facilities, setFacilities] = useState<Facility[]>(() => {
    if (typeof window === 'undefined') return SEED_FACILITIES;
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_facilities`);
      return saved ? JSON.parse(saved) : SEED_FACILITIES;
    } catch {
      return SEED_FACILITIES;
    }
  });

  const [events, setEvents] = useState<EventItem[]>(() => {
    if (typeof window === 'undefined') return SEED_EVENTS;
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_events`);
      return saved ? JSON.parse(saved) : SEED_EVENTS;
    } catch {
      return SEED_EVENTS;
    }
  });

  const [playerGroups, setPlayerGroups] = useState<PlayerGroup[]>(() => {
    if (typeof window === 'undefined') return SEED_GROUPS;
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_groups`);
      return saved ? JSON.parse(saved) : SEED_GROUPS;
    } catch {
      return SEED_GROUPS;
    }
  });

  const [partnerRequests, setPartnerRequests] = useState<PartnerRequest[]>(() => {
    if (typeof window === 'undefined') return [
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
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_requests`);
      return saved ? JSON.parse(saved) : [
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
    } catch {
      return [];
    }
  });

  const [notifications, setNotifications] = useState<NotificationItem[]>([
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
  ]);

  // Persist state
  useEffect(() => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(`${STORAGE_KEY}_players`, JSON.stringify(allPlayers));
  }, [allPlayers]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(`${STORAGE_KEY}_facilities`, JSON.stringify(facilities));
  }, [facilities]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(`${STORAGE_KEY}_events`, JSON.stringify(events));
  }, [events]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(`${STORAGE_KEY}_groups`, JSON.stringify(playerGroups));
  }, [playerGroups]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(`${STORAGE_KEY}_requests`, JSON.stringify(partnerRequests));
  }, [partnerRequests]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(`${STORAGE_KEY}_current_user`, currentUser.id);
  }, [currentUser]);

type ProfileRow = {
  id: string;
  first_name: string;
  last_name: string;
  display_name: string;
  email: string;
  phone?: string | null;
  avatar_url?: string | null;
  created_at?: string;
};

// Supabase Auth Listener & State Sync
  useEffect(() => {
    if (typeof window === 'undefined') return;

    let unsubscribe: (() => void) | undefined;

    const initAuth = async () => {
      try {
        const { createClient } = await import('../lib/supabase/client');
        const supabase = createClient();

        // 1. Fetch current active session
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setIsAuthenticated(true);
          // Fetch profile from public.profiles
          const { data } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .maybeSingle();

          const profile = data as ProfileRow | null;

          if (profile) {
            const playerProfile: PlayerProfile = {
              id: profile.id,
              firstName: profile.first_name || session.user.user_metadata?.first_name || 'Player',
              lastName: profile.last_name || session.user.user_metadata?.last_name || '',
              displayName: profile.display_name || session.user.user_metadata?.display_name || profile.email,
              email: profile.email || session.user.email || '',
              mobileNumber: profile.phone || '',
              avatarUrl: profile.avatar_url || `https://i.pravatar.cc/150?u=${profile.email}`,
              createdAt: profile.created_at || new Date().toISOString(),
              eventsPlayed: 0,
              matchesPlayed: 0,
              matchesWon: 0,
              matchesLost: 0,
              winRate: 0,
              totalGamesWon: 0,
              totalGamesLost: 0,
              recentEvents: [],
            };
            setCurrentUser(playerProfile);
            setAllPlayers((prev) => {
              if (prev.some((p) => p.id === playerProfile.id)) return prev;
              return [playerProfile, ...prev];
            });
          }
        } else {
          setIsAuthenticated(false);
        }

        // 2. Subscribe to Auth state changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
          if (event === 'SIGNED_OUT' || !session?.user) {
            setIsAuthenticated(false);
            // Revert back or clear auth state
          } else if (session?.user) {
            setIsAuthenticated(true);
            const { data } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .maybeSingle();

            const profile = data as ProfileRow | null;

            if (profile) {
              const playerProfile: PlayerProfile = {
                id: profile.id,
                firstName: profile.first_name || session.user.user_metadata?.first_name || 'Player',
                lastName: profile.last_name || session.user.user_metadata?.last_name || '',
                displayName: profile.display_name || session.user.user_metadata?.display_name || profile.email,
                email: profile.email || session.user.email || '',
                mobileNumber: profile.phone || '',
                avatarUrl: profile.avatar_url || `https://i.pravatar.cc/150?u=${profile.email}`,
                createdAt: profile.created_at || new Date().toISOString(),
                eventsPlayed: 0,
                matchesPlayed: 0,
                matchesWon: 0,
                matchesLost: 0,
                winRate: 0,
                totalGamesWon: 0,
                totalGamesLost: 0,
                recentEvents: [],
              };
              setCurrentUser(playerProfile);
              setAllPlayers((prev) => {
                if (prev.some((p) => p.id === playerProfile.id)) return prev;
                return [playerProfile, ...prev];
              });
            }
          }
        });

        unsubscribe = () => subscription.unsubscribe();
      } catch (err) {
        console.error('Error initializing Supabase Auth:', err);
      }
    };

    initAuth();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  // Supabase Auth Action Implementations
  const signUpAction = async (data: { firstName: string; lastName: string; email: string; password: string }) => {
    try {
      const { createClient } = await import('../lib/supabase/client');
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
      console.error('Supabase signup exception:', err);
      return { success: false, error: err.message || 'Failed to create account' };
    }
  };

  const loginAction = async (email: string, password: string) => {
    try {
      const { createClient } = await import('../lib/supabase/client');
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
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authData.user.id)
          .maybeSingle();

        const profile = data as ProfileRow | null;

        const newPlayer: PlayerProfile = profile
          ? {
              id: profile.id,
              firstName: profile.first_name || authData.user.user_metadata?.first_name || 'Player',
              lastName: profile.last_name || authData.user.user_metadata?.last_name || '',
              displayName: profile.display_name || authData.user.user_metadata?.display_name || email,
              email: profile.email || email,
              mobileNumber: profile.phone || '',
              avatarUrl: profile.avatar_url || `https://i.pravatar.cc/150?u=${email}`,
              createdAt: profile.created_at || new Date().toISOString(),
              eventsPlayed: 0,
              matchesPlayed: 0,
              matchesWon: 0,
              matchesLost: 0,
              winRate: 0,
              totalGamesWon: 0,
              totalGamesLost: 0,
              recentEvents: [],
            }
          : {
              id: authData.user.id,
              firstName: authData.user.user_metadata?.first_name || 'Player',
              lastName: authData.user.user_metadata?.last_name || '',
              displayName: authData.user.user_metadata?.display_name || email,
              email,
              avatarUrl: `https://i.pravatar.cc/150?u=${email}`,
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
      const { createClient } = await import('../lib/supabase/client');
      const supabase = createClient();
      await supabase.auth.signOut();
      if (typeof window !== 'undefined') {
        localStorage.removeItem(`${STORAGE_KEY}_current_user`);
      }
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const forgotPasswordAction = async (email: string) => {
    try {
      const { createClient } = await import('../lib/supabase/client');
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
      const { createClient } = await import('../lib/supabase/client');
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

  const createEvent = (newEventData: Partial<EventItem>): string => {
    const eventId = `evt_${Date.now()}`;
    const facility = facilities.find((f) => f.id === newEventData.facilityId) || facilities[0];

    const newEvent: EventItem = {
      id: eventId,
      name: newEventData.name || 'New Padel Tournament',
      description: newEventData.description || '',
      type: newEventData.type || 'tournament',
      format: newEventData.format || (newEventData.type === 'normal_match' ? 'standard_3_sets' : 'custom'),
      date: newEventData.date || new Date().toISOString().split('T')[0],
      startTime: newEventData.startTime || '18:00',
      facilityId: facility.id,
      facilityName: facility.name,
      courtIds: newEventData.courtIds || [],
      ownerId: currentUser.id,
      ownerName: currentUser.displayName,
      coAdminIds: newEventData.coAdminIds || [],
      maxPlayers: newEventData.maxPlayers || 16,
      maxTeams: (newEventData.maxPlayers || 16) / 2,
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

  const deleteEvent = (eventId: string) => {
    setEvents((prev) => prev.filter((e) => e.id !== eventId));
  };

  const joinEvent = (eventId: string, preferredPartnerId?: string) => {
    let resultStatus: 'confirmed' | 'waiting_list' = 'confirmed';
    setEvents((prev) =>
      prev.map((event) => {
        if (event.id !== eventId) return event;

        // Check if already registered
        const exists = event.participants.some((p) => p.id === currentUser.id);
        if (exists) {
          const currentP = event.participants.find((p) => p.id === currentUser.id);
          if (currentP) resultStatus = currentP.status;
          // Update preferred partner
          return {
            ...event,
            participants: event.participants.map((p) =>
              p.id === currentUser.id ? { ...p, preferredPartnerId } : p
            ),
          };
        }

        const confirmedCount = event.participants.filter((p) => p.status === 'confirmed').length;
        const isFull = confirmedCount >= event.maxPlayers;
        resultStatus = isFull ? 'waiting_list' : 'confirmed';

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
    // Clear partner requests involving this participant for this event
    setPartnerRequests((prev) =>
      prev.filter(
        (r) => !(r.eventId === eventId && (r.fromUserId === targetUserId || r.toUserId === targetUserId))
      )
    );

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

            // Send notification to promoted user
            setNotifications((n) => [
              {
                id: `notif_${Date.now()}`,
                userId: firstWaiting.id,
                title: 'Promoted from Waiting List!',
                message: `A spot opened up in ${event.name}! You are now confirmed.`,
                date: new Date().toISOString(),
                read: false,
                eventId: event.id,
              },
              ...n,
            ]);
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

        // Notification to user withdrawing
        if (!leaving.isGuest) {
          setNotifications((n) => [
            {
              id: `notif_wdr_${Date.now()}`,
              userId: targetUserId,
              title: 'Registration Withdrawn',
              message: `You have successfully withdrawn your registration from "${event.name}".`,
              date: new Date().toISOString(),
              read: false,
              eventId: event.id,
            },
            ...n,
          ]);
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
        id: `notif_${Date.now()}`,
        userId: toUserId,
        title: 'Partner Request Received 🎾',
        message: `${currentUser.displayName} requested to be your partner for the tournament!`,
        date: new Date().toISOString(),
        read: false,
        eventId,
      },
      ...n,
    ]);
  };

  const respondToPartnerRequest = (requestId: string, accept: boolean) => {
    setPartnerRequests((prev) =>
      prev.map((r) => {
        if (r.id !== requestId) return r;
        const newStatus = accept ? 'accepted' : 'declined';

        // Notify sender
        setNotifications((n) => [
          {
            id: `notif_${Date.now()}`,
            userId: r.fromUserId,
            title: accept ? 'Partner Request Accepted!' : 'Partner Request Declined',
            message: `${currentUser.displayName} ${accept ? 'accepted' : 'declined'} your partner request.`,
            date: new Date().toISOString(),
            read: false,
            eventId: r.eventId,
          },
          ...n,
        ]);

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

  const createPlayerGroupAction = (name: string, description: string, memberIds: string[]): PlayerGroup => {
    const newGroup: PlayerGroup = {
      id: `grp_${Date.now()}`,
      name,
      description,
      ownerId: currentUser.id,
      memberIds: Array.from(new Set([currentUser.id, ...memberIds])),
      createdAt: new Date().toISOString(),
    };

    setPlayerGroups((prev) => [newGroup, ...prev]);
    return newGroup;
  };

  const joinPlayerGroupAction = (
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
        id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
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

  const saveFacility = (data: Partial<Facility> & { name: string; address: string; city: string }): Facility => {
    let resultFacility: Facility | null = null;
    setFacilities((prev) => {
      const existingIdx = prev.findIndex((f) => f.id === data.id);
      if (existingIdx >= 0) {
        const existing = prev[existingIdx];
        resultFacility = {
          ...existing,
          ...data,
        };
        const updated = [...prev];
        updated[existingIdx] = resultFacility;
        return updated;
      } else {
        const newId = `fac_${Date.now()}`;
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
        return [resultFacility, ...prev];
      }
    });

    if (!resultFacility) {
      resultFacility = {
        id: data.id || `fac_${Date.now()}`,
        name: data.name,
        address: data.address,
        city: data.city || 'Dubai',
        country: data.country || 'United Arab Emirates',
        googleMapsUrl: data.googleMapsUrl || '',
        isFavorite: data.isFavorite ?? true,
        courts: data.courts || [{ id: 'c1', name: 'Court 1' }],
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
    localStorage.removeItem(`${STORAGE_KEY}_players`);
    localStorage.removeItem(`${STORAGE_KEY}_facilities`);
    localStorage.removeItem(`${STORAGE_KEY}_events`);
    localStorage.removeItem(`${STORAGE_KEY}_groups`);
    localStorage.removeItem(`${STORAGE_KEY}_requests`);
    localStorage.removeItem(`${STORAGE_KEY}_current_user`);

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
