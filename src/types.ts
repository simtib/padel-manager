export type EventType = 'normal_match' | 'tournament';

export type EventFormat = 'standard_3_sets' | 'americano' | 'custom';

export type EventStatus =
  | 'draft'
  | 'open'
  | 'full'
  | 'teams_generated'
  | 'ready'
  | 'in_progress'
  | 'knockout_stage'
  | 'completed'
  | 'cancelled';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  displayName: string;
  email: string;
  avatarUrl?: string;
  mobileNumber?: string;
  createdAt: string;
}

export interface PlayerProfile extends User {
  eventsPlayed: number;
  matchesPlayed: number;
  matchesWon: number;
  matchesLost: number;
  winRate: number;
  totalGamesWon: number;
  totalGamesLost: number;
  preferredPosition?: string;
  skillLevel?: string;
  level?: string;
  position?: string;
  location?: string;
  recentEvents: Array<{
    eventId: string;
    eventName: string;
    date: string;
    result: 'Champion' | 'Runner-Up' | 'Qualified' | 'Participated' | 'Won' | 'Lost';
  }>;
}

export interface GuestPlayer {
  id: string;
  name: string;
  addedByUserId: string;
  createdAt: string;
}

export interface Participant {
  id: string; // userId or guestId
  displayName: string;
  isGuest: boolean;
  addedByUserId?: string;
  registeredAt: string;
  status: 'confirmed' | 'waiting_list';
  waitingListPosition?: number;
  preferredPartnerId?: string; // userId or guestId
}

export interface PartnerRequest {
  id: string;
  eventId: string;
  fromUserId: string;
  fromUserName: string;
  toUserId: string;
  toUserName: string;
  status: 'pending' | 'accepted' | 'declined';
  createdAt: string;
}

export interface TeamMember {
  id: string;
  displayName: string;
  isGuest: boolean;
}

export interface Team {
  id: string;
  eventId: string;
  name: string;
  player1: TeamMember;
  player2: TeamMember;
  locked: boolean;
  groupId?: string;
}

export interface Court {
  id: string;
  name: string; // e.g. "Court 1"
}

export interface Facility {
  id: string;
  name: string;
  address: string;
  city: string;
  country: string;
  googleMapsUrl?: string;
  isFavorite?: boolean;
  courts: Court[];
}

export interface TournamentGroup {
  id: string;
  eventId: string;
  name: string; // e.g. "Group A"
  teamIds: string[];
}

export interface SetScore {
  team1Score: number;
  team2Score: number;
}

export type MatchStatus = 'scheduled' | 'ready' | 'in_progress' | 'completed';

export interface Match {
  id: string;
  eventId: string;
  stage: 'group' | 'knockout';
  groupId?: string;
  round: number; // 1, 2, 3...
  courtId: string;
  courtName: string;
  team1Id: string;
  team2Id: string;
  team1Score?: number;
  team2Score?: number;
  sets?: SetScore[];
  winnerTeamId?: string;
  status: MatchStatus;
  recordedByUserId?: string;
  recordedAt?: string;
  knockoutStage?: 'round_of_16' | 'quarter_finals' | 'semi_finals' | 'final';
  knockoutMatchNumber?: number;
  nextKnockoutMatchId?: string;
  nextKnockoutSlot?: 1 | 2;
}

export interface TournamentRule {
  winPoints: number;
  drawPoints: number;
  lossPoints: number;
  tiebreakOrder: Array<'points' | 'matchesWon' | 'scoreDiff' | 'scoreFor' | 'headToHead'>;
  qualifiersPerGroup: number;
}

export interface GroupStanding {
  teamId: string;
  teamName: string;
  playerNames: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  gamesFor: number;
  gamesAgainst: number;
  difference: number;
  points: number;
  qualified: boolean;
}

export interface EventItem {
  id: string;
  name: string;
  description?: string;
  type: EventType;
  format?: EventFormat;
  date: string;
  startTime: string;
  facilityId: string;
  facilityName: string;
  courtIds: string[];
  ownerId: string;
  ownerName: string;
  coAdminIds: string[]; // up to 3 co-admins
  maxPlayers: number; // e.g. 48 or 4 for normal match
  maxTeams: number;   // maxPlayers / 2
  visibility: 'private' | 'public';
  status: EventStatus;
  participants: Participant[];
  teams: Team[];
  groups: TournamentGroup[];
  matches: Match[];
  rules: TournamentRule;
  createdAt: string;
}

export interface PlayerGroup {
  id: string;
  name: string;
  description?: string;
  ownerId: string;
  memberIds: string[];
  pendingRequestUserIds?: string[];
  createdAt: string;
}

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  date: string;
  read: boolean;
  eventId?: string;
}
