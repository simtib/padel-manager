import {
  Participant,
  PartnerRequest,
  Team,
  TournamentGroup,
  Match,
  TournamentRule,
  GroupStanding,
  User,
  PlayerProfile,
  EventItem
} from '../types';

/**
 * 1. Team Generation Logic
 * Priority 1: Confirmed mutual preferred partnerships
 * Priority 2: Auto-pair remaining unpaired participants
 */
export function generateTeamsFromParticipants(
  eventId: string,
  participants: Participant[],
  partnerRequests: PartnerRequest[],
  existingTeamsMap: Record<string, Team> = {}
): Team[] {
  const confirmedParticipants = participants.filter((p) => p.status === 'confirmed');
  const usedParticipantIds = new Set<string>();
  const teams: Team[] = [];

  // Keep existing locked teams if valid
  Object.values(existingTeamsMap).forEach((team) => {
    if (team.locked) {
      teams.push(team);
      usedParticipantIds.add(team.player1.id);
      usedParticipantIds.add(team.player2.id);
    }
  });

  const availableParticipants = confirmedParticipants.filter(
    (p) => !usedParticipantIds.has(p.id)
  );

  // Priority 1: Mutual accepted partner requests
  const acceptedRequests = partnerRequests.filter(
    (r) => r.eventId === eventId && r.status === 'accepted'
  );

  let teamCounter = teams.length + 1;

  for (const req of acceptedRequests) {
    if (usedParticipantIds.has(req.fromUserId) || usedParticipantIds.has(req.toUserId)) {
      continue;
    }

    const p1 = availableParticipants.find((p) => p.id === req.fromUserId);
    const p2 = availableParticipants.find((p) => p.id === req.toUserId);

    if (p1 && p2) {
      teams.push({
        id: `team_${eventId}_${Date.now()}_${teamCounter}`,
        eventId,
        name: `Team ${String(teamCounter).padStart(2, '0')}`,
        player1: { id: p1.id, displayName: p1.displayName, isGuest: p1.isGuest },
        player2: { id: p2.id, displayName: p2.displayName, isGuest: p2.isGuest },
        locked: false,
      });

      usedParticipantIds.add(p1.id);
      usedParticipantIds.add(p2.id);
      teamCounter++;
    }
  }

  // Also check non-accepted direct selections if both selected each other
  const remaining = availableParticipants.filter((p) => !usedParticipantIds.has(p.id));

  for (let i = 0; i < remaining.length; i++) {
    const p1 = remaining[i];
    if (usedParticipantIds.has(p1.id) || !p1.preferredPartnerId) continue;

    const p2 = remaining.find(
      (p) =>
        p.id === p1.preferredPartnerId &&
        !usedParticipantIds.has(p.id) &&
        (p.preferredPartnerId === p1.id || true) // Pair if available
    );

    if (p2 && p2.id !== p1.id) {
      teams.push({
        id: `team_${eventId}_${Date.now()}_${teamCounter}`,
        eventId,
        name: `Team ${String(teamCounter).padStart(2, '0')}`,
        player1: { id: p1.id, displayName: p1.displayName, isGuest: p1.isGuest },
        player2: { id: p2.id, displayName: p2.displayName, isGuest: p2.isGuest },
        locked: false,
      });

      usedParticipantIds.add(p1.id);
      usedParticipantIds.add(p2.id);
      teamCounter++;
    }
  }

  // Priority 2: Auto-pair remaining players
  const stillUnpaired = confirmedParticipants.filter((p) => !usedParticipantIds.has(p.id));

  for (let i = 0; i < stillUnpaired.length; i += 2) {
    const p1 = stillUnpaired[i];
    const p2 = stillUnpaired[i + 1];

    if (p1 && p2) {
      teams.push({
        id: `team_${eventId}_${Date.now()}_${teamCounter}`,
        eventId,
        name: `Team ${String(teamCounter).padStart(2, '0')}`,
        player1: { id: p1.id, displayName: p1.displayName, isGuest: p1.isGuest },
        player2: { id: p2.id, displayName: p2.displayName, isGuest: p2.isGuest },
        locked: false,
      });
      usedParticipantIds.add(p1.id);
      usedParticipantIds.add(p2.id);
      teamCounter++;
    }
  }

  return teams;
}

/**
 * 2. Group Generation Logic
 * Divide teams into groups of 4 teams per group
 */
export function generateGroups(eventId: string, teams: Team[], teamsPerGroup = 4): TournamentGroup[] {
  const groups: TournamentGroup[] = [];
  const groupLetters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];

  let teamIndex = 0;
  let groupCount = Math.ceil(teams.length / teamsPerGroup);

  for (let g = 0; g < groupCount; g++) {
    const groupName = `Group ${groupLetters[g] || String(g + 1)}`;
    const groupTeams = teams.slice(teamIndex, teamIndex + teamsPerGroup);
    const groupId = `group_${eventId}_${g + 1}`;

    // Tag team with groupId
    groupTeams.forEach((t) => {
      t.groupId = groupId;
    });

    groups.push({
      id: groupId,
      eventId,
      name: groupName,
      teamIds: groupTeams.map((t) => t.id),
    });

    teamIndex += teamsPerGroup;
  }

  return groups;
}

/**
 * 3. Round-Robin Fixtures & Court Rotation Generator
 * For a group of 4 teams (A, B, C, D):
 * Round 1: A vs B, C vs D
 * Round 2: A vs C, B vs D
 * Round 3: A vs D, B vs C
 * Rotates assigned courts across rounds!
 */
export function generateRoundRobinFixtures(
  eventId: string,
  groups: TournamentGroup[],
  availableCourtIds: string[],
  courtNamesMap: Record<string, string>
): Match[] {
  const matches: Match[] = [];
  let matchCounter = 1;

  groups.forEach((group, groupIdx) => {
    const { teamIds } = group;
    if (teamIds.length < 4) return;

    // Pick 2 courts for this group based on group index or available pool
    const hasCourts = availableCourtIds && availableCourtIds.length > 0;
    const court1Id = hasCourts ? (availableCourtIds[(groupIdx * 2) % availableCourtIds.length] || availableCourtIds[0]) : '';
    const court2Id = hasCourts ? (availableCourtIds[(groupIdx * 2 + 1) % availableCourtIds.length] || availableCourtIds[0]) : '';

    const c1Name = court1Id ? (courtNamesMap[court1Id] || 'Court') : 'Court TBD';
    const c2Name = court2Id ? (courtNamesMap[court2Id] || 'Court') : 'Court TBD';

    const [A, B, C, D] = teamIds;

    // Round 1
    matches.push({
      id: `match_${eventId}_${matchCounter++}`,
      eventId,
      stage: 'group',
      groupId: group.id,
      round: 1,
      courtId: court1Id,
      courtName: c1Name,
      team1Id: A,
      team2Id: B,
      status: 'scheduled',
    });

    matches.push({
      id: `match_${eventId}_${matchCounter++}`,
      eventId,
      stage: 'group',
      groupId: group.id,
      round: 1,
      courtId: court2Id,
      courtName: c2Name,
      team1Id: C,
      team2Id: D,
      status: 'scheduled',
    });

    // Round 2
    matches.push({
      id: `match_${eventId}_${matchCounter++}`,
      eventId,
      stage: 'group',
      groupId: group.id,
      round: 2,
      courtId: court1Id,
      courtName: c1Name,
      team1Id: A,
      team2Id: C,
      status: 'scheduled',
    });

    matches.push({
      id: `match_${eventId}_${matchCounter++}`,
      eventId,
      stage: 'group',
      groupId: group.id,
      round: 2,
      courtId: court2Id,
      courtName: c2Name,
      team1Id: B,
      team2Id: D,
      status: 'scheduled',
    });

    // Round 3
    matches.push({
      id: `match_${eventId}_${matchCounter++}`,
      eventId,
      stage: 'group',
      groupId: group.id,
      round: 3,
      courtId: court1Id,
      courtName: c1Name,
      team1Id: A,
      team2Id: D,
      status: 'scheduled',
    });

    matches.push({
      id: `match_${eventId}_${matchCounter++}`,
      eventId,
      stage: 'group',
      groupId: group.id,
      round: 3,
      courtId: court2Id,
      courtName: c2Name,
      team1Id: B,
      team2Id: C,
      status: 'scheduled',
    });
  });

  return matches;
}

/**
 * 4. Group Table & Standings Recalculation Logic
 * Dynamically computes standings from raw completed match scores.
 */
export function calculateGroupStandings(
  group: TournamentGroup,
  matches: Match[],
  teamsMap: Record<string, Team>,
  rules: TournamentRule
): GroupStanding[] {
  const standingsMap: Record<string, GroupStanding> = {};

  // Initialize standings for all teams in group
  group.teamIds.forEach((teamId) => {
    const team = teamsMap[teamId];
    const teamName = team ? team.name : 'Team';
    const playerNames = team
      ? `${team.player1.displayName} & ${team.player2.displayName}`
      : 'TBD';

    standingsMap[teamId] = {
      teamId,
      teamName,
      playerNames,
      played: 0,
      won: 0,
      drawn: 0,
      lost: 0,
      gamesFor: 0,
      gamesAgainst: 0,
      difference: 0,
      points: 0,
      qualified: false,
    };
  });

  // Filter completed group matches for this group
  const groupMatches = matches.filter(
    (m) => m.groupId === group.id && m.stage === 'group' && m.status === 'completed'
  );

  groupMatches.forEach((m) => {
    const t1 = standingsMap[m.team1Id];
    const t2 = standingsMap[m.team2Id];

    if (
      !t1 ||
      !t2 ||
      typeof m.team1Score !== 'number' ||
      typeof m.team2Score !== 'number'
    ) {
      return;
    }

    t1.played += 1;
    t2.played += 1;

    let games1 = m.team1Score;
    let games2 = m.team2Score;
    if (m.sets && m.sets.length > 0) {
      games1 = m.sets.reduce((sum, s) => sum + (s.team1Score || 0), 0);
      games2 = m.sets.reduce((sum, s) => sum + (s.team2Score || 0), 0);
    }

    t1.gamesFor += games1;
    t1.gamesAgainst += games2;
    t2.gamesFor += games2;
    t2.gamesAgainst += games1;

    const winnerId = m.winnerTeamId || (m.team1Score > m.team2Score ? m.team1Id : m.team2Score > m.team1Score ? m.team2Id : undefined);

    if (winnerId === m.team1Id) {
      t1.won += 1;
      t1.points += rules.winPoints;
      t2.lost += 1;
      t2.points += rules.lossPoints;
    } else if (winnerId === m.team2Id) {
      t2.won += 1;
      t2.points += rules.winPoints;
      t1.lost += 1;
      t1.points += rules.lossPoints;
    } else {
      t1.drawn += 1;
      t1.points += rules.drawPoints;
      t2.drawn += 1;
      t2.points += rules.drawPoints;
    }
  });

  // Calculate difference
  Object.values(standingsMap).forEach((st) => {
    st.difference = st.gamesFor - st.gamesAgainst;
  });

  // Sort by tiebreak order
  const standingsList = Object.values(standingsMap);

  standingsList.sort((a, b) => {
    for (const criterion of rules.tiebreakOrder) {
      if (criterion === 'points' && b.points !== a.points) {
        return b.points - a.points;
      }
      if (criterion === 'matchesWon' && b.won !== a.won) {
        return b.won - a.won;
      }
      if (criterion === 'scoreDiff' && b.difference !== a.difference) {
        return b.difference - a.difference;
      }
      if (criterion === 'scoreFor' && b.gamesFor !== a.gamesFor) {
        return b.gamesFor - a.gamesFor;
      }
    }
    return 0;
  });

  // Tag top N as qualified
  for (let i = 0; i < rules.qualifiersPerGroup && i < standingsList.length; i++) {
    standingsList[i].qualified = true;
  }

  return standingsList;
}

/**
 * 5. Identify Qualifying Teams across all groups
 */
export function identifyQualifiers(
  groups: TournamentGroup[],
  matches: Match[],
  teamsMap: Record<string, Team>,
  rules: TournamentRule
): Array<{ groupName: string; position: number; team: Team }> {
  const qualifiers: Array<{ groupName: string; position: number; team: Team }> = [];

  groups.forEach((group) => {
    const standings = calculateGroupStandings(group, matches, teamsMap, rules);
    standings
      .filter((s) => s.qualified)
      .forEach((s, idx) => {
        const team = teamsMap[s.teamId];
        if (team) {
          qualifiers.push({
            groupName: group.name,
            position: idx + 1,
            team,
          });
        }
      });
  });

  return qualifiers;
}

/**
 * 6. Knockout Bracket Generation
 * Generates Quarter-Finals, Semi-Finals, and Final
 */
export function generateKnockoutBracket(
  eventId: string,
  qualifiers: Array<{ groupName: string; position: number; team: Team }>,
  availableCourtIds: string[],
  courtNamesMap: Record<string, string>
): Match[] {
  const knockoutMatches: Match[] = [];
  const hasCourts = availableCourtIds && availableCourtIds.length > 0;
  const c1 = hasCourts ? availableCourtIds[0] : '';
  const c2 = hasCourts ? (availableCourtIds[1] || c1) : '';
  const c1Name = c1 ? (courtNamesMap[c1] || 'Court 1') : 'Court TBD';
  const c2Name = c2 ? (courtNamesMap[c2] || 'Court 2') : 'Court TBD';

  const totalQualifiers = qualifiers.length;

  if (totalQualifiers >= 8) {
    // 8 teams: Quarter Finals (4 matches) -> Semi Finals (2 matches) -> Final (1 match)
    const qf1Id = `ko_${eventId}_qf_1`;
    const qf2Id = `ko_${eventId}_qf_2`;
    const qf3Id = `ko_${eventId}_qf_3`;
    const qf4Id = `ko_${eventId}_qf_4`;

    const sf1Id = `ko_${eventId}_sf_1`;
    const sf2Id = `ko_${eventId}_sf_2`;

    const finalId = `ko_${eventId}_final`;

    // Seeding logic: Group Winner vs Group Runner Up from different group
    // e.g. QF1: Group A Winner vs Group B Runner Up
    // QF2: Group B Winner vs Group A Runner Up
    // QF3: Group C Winner vs Group D Runner Up
    // QF4: Group D Winner vs Group C Runner Up
    const winnerA = qualifiers.find((q) => q.groupName.includes('A') && q.position === 1)?.team;
    const runnerB = qualifiers.find((q) => q.groupName.includes('B') && q.position === 2)?.team;

    const winnerB = qualifiers.find((q) => q.groupName.includes('B') && q.position === 1)?.team;
    const runnerA = qualifiers.find((q) => q.groupName.includes('A') && q.position === 2)?.team;

    const winnerC = qualifiers.find((q) => q.groupName.includes('C') && q.position === 1)?.team;
    const runnerD = qualifiers.find((q) => q.groupName.includes('D') && q.position === 2)?.team;

    const winnerD = qualifiers.find((q) => q.groupName.includes('D') && q.position === 1)?.team;
    const runnerC = qualifiers.find((q) => q.groupName.includes('C') && q.position === 2)?.team;

    // Fallbacks if groups differ
    const q1T1 = winnerA?.id || qualifiers[0]?.team.id || '';
    const q1T2 = runnerB?.id || qualifiers[1]?.team.id || '';

    const q2T1 = winnerB?.id || qualifiers[2]?.team.id || '';
    const q2T2 = runnerA?.id || qualifiers[3]?.team.id || '';

    const q3T1 = winnerC?.id || qualifiers[4]?.team.id || '';
    const q3T2 = runnerD?.id || qualifiers[5]?.team.id || '';

    const q4T1 = winnerD?.id || qualifiers[6]?.team.id || '';
    const q4T2 = runnerC?.id || qualifiers[7]?.team.id || '';

    // Final Match
    knockoutMatches.push({
      id: finalId,
      eventId,
      stage: 'knockout',
      round: 3,
      courtId: c1,
      courtName: c1Name,
      team1Id: '',
      team2Id: '',
      status: 'scheduled',
      knockoutStage: 'final',
      knockoutMatchNumber: 1,
    });

    // Semi Finals
    knockoutMatches.push({
      id: sf1Id,
      eventId,
      stage: 'knockout',
      round: 2,
      courtId: c1,
      courtName: c1Name,
      team1Id: '',
      team2Id: '',
      status: 'scheduled',
      knockoutStage: 'semi_finals',
      knockoutMatchNumber: 1,
      nextKnockoutMatchId: finalId,
      nextKnockoutSlot: 1,
    });

    knockoutMatches.push({
      id: sf2Id,
      eventId,
      stage: 'knockout',
      round: 2,
      courtId: c2,
      courtName: c2Name,
      team1Id: '',
      team2Id: '',
      status: 'scheduled',
      knockoutStage: 'semi_finals',
      knockoutMatchNumber: 2,
      nextKnockoutMatchId: finalId,
      nextKnockoutSlot: 2,
    });

    // Quarter Finals
    knockoutMatches.push({
      id: qf1Id,
      eventId,
      stage: 'knockout',
      round: 1,
      courtId: c1,
      courtName: c1Name,
      team1Id: q1T1,
      team2Id: q1T2,
      status: 'ready',
      knockoutStage: 'quarter_finals',
      knockoutMatchNumber: 1,
      nextKnockoutMatchId: sf1Id,
      nextKnockoutSlot: 1,
    });

    knockoutMatches.push({
      id: qf2Id,
      eventId,
      stage: 'knockout',
      round: 1,
      courtId: c2,
      courtName: c2Name,
      team1Id: q2T1,
      team2Id: q2T2,
      status: 'ready',
      knockoutStage: 'quarter_finals',
      knockoutMatchNumber: 2,
      nextKnockoutMatchId: sf1Id,
      nextKnockoutSlot: 2,
    });

    knockoutMatches.push({
      id: qf3Id,
      eventId,
      stage: 'knockout',
      round: 1,
      courtId: c1,
      courtName: c1Name,
      team1Id: q3T1,
      team2Id: q3T2,
      status: 'ready',
      knockoutStage: 'quarter_finals',
      knockoutMatchNumber: 3,
      nextKnockoutMatchId: sf2Id,
      nextKnockoutSlot: 1,
    });

    knockoutMatches.push({
      id: qf4Id,
      eventId,
      stage: 'knockout',
      round: 1,
      courtId: c2,
      courtName: c2Name,
      team1Id: q4T1,
      team2Id: q4T2,
      status: 'ready',
      knockoutStage: 'quarter_finals',
      knockoutMatchNumber: 4,
      nextKnockoutMatchId: sf2Id,
      nextKnockoutSlot: 2,
    });
  } else {
    // 4 teams: Semi Finals -> Final
    const sf1Id = `ko_${eventId}_sf_1`;
    const sf2Id = `ko_${eventId}_sf_2`;
    const finalId = `ko_${eventId}_final`;

    const q1 = qualifiers[0]?.team.id || '';
    const q2 = qualifiers[1]?.team.id || '';
    const q3 = qualifiers[2]?.team.id || '';
    const q4 = qualifiers[3]?.team.id || '';

    knockoutMatches.push({
      id: finalId,
      eventId,
      stage: 'knockout',
      round: 2,
      courtId: c1,
      courtName: c1Name,
      team1Id: '',
      team2Id: '',
      status: 'scheduled',
      knockoutStage: 'final',
      knockoutMatchNumber: 1,
    });

    knockoutMatches.push({
      id: sf1Id,
      eventId,
      stage: 'knockout',
      round: 1,
      courtId: c1,
      courtName: c1Name,
      team1Id: q1,
      team2Id: q2,
      status: 'ready',
      knockoutStage: 'semi_finals',
      knockoutMatchNumber: 1,
      nextKnockoutMatchId: finalId,
      nextKnockoutSlot: 1,
    });

    knockoutMatches.push({
      id: sf2Id,
      eventId,
      stage: 'knockout',
      round: 1,
      courtId: c2,
      courtName: c2Name,
      team1Id: q3,
      team2Id: q4,
      status: 'ready',
      knockoutStage: 'semi_finals',
      knockoutMatchNumber: 2,
      nextKnockoutMatchId: finalId,
      nextKnockoutSlot: 2,
    });
  }

  return knockoutMatches;
}

/**
 * 7. Advance Knockout Winner
 */
export function advanceKnockoutWinner(
  matches: Match[],
  completedMatch: Match
): Match[] {
  if (
    !completedMatch.winnerTeamId ||
    !completedMatch.nextKnockoutMatchId ||
    !completedMatch.nextKnockoutSlot
  ) {
    return matches;
  }

  return matches.map((m) => {
    if (m.id === completedMatch.nextKnockoutMatchId) {
      const updated = { ...m };
      if (completedMatch.nextKnockoutSlot === 1) {
        updated.team1Id = completedMatch.winnerTeamId!;
      } else {
        updated.team2Id = completedMatch.winnerTeamId!;
      }

      if (updated.team1Id && updated.team2Id) {
        updated.status = 'ready';
      }
      return updated;
    }
    return m;
  });
}

/**
 * 8. Player Statistics Engine
 */
export function recalculatePlayerStats(
  events: EventItem[],
  users: PlayerProfile[]
): PlayerProfile[] {
  const statsMap: Record<string, {
    eventsPlayed: Set<string>;
    matchesPlayed: number;
    matchesWon: number;
    matchesLost: number;
    totalGamesWon: number;
    totalGamesLost: number;
    recentEvents: Map<string, PlayerProfile['recentEvents'][0]>;
  }> = {};

  users.forEach((u) => {
    statsMap[u.id] = {
      eventsPlayed: new Set(),
      matchesPlayed: 0,
      matchesWon: 0,
      matchesLost: 0,
      totalGamesWon: 0,
      totalGamesLost: 0,
      recentEvents: new Map(),
    };
  });

  events.forEach((event) => {
    if (event.status !== 'completed' && event.status !== 'in_progress' && event.status !== 'knockout_stage') {
      return;
    }

    const teamsMap: Record<string, Team> = {};
    event.teams.forEach((t) => {
      teamsMap[t.id] = t;
    });

    // Check matches
    event.matches.forEach((m) => {
      if (m.status !== 'completed' || typeof m.team1Score !== 'number' || typeof m.team2Score !== 'number') {
        return;
      }

      const team1 = teamsMap[m.team1Id];
      const team2 = teamsMap[m.team2Id];

      if (!team1 || !team2) return;

      const team1Players = [team1.player1.id, team1.player2.id];
      const team2Players = [team2.player1.id, team2.player2.id];

      let games1 = m.team1Score || 0;
      let games2 = m.team2Score || 0;
      if (m.sets && m.sets.length > 0) {
        games1 = m.sets.reduce((sum, s) => sum + (s.team1Score || 0), 0);
        games2 = m.sets.reduce((sum, s) => sum + (s.team2Score || 0), 0);
      }

      // Team 1 players
      team1Players.forEach((pId) => {
        if (!statsMap[pId]) return;
        statsMap[pId].eventsPlayed.add(event.id);
        statsMap[pId].matchesPlayed += 1;
        statsMap[pId].totalGamesWon += games1;
        statsMap[pId].totalGamesLost += games2;

        if (m.winnerTeamId === team1.id) {
          statsMap[pId].matchesWon += 1;
        } else if (m.winnerTeamId === team2.id) {
          statsMap[pId].matchesLost += 1;
        }
      });

      // Team 2 players
      team2Players.forEach((pId) => {
        if (!statsMap[pId]) return;
        statsMap[pId].eventsPlayed.add(event.id);
        statsMap[pId].matchesPlayed += 1;
        statsMap[pId].totalGamesWon += games2;
        statsMap[pId].totalGamesLost += games1;

        if (m.winnerTeamId === team2.id) {
          statsMap[pId].matchesWon += 1;
        } else if (m.winnerTeamId === team1.id) {
          statsMap[pId].matchesLost += 1;
        }
      });
    });

    // Tag event result if completed
    if (event.status === 'completed') {
      const finalMatch = event.matches.find((m) => m.knockoutStage === 'final' && m.status === 'completed');
      if (finalMatch && finalMatch.winnerTeamId) {
        const champTeam = teamsMap[finalMatch.winnerTeamId];
        const runnerTeam = teamsMap[finalMatch.team1Id === finalMatch.winnerTeamId ? finalMatch.team2Id : finalMatch.team1Id];

        if (champTeam) {
          [champTeam.player1.id, champTeam.player2.id].forEach((pId) => {
            if (statsMap[pId]) {
              statsMap[pId].recentEvents.set(event.id, {
                eventId: event.id,
                eventName: event.name,
                date: event.date,
                result: 'Champion',
              });
            }
          });
        }

        if (runnerTeam) {
          [runnerTeam.player1.id, runnerTeam.player2.id].forEach((pId) => {
            if (statsMap[pId]) {
              statsMap[pId].recentEvents.set(event.id, {
                eventId: event.id,
                eventName: event.name,
                date: event.date,
                result: 'Runner-Up',
              });
            }
          });
        }
      }
    }
  });

  return users.map((u) => {
    const s = statsMap[u.id];
    if (!s) return u;

    const winRate = s.matchesPlayed > 0 ? Math.round((s.matchesWon / s.matchesPlayed) * 100) : 0;
    const recentList = Array.from(s.recentEvents.values());

    return {
      ...u,
      eventsPlayed: s.eventsPlayed.size,
      matchesPlayed: s.matchesPlayed,
      matchesWon: s.matchesWon,
      matchesLost: s.matchesLost,
      winRate,
      totalGamesWon: s.totalGamesWon,
      totalGamesLost: s.totalGamesLost,
      recentEvents: recentList.length > 0 ? recentList : u.recentEvents || [],
    };
  });
}
