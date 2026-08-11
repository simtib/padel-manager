import {
  Participant, PartnerRequest, Team, TournamentGroup, Match,
  TournamentRule, GroupStanding, User, PlayerProfile, EventItem
} from '../../types';

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
