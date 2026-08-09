import { GroupStanding, Match, Team, TournamentGroup, TournamentRule } from '../../types';

export function calculateGroupStandings(
  group: TournamentGroup,
  matches: Match[],
  teamsMap: Record<string, Team>,
  rules: TournamentRule
): GroupStanding[] {
  const standingsMap: Record<string, GroupStanding> = {};

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

  const groupMatches = matches.filter(
    (m) => m.groupId === group.id && m.stage === 'group' && m.status === 'completed'
  );

  groupMatches.forEach((m) => {
    const t1 = standingsMap[m.team1Id];
    const t2 = standingsMap[m.team2Id];

    if (!t1 || !t2 || typeof m.team1Score !== 'number' || typeof m.team2Score !== 'number') {
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

    const winnerId =
      m.winnerTeamId ||
      (m.team1Score > m.team2Score ? m.team1Id : m.team2Score > m.team1Score ? m.team2Id : undefined);

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

  Object.values(standingsMap).forEach((st) => {
    st.difference = st.gamesFor - st.gamesAgainst;
  });

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

  for (let i = 0; i < rules.qualifiersPerGroup && i < standingsList.length; i++) {
    standingsList[i].qualified = true;
  }

  return standingsList;
}
