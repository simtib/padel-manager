import { generateTeamsFromParticipants } from '../team-generator';
import { generateGroups } from '../group-generator';
import { generateRoundRobinFixtures } from '../round-robin';
import { calculateGroupStandings } from '../standings';
import { advanceKnockoutWinner } from '../knockout';
import { promoteWaitingListParticipant } from '../validation';
import { Participant, PartnerRequest, Team, TournamentGroup, Match, TournamentRule } from '../../../types';

export function runTournamentEngineTests() {
  const results: { test: string; passed: boolean; error?: string }[] = [];

  function assert(condition: boolean, testName: string) {
    if (condition) {
      results.push({ test: testName, passed: true });
    } else {
      results.push({ test: testName, passed: false, error: 'Assertion failed' });
    }
  }

  // Test 1: Team Generation
  try {
    const mockParticipants: Participant[] = [
      { id: 'p1', displayName: 'Player 1', isGuest: false, registeredAt: '', status: 'confirmed' },
      { id: 'p2', displayName: 'Player 2', isGuest: false, registeredAt: '', status: 'confirmed' },
      { id: 'p3', displayName: 'Player 3', isGuest: false, registeredAt: '', status: 'confirmed' },
      { id: 'p4', displayName: 'Player 4', isGuest: false, registeredAt: '', status: 'confirmed' },
    ];
    const mockPartnerRequests: PartnerRequest[] = [
      {
        id: 'r1',
        eventId: 'e1',
        fromUserId: 'p1',
        fromUserName: 'Player 1',
        toUserId: 'p2',
        toUserName: 'Player 2',
        status: 'accepted',
        createdAt: '',
      },
    ];

    const teams = generateTeamsFromParticipants('e1', mockParticipants, mockPartnerRequests);
    assert(teams.length === 2, 'Team generation creates 2 teams from 4 players');
    assert(
      (teams[0].player1.id === 'p1' && teams[0].player2.id === 'p2') ||
      (teams[0].player1.id === 'p2' && teams[0].player2.id === 'p1'),
      'Accepted partners p1 and p2 stay together'
    );
  } catch (err: any) {
    results.push({ test: 'Team Generation', passed: false, error: err.message });
  }

  // Test 2: Round Robin Fixtures
  try {
    const mockTeams: Team[] = [
      { id: 't1', eventId: 'e1', name: 'Team 1', player1: { id: '1', displayName: 'P1', isGuest: false }, player2: { id: '2', displayName: 'P2', isGuest: false }, locked: false },
      { id: 't2', eventId: 'e1', name: 'Team 2', player1: { id: '3', displayName: 'P3', isGuest: false }, player2: { id: '4', displayName: 'P4', isGuest: false }, locked: false },
      { id: 't3', eventId: 'e1', name: 'Team 3', player1: { id: '5', displayName: 'P5', isGuest: false }, player2: { id: '6', displayName: 'P6', isGuest: false }, locked: false },
      { id: 't4', eventId: 'e1', name: 'Team 4', player1: { id: '7', displayName: 'P7', isGuest: false }, player2: { id: '8', displayName: 'P8', isGuest: false }, locked: false },
    ];
    const groups = generateGroups('e1', mockTeams, 4);
    assert(groups.length === 1, 'Generate 1 group for 4 teams');

    const matches = generateRoundRobinFixtures('e1', groups, ['court1', 'court2'], { court1: 'Court 1', court2: 'Court 2' });
    assert(matches.length === 6, '4 teams generate exactly 6 round robin matches');
  } catch (err: any) {
    results.push({ test: 'Round Robin Fixtures', passed: false, error: err.message });
  }

  // Test 3: Standings Calculation
  try {
    const group: TournamentGroup = { id: 'g1', eventId: 'e1', name: 'Group A', teamIds: ['t1', 't2', 't3', 't4'] };
    const teamsMap: Record<string, Team> = {
      t1: { id: 't1', eventId: 'e1', name: 'Team 1', player1: { id: '1', displayName: 'P1', isGuest: false }, player2: { id: '2', displayName: 'P2', isGuest: false }, locked: false },
      t2: { id: 't2', eventId: 'e1', name: 'Team 2', player1: { id: '3', displayName: 'P3', isGuest: false }, player2: { id: '4', displayName: 'P4', isGuest: false }, locked: false },
      t3: { id: 't3', eventId: 'e1', name: 'Team 3', player1: { id: '5', displayName: 'P5', isGuest: false }, player2: { id: '6', displayName: 'P6', isGuest: false }, locked: false },
      t4: { id: 't4', eventId: 'e1', name: 'Team 4', player1: { id: '7', displayName: 'P7', isGuest: false }, player2: { id: '8', displayName: 'P8', isGuest: false }, locked: false },
    };
    const rules: TournamentRule = {
      winPoints: 3,
      drawPoints: 1,
      lossPoints: 0,
      tiebreakOrder: ['points', 'matchesWon', 'scoreDiff', 'scoreFor', 'headToHead'],
      qualifiersPerGroup: 2,
    };
    const completedMatches: Match[] = [
      { id: 'm1', eventId: 'e1', stage: 'group', groupId: 'g1', round: 1, courtId: 'c1', courtName: 'Court 1', team1Id: 't1', team2Id: 't2', team1Score: 6, team2Score: 2, winnerTeamId: 't1', status: 'completed' },
      { id: 'm2', eventId: 'e1', stage: 'group', groupId: 'g1', round: 1, courtId: 'c2', courtName: 'Court 2', team1Id: 't3', team2Id: 't4', team1Score: 6, team2Score: 4, winnerTeamId: 't3', status: 'completed' },
    ];

    const standings = calculateGroupStandings(group, completedMatches, teamsMap, rules);
    assert(standings[0].teamId === 't1' && standings[0].points === 3, 'Top team has 3 points and won match');
    assert(standings[0].difference === 4, 'Score difference calculated correctly (6-2=4)');
  } catch (err: any) {
    results.push({ test: 'Standings Calculation', passed: false, error: err.message });
  }

  // Test 4: Knockout Progression
  try {
    const mockMatches: Match[] = [
      { id: 'sf1', eventId: 'e1', stage: 'knockout', round: 1, courtId: 'c1', courtName: 'Court 1', team1Id: 't1', team2Id: 't2', team1Score: 6, team2Score: 3, winnerTeamId: 't1', status: 'completed', nextKnockoutMatchId: 'final1', nextKnockoutSlot: 1 },
      { id: 'final1', eventId: 'e1', stage: 'knockout', round: 2, courtId: 'c1', courtName: 'Court 1', team1Id: '', team2Id: '', status: 'scheduled' },
    ];

    const updated = advanceKnockoutWinner(mockMatches, mockMatches[0]);
    const finalMatch = updated.find((m) => m.id === 'final1');
    assert(finalMatch?.team1Id === 't1', 'Winner t1 advanced to slot 1 of final');
  } catch (err: any) {
    results.push({ test: 'Knockout Progression', passed: false, error: err.message });
  }

  // Test 5: Waiting List Promotion
  try {
    const participants = [
      { id: 'p1', status: 'confirmed' },
      { id: 'p2', status: 'waiting_list', waitingListPosition: 1 },
      { id: 'p3', status: 'waiting_list', waitingListPosition: 2 },
    ];

    const promoted = promoteWaitingListParticipant(participants);
    assert(promoted.find((p) => p.id === 'p2')?.status === 'confirmed', 'p2 promoted to confirmed');
  } catch (err: any) {
    results.push({ test: 'Waiting List Promotion', passed: false, error: err.message });
  }

  return results;
}
