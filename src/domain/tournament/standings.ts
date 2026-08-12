import {
  Participant, PartnerRequest, Team, TournamentGroup, Match,
  TournamentRule, GroupStanding, User, PlayerProfile, EventItem
} from '../../types';

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

  // A three-group tournament produces six automatic qualifiers (the top two
  // in each group). Fill an eight-team quarter-final bracket with the two best
  // third-place teams, ranked by the tournament's configured tie-break order.
  const remainingQuarterFinalSpots = Math.max(0, 8 - qualifiers.length);
  if (groups.length >= 3 && remainingQuarterFinalSpots > 0) {
    const thirdPlacedTeams = groups.flatMap((group) => {
      const standing = calculateGroupStandings(group, matches, teamsMap, rules)[2];
      const team = standing ? teamsMap[standing.teamId] : undefined;
      return standing && team ? [{ groupName: group.name, standing, team }] : [];
    });

    thirdPlacedTeams.sort((a, b) => {
      for (const criterion of rules.tiebreakOrder) {
        if (criterion === 'points' && b.standing.points !== a.standing.points) return b.standing.points - a.standing.points;
        if (criterion === 'matchesWon' && b.standing.won !== a.standing.won) return b.standing.won - a.standing.won;
        if (criterion === 'scoreDiff' && b.standing.difference !== a.standing.difference) return b.standing.difference - a.standing.difference;
        if (criterion === 'scoreFor' && b.standing.gamesFor !== a.standing.gamesFor) return b.standing.gamesFor - a.standing.gamesFor;
      }
      return a.groupName.localeCompare(b.groupName);
    });

    thirdPlacedTeams.slice(0, remainingQuarterFinalSpots).forEach(({ groupName, team }) => {
      qualifiers.push({ groupName, position: 3, team });
    });
  }

  return qualifiers;
}

/**
 * 6. Knockout Bracket Generation
 * Generates Quarter-Finals, Semi-Finals, and Final
 */
