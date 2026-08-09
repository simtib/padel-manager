import { EventItem, PlayerProfile, Team } from '../../types';

export function recalculatePlayerStats(events: EventItem[], users: PlayerProfile[]): PlayerProfile[] {
  const statsMap: Record<
    string,
    {
      eventsPlayed: Set<string>;
      matchesPlayed: number;
      matchesWon: number;
      matchesLost: number;
      totalGamesWon: number;
      totalGamesLost: number;
      recentEvents: Map<string, PlayerProfile['recentEvents'][0]>;
    }
  > = {};

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
    if (
      event.status !== 'completed' &&
      event.status !== 'in_progress' &&
      event.status !== 'knockout_stage'
    ) {
      return;
    }

    const teamsMap: Record<string, Team> = {};
    event.teams.forEach((t) => {
      teamsMap[t.id] = t;
    });

    event.matches.forEach((m) => {
      if (
        m.status !== 'completed' ||
        typeof m.team1Score !== 'number' ||
        typeof m.team2Score !== 'number'
      ) {
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

    if (event.status === 'completed') {
      const finalMatch = event.matches.find(
        (m) => m.knockoutStage === 'final' && m.status === 'completed'
      );
      if (finalMatch && finalMatch.winnerTeamId) {
        const champTeam = teamsMap[finalMatch.winnerTeamId];
        const runnerTeam =
          teamsMap[
            finalMatch.team1Id === finalMatch.winnerTeamId ? finalMatch.team2Id : finalMatch.team1Id
          ];

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
