import {
  Participant, PartnerRequest, Team, TournamentGroup, Match,
  TournamentRule, GroupStanding, User, PlayerProfile, EventItem
} from '../../types';

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
