import { Match, Team, TournamentGroup, TournamentRule } from '../../types';
import { calculateGroupStandings } from './standings';

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
