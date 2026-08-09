import {
  Facility,
  PlayerProfile,
  EventItem,
  PlayerGroup,
  Team,
  TournamentGroup,
  Match
} from '../types';

export const SEED_FACILITIES: Facility[] = [
  {
    id: 'fac_1',
    name: 'Dubai Padel Club',
    address: 'Al Quoz Industrial Area 3, Dubai',
    city: 'Dubai',
    country: 'United Arab Emirates',
    googleMapsUrl: 'https://maps.google.com/?q=Dubai+Padel+Club',
    isFavorite: true,
    courts: [
      { id: 'c1', name: 'Court 1' },
      { id: 'c2', name: 'Court 2' },
      { id: 'c3', name: 'Court 3' },
      { id: 'c4', name: 'Court 4' },
      { id: 'c5', name: 'Court 5' },
      { id: 'c6', name: 'Court 6' },
      { id: 'c7', name: 'Court 7' },
      { id: 'c8', name: 'Court 8' },
    ],
  },
  {
    id: 'fac_2',
    name: 'WPA Padel Academy Meydan',
    address: 'Meydan Racecourse, Nad Al Sheba, Dubai',
    city: 'Dubai',
    country: 'United Arab Emirates',
    googleMapsUrl: 'https://maps.google.com/?q=WPA+Padel+Academy+Meydan',
    isFavorite: true,
    courts: [
      { id: 'wpa_1', name: 'Court A' },
      { id: 'wpa_2', name: 'Court B' },
      { id: 'wpa_3', name: 'Court C' },
      { id: 'wpa_4', name: 'Court D' },
      { id: 'wpa_5', name: 'Court E' },
      { id: 'wpa_6', name: 'Court F' },
      { id: 'wpa_7', name: 'Court G' },
      { id: 'wpa_8', name: 'Court H' },
    ],
  },
  {
    id: 'fac_3',
    name: 'Real Padel Club Sharjah',
    address: 'Al Mirgab, Sharjah',
    city: 'Sharjah',
    country: 'United Arab Emirates',
    googleMapsUrl: 'https://maps.google.com/?q=Real+Padel+Club+Sharjah',
    isFavorite: true,
    courts: [
      { id: 'rpc_1', name: 'Court 1' },
      { id: 'rpc_2', name: 'Court 2' },
      { id: 'rpc_3', name: 'Court 3' },
      { id: 'rpc_4', name: 'Court 4' },
    ],
  },
];

export const SEED_PLAYERS: PlayerProfile[] = [
  {
    id: 'usr_simone',
    firstName: 'Simone',
    lastName: 'Rossi',
    displayName: 'Simone Rossi',
    email: 'simone@example.com',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
    mobileNumber: '+971 50 123 4567',
    createdAt: '2026-01-10T10:00:00Z',
    eventsPlayed: 12,
    matchesPlayed: 36,
    matchesWon: 28,
    matchesLost: 8,
    winRate: 78,
    totalGamesWon: 210,
    totalGamesLost: 120,
    recentEvents: [
      { eventId: 'evt_dubai_championship_2026', eventName: 'Dubai Night Padel Championship 2026', date: '2026-08-08', result: 'Qualified' },
    ],
  },
  {
    id: 'usr_marco',
    firstName: 'Marco',
    lastName: 'Rossi',
    displayName: 'Marco Rossi',
    email: 'marco@example.com',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
    mobileNumber: '+971 50 234 5678',
    createdAt: '2026-01-12T11:00:00Z',
    eventsPlayed: 10,
    matchesPlayed: 30,
    matchesWon: 22,
    matchesLost: 8,
    winRate: 73,
    totalGamesWon: 175,
    totalGamesLost: 105,
    recentEvents: [
      { eventId: 'evt_dubai_championship_2026', eventName: 'Dubai Night Padel Championship 2026', date: '2026-08-08', result: 'Qualified' },
    ],
  },
  {
    id: 'usr_ahmed',
    firstName: 'Ahmed',
    lastName: 'Al Mansoori',
    displayName: 'Ahmed Al Mansoori',
    email: 'ahmed@example.com',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200',
    mobileNumber: '+971 52 345 6789',
    createdAt: '2026-01-15T12:00:00Z',
    eventsPlayed: 15,
    matchesPlayed: 45,
    matchesWon: 31,
    matchesLost: 14,
    winRate: 69,
    totalGamesWon: 240,
    totalGamesLost: 160,
    recentEvents: [
      { eventId: 'evt_dubai_championship_2026', eventName: 'Dubai Night Padel Championship 2026', date: '2026-08-08', result: 'Qualified' },
    ],
  },
  {
    id: 'usr_john',
    firstName: 'John',
    lastName: 'Smith',
    displayName: 'John Smith',
    email: 'john@example.com',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200',
    mobileNumber: '+971 55 456 7890',
    createdAt: '2026-01-20T09:00:00Z',
    eventsPlayed: 8,
    matchesPlayed: 24,
    matchesWon: 15,
    matchesLost: 9,
    winRate: 63,
    totalGamesWon: 130,
    totalGamesLost: 98,
    recentEvents: [],
  },
  {
    id: 'usr_alex',
    firstName: 'Alex',
    lastName: 'Rivera',
    displayName: 'Alex Rivera',
    email: 'alex@example.com',
    avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=200',
    mobileNumber: '+971 50 567 8901',
    createdAt: '2026-02-01T14:00:00Z',
    eventsPlayed: 14,
    matchesPlayed: 42,
    matchesWon: 27,
    matchesLost: 15,
    winRate: 64,
    totalGamesWon: 220,
    totalGamesLost: 150,
    recentEvents: [],
  },
  {
    id: 'usr_david',
    firstName: 'David',
    lastName: 'Chen',
    displayName: 'David Chen',
    email: 'david@example.com',
    avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=200',
    mobileNumber: '+971 54 678 9012',
    createdAt: '2026-02-05T15:00:00Z',
    eventsPlayed: 9,
    matchesPlayed: 27,
    matchesWon: 16,
    matchesLost: 11,
    winRate: 59,
    totalGamesWon: 140,
    totalGamesLost: 115,
    recentEvents: [],
  },
  {
    id: 'usr_omar',
    firstName: 'Omar',
    lastName: 'Al Zaabi',
    displayName: 'Omar Al Zaabi',
    email: 'omar@example.com',
    avatarUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&q=80&w=200',
    mobileNumber: '+971 56 789 0123',
    createdAt: '2026-02-10T16:00:00Z',
    eventsPlayed: 11,
    matchesPlayed: 33,
    matchesWon: 20,
    matchesLost: 13,
    winRate: 61,
    totalGamesWon: 180,
    totalGamesLost: 135,
    recentEvents: [],
  },
  {
    id: 'usr_chris',
    firstName: 'Chris',
    lastName: 'Evans',
    displayName: 'Chris Evans',
    email: 'chris@example.com',
    avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=200',
    mobileNumber: '+971 50 890 1234',
    createdAt: '2026-02-15T17:00:00Z',
    eventsPlayed: 7,
    matchesPlayed: 21,
    matchesWon: 11,
    matchesLost: 10,
    winRate: 52,
    totalGamesWon: 105,
    totalGamesLost: 100,
    recentEvents: [],
  },
];

// Generate 40 additional UAE padel players
const FIRST_NAMES = ['Saeed', 'Rashid', 'Tariq', 'Youssef', 'Hamdan', 'Faisal', 'Zayed', 'Lucas', 'Mateo', 'Pablo', 'Carlos', 'Diego', 'Gonzalo', 'Fernando', 'Javier', 'Hugo', 'Adrian', 'Liam', 'Sebastian', 'Julian'];
const LAST_NAMES = ['Al Maktoum', 'Al Habtoor', 'Al Qasimi', 'Al Nahyan', 'Garcia', 'Martinez', 'Lopez', 'Hernandez', 'Gonzalez', 'Rodriguez', 'Perez', 'Sanchez', 'Ramirez', 'Torres', 'Flores', 'Diaz', 'Vasquez', 'Gomez', 'Morales', 'Reyes'];

for (let i = 1; i <= 40; i++) {
  const fName = FIRST_NAMES[i % FIRST_NAMES.length];
  const lName = LAST_NAMES[(i * 3) % LAST_NAMES.length];
  SEED_PLAYERS.push({
    id: `usr_gen_${i}`,
    firstName: fName,
    lastName: lName,
    displayName: `${fName} ${lName}`,
    email: `${fName.toLowerCase()}.${lName.toLowerCase().replace(/\s+/g, '')}${i}@example.com`,
    avatarUrl: `https://i.pravatar.cc/150?u=user_gen_${i}`,
    mobileNumber: `+971 50 ${100 + i} ${2000 + i}`,
    createdAt: '2026-03-01T10:00:00Z',
    eventsPlayed: 5 + (i % 8),
    matchesPlayed: 15 + (i % 20),
    matchesWon: 8 + (i % 12),
    matchesLost: 7 + (i % 8),
    winRate: 50 + (i % 30),
    totalGamesWon: 80 + i * 5,
    totalGamesLost: 70 + i * 4,
    recentEvents: [],
  });
}

export const SEED_GROUPS: PlayerGroup[] = [
  {
    id: 'grp_1',
    name: 'Friday Padel Crew',
    description: 'Weekly Friday night padel group in Dubai Al Quoz.',
    ownerId: 'usr_simone',
    memberIds: ['usr_simone', 'usr_marco', 'usr_ahmed', 'usr_john', 'usr_alex', 'usr_david', 'usr_omar', 'usr_chris'],
    createdAt: '2026-01-15T10:00:00Z',
  },
  {
    id: 'grp_2',
    name: 'Meydan Morning League',
    description: 'Early morning padel sessions at WPA Meydan.',
    ownerId: 'usr_ahmed',
    memberIds: ['usr_ahmed', 'usr_john', 'usr_simone', 'usr_alex', 'usr_gen_1', 'usr_gen_2'],
    createdAt: '2026-02-01T10:00:00Z',
  },
];

// Helper to construct full 48-player seed tournament
function buildSeedTournament(): EventItem {
  const eventId = 'evt_dubai_championship_2026';

  // 48 Participants (48 confirmed)
  const participants = SEED_PLAYERS.map((p, idx) => ({
    id: p.id,
    displayName: p.displayName,
    isGuest: false,
    registeredAt: `2026-08-01T${10 + (idx % 10)}:00:00Z`,
    status: 'confirmed' as const,
  }));

  // 24 Teams
  const teams: Team[] = [];
  for (let i = 0; i < 24; i++) {
    const p1 = SEED_PLAYERS[i * 2];
    const p2 = SEED_PLAYERS[i * 2 + 1];
    teams.push({
      id: `team_${eventId}_${i + 1}`,
      eventId,
      name: i === 0 ? 'Simone & Marco' : i === 1 ? 'Ahmed & John' : i === 2 ? 'Alex & David' : `Team ${String(i + 1).padStart(2, '0')}`,
      player1: { id: p1.id, displayName: p1.displayName, isGuest: false },
      player2: { id: p2.id, displayName: p2.displayName, isGuest: false },
      locked: true,
      groupId: `group_${eventId}_${Math.floor(i / 4) + 1}`,
    });
  }

  // 6 Groups (Group A to F)
  const groupLetters = ['A', 'B', 'C', 'D', 'E', 'F'];
  const groups: TournamentGroup[] = groupLetters.map((letter, gIdx) => ({
    id: `group_${eventId}_${gIdx + 1}`,
    eventId,
    name: `Group ${letter}`,
    teamIds: teams.slice(gIdx * 4, gIdx * 4 + 4).map((t) => t.id),
  }));

  // Matches for Group Stage (6 groups x 6 matches = 36 group matches)
  const courtIds = ['c1', 'c2', 'c3', 'c4', 'c5', 'c6'];
  const courtNames = ['Court 1', 'Court 2', 'Court 3', 'Court 4', 'Court 5', 'Court 6'];
  const matches: Match[] = [];

  let matchCounter = 1;
  groups.forEach((g, gIdx) => {
    const c1Id = courtIds[(gIdx * 2) % 6];
    const c2Id = courtIds[(gIdx * 2 + 1) % 6];
    const c1Name = courtNames[(gIdx * 2) % 6];
    const c2Name = courtNames[(gIdx * 2 + 1) % 6];

    const [t1, t2, t3, t4] = g.teamIds;

    // Round 1 (Completed)
    matches.push({
      id: `match_${eventId}_${matchCounter++}`,
      eventId,
      stage: 'group',
      groupId: g.id,
      round: 1,
      courtId: c1Id,
      courtName: c1Name,
      team1Id: t1,
      team2Id: t2,
      team1Score: 6,
      team2Score: 4,
      winnerTeamId: t1,
      status: 'completed',
    });

    matches.push({
      id: `match_${eventId}_${matchCounter++}`,
      eventId,
      stage: 'group',
      groupId: g.id,
      round: 1,
      courtId: c2Id,
      courtName: c2Name,
      team1Id: t3,
      team2Id: t4,
      team1Score: 6,
      team2Score: 2,
      winnerTeamId: t3,
      status: 'completed',
    });

    // Round 2 (Completed)
    matches.push({
      id: `match_${eventId}_${matchCounter++}`,
      eventId,
      stage: 'group',
      groupId: g.id,
      round: 2,
      courtId: c1Id,
      courtName: c1Name,
      team1Id: t1,
      team2Id: t3,
      team1Score: 6,
      team2Score: 3,
      winnerTeamId: t1,
      status: 'completed',
    });

    matches.push({
      id: `match_${eventId}_${matchCounter++}`,
      eventId,
      stage: 'group',
      groupId: g.id,
      round: 2,
      courtId: c2Id,
      courtName: c2Name,
      team1Id: t2,
      team2Id: t4,
      team1Score: 6,
      team2Score: 5,
      winnerTeamId: t2,
      status: 'completed',
    });

    // Round 3 (Completed)
    matches.push({
      id: `match_${eventId}_${matchCounter++}`,
      eventId,
      stage: 'group',
      groupId: g.id,
      round: 3,
      courtId: c1Id,
      courtName: c1Name,
      team1Id: t1,
      team2Id: t4,
      team1Score: 6,
      team2Score: 1,
      winnerTeamId: t1,
      status: 'completed',
    });

    matches.push({
      id: `match_${eventId}_${matchCounter++}`,
      eventId,
      stage: 'group',
      groupId: g.id,
      round: 3,
      courtId: c2Id,
      courtName: c2Name,
      team1Id: t2,
      team2Id: t3,
      team1Score: 4,
      team2Score: 6,
      winnerTeamId: t3,
      status: 'completed',
    });
  });

  // Knockout Stage Matches (Quarter-Finals -> Semi-Finals -> Final)
  const qf1Id = `ko_${eventId}_qf_1`;
  const qf2Id = `ko_${eventId}_qf_2`;
  const qf3Id = `ko_${eventId}_qf_3`;
  const qf4Id = `ko_${eventId}_qf_4`;

  const sf1Id = `ko_${eventId}_sf_1`;
  const sf2Id = `ko_${eventId}_sf_2`;
  const finalId = `ko_${eventId}_final`;

  // Final Match
  matches.push({
    id: finalId,
    eventId,
    stage: 'knockout',
    round: 3,
    courtId: 'c1',
    courtName: 'Court 1',
    team1Id: '',
    team2Id: '',
    status: 'scheduled',
    knockoutStage: 'final',
    knockoutMatchNumber: 1,
  });

  // Semi Finals
  matches.push({
    id: sf1Id,
    eventId,
    stage: 'knockout',
    round: 2,
    courtId: 'c1',
    courtName: 'Court 1',
    team1Id: '',
    team2Id: '',
    status: 'scheduled',
    knockoutStage: 'semi_finals',
    knockoutMatchNumber: 1,
    nextKnockoutMatchId: finalId,
    nextKnockoutSlot: 1,
  });

  matches.push({
    id: sf2Id,
    eventId,
    stage: 'knockout',
    round: 2,
    courtId: 'c2',
    courtName: 'Court 2',
    team1Id: '',
    team2Id: '',
    status: 'scheduled',
    knockoutStage: 'semi_finals',
    knockoutMatchNumber: 2,
    nextKnockoutMatchId: finalId,
    nextKnockoutSlot: 2,
  });

  // Quarter Finals (Active/Ready)
  matches.push({
    id: qf1Id,
    eventId,
    stage: 'knockout',
    round: 1,
    courtId: 'c1',
    courtName: 'Court 1',
    team1Id: teams[0].id, // Simone & Marco
    team2Id: teams[5].id,
    status: 'ready',
    knockoutStage: 'quarter_finals',
    knockoutMatchNumber: 1,
    nextKnockoutMatchId: sf1Id,
    nextKnockoutSlot: 1,
  });

  matches.push({
    id: qf2Id,
    eventId,
    stage: 'knockout',
    round: 1,
    courtId: 'c2',
    courtName: 'Court 2',
    team1Id: teams[4].id, // Ahmed & John
    team2Id: teams[1].id,
    status: 'ready',
    knockoutStage: 'quarter_finals',
    knockoutMatchNumber: 2,
    nextKnockoutMatchId: sf1Id,
    nextKnockoutSlot: 2,
  });

  matches.push({
    id: qf3Id,
    eventId,
    stage: 'knockout',
    round: 1,
    courtId: 'c3',
    courtName: 'Court 3',
    team1Id: teams[8].id,
    team2Id: teams[13].id,
    status: 'ready',
    knockoutStage: 'quarter_finals',
    knockoutMatchNumber: 3,
    nextKnockoutMatchId: sf2Id,
    nextKnockoutSlot: 1,
  });

  matches.push({
    id: qf4Id,
    eventId,
    stage: 'knockout',
    round: 1,
    courtId: 'c4',
    courtName: 'Court 4',
    team1Id: teams[12].id,
    team2Id: teams[9].id,
    status: 'ready',
    knockoutStage: 'quarter_finals',
    knockoutMatchNumber: 4,
    nextKnockoutMatchId: sf2Id,
    nextKnockoutSlot: 2,
  });

  return {
    id: eventId,
    name: 'Dubai Night Padel Championship 2026',
    description: 'Premier 48-player private tournament in Dubai Al Quoz featuring 24 teams across 6 groups and 6 courts with knockout bracket progression.',
    type: 'tournament',
    format: 'custom',
    date: '2026-08-08',
    startTime: '19:00',
    facilityId: 'fac_1',
    facilityName: 'Dubai Padel Club',
    courtIds: ['c1', 'c2', 'c3', 'c4', 'c5', 'c6'],
    ownerId: 'usr_simone',
    ownerName: 'Simone Rossi',
    coAdminIds: ['usr_ahmed', 'usr_marco'],
    maxPlayers: 48,
    maxTeams: 24,
    visibility: 'private',
    status: 'knockout_stage',
    participants,
    teams,
    groups,
    matches,
    rules: {
      winPoints: 3,
      drawPoints: 1,
      lossPoints: 0,
      tiebreakOrder: ['points', 'matchesWon', 'scoreDiff', 'scoreFor'],
      qualifiersPerGroup: 2,
    },
    createdAt: '2026-08-01T10:00:00Z',
  };
}

export const SEED_EVENTS: EventItem[] = [
  buildSeedTournament(),
  {
    id: 'evt_normal_match_1',
    name: 'Friday Morning 2v2 Challenge',
    description: 'Casual high-tempo 2v2 padel set at WPA Meydan.',
    type: 'normal_match',
    format: 'standard_3_sets',
    date: '2026-08-08',
    startTime: '09:00',
    facilityId: 'fac_2',
    facilityName: 'WPA Padel Academy Meydan',
    courtIds: ['wpa_1'],
    ownerId: 'usr_simone',
    ownerName: 'Simone Rossi',
    coAdminIds: [],
    maxPlayers: 4,
    maxTeams: 2,
    visibility: 'private',
    status: 'in_progress',
    participants: [
      { id: 'usr_simone', displayName: 'Simone Rossi', isGuest: false, registeredAt: '2026-08-05T10:00:00Z', status: 'confirmed' },
      { id: 'usr_marco', displayName: 'Marco Rossi', isGuest: false, registeredAt: '2026-08-05T10:05:00Z', status: 'confirmed' },
      { id: 'usr_ahmed', displayName: 'Ahmed Al Mansoori', isGuest: false, registeredAt: '2026-08-05T10:10:00Z', status: 'confirmed' },
      { id: 'usr_john', displayName: 'John Smith', isGuest: false, registeredAt: '2026-08-05T10:15:00Z', status: 'confirmed' },
    ],
    teams: [
      {
        id: 'team_normal_1',
        eventId: 'evt_normal_match_1',
        name: 'Simone & Marco',
        player1: { id: 'usr_simone', displayName: 'Simone Rossi', isGuest: false },
        player2: { id: 'usr_marco', displayName: 'Marco Rossi', isGuest: false },
        locked: true,
      },
      {
        id: 'team_normal_2',
        eventId: 'evt_normal_match_1',
        name: 'Ahmed & John',
        player1: { id: 'usr_ahmed', displayName: 'Ahmed Al Mansoori', isGuest: false },
        player2: { id: 'usr_john', displayName: 'John Smith', isGuest: false },
        locked: true,
      },
    ],
    groups: [],
    matches: [
      {
        id: 'match_normal_1',
        eventId: 'evt_normal_match_1',
        stage: 'group',
        round: 1,
        courtId: 'wpa_1',
        courtName: 'Court A',
        team1Id: 'team_normal_1',
        team2Id: 'team_normal_2',
        status: 'in_progress',
      },
    ],
    rules: {
      winPoints: 3,
      drawPoints: 1,
      lossPoints: 0,
      tiebreakOrder: ['points', 'matchesWon', 'scoreDiff'],
      qualifiersPerGroup: 1,
    },
    createdAt: '2026-08-05T10:00:00Z',
  },
  {
    id: 'evt_abudhabi_cup_2026',
    name: 'Abu Dhabi Weekend Cup',
    description: 'Open 16-player private tournament accepting new registrations and preferred partner selections.',
    type: 'tournament',
    format: 'americano',
    date: '2026-08-15',
    startTime: '18:00',
    facilityId: 'fac_3',
    facilityName: 'Real Padel Club Sharjah',
    courtIds: ['rpc_1', 'rpc_2', 'rpc_3', 'rpc_4'],
    ownerId: 'usr_ahmed',
    ownerName: 'Ahmed Al Mansoori',
    coAdminIds: ['usr_simone'],
    maxPlayers: 16,
    maxTeams: 8,
    visibility: 'private',
    status: 'open',
    participants: [
      { id: 'usr_ahmed', displayName: 'Ahmed Al Mansoori', isGuest: false, registeredAt: '2026-08-06T10:00:00Z', status: 'confirmed', preferredPartnerId: 'usr_john' },
      { id: 'usr_john', displayName: 'John Smith', isGuest: false, registeredAt: '2026-08-06T10:05:00Z', status: 'confirmed', preferredPartnerId: 'usr_ahmed' },
      { id: 'usr_alex', displayName: 'Alex Rivera', isGuest: false, registeredAt: '2026-08-06T11:00:00Z', status: 'confirmed', preferredPartnerId: 'usr_david' },
      { id: 'usr_david', displayName: 'David Chen', isGuest: false, registeredAt: '2026-08-06T11:10:00Z', status: 'confirmed', preferredPartnerId: 'usr_alex' },
      { id: 'usr_simone', displayName: 'Simone Rossi', isGuest: false, registeredAt: '2026-08-06T12:00:00Z', status: 'confirmed', preferredPartnerId: 'usr_marco' },
      { id: 'usr_marco', displayName: 'Marco Rossi', isGuest: false, registeredAt: '2026-08-06T12:05:00Z', status: 'confirmed', preferredPartnerId: 'usr_simone' },
    ],
    teams: [],
    groups: [],
    matches: [],
    rules: {
      winPoints: 3,
      drawPoints: 1,
      lossPoints: 0,
      tiebreakOrder: ['points', 'matchesWon', 'scoreDiff', 'scoreFor'],
      qualifiersPerGroup: 2,
    },
    createdAt: '2026-08-06T10:00:00Z',
  },
];
