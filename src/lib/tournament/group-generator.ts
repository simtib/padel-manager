import { Team, TournamentGroup } from '../../types';

export function generateGroups(eventId: string, teams: Team[], teamsPerGroup = 4): TournamentGroup[] {
  const groups: TournamentGroup[] = [];
  const groupLetters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];

  let teamIndex = 0;
  const groupCount = Math.ceil(teams.length / teamsPerGroup);

  for (let g = 0; g < groupCount; g++) {
    const groupName = `Group ${groupLetters[g] || String(g + 1)}`;
    const groupTeams = teams.slice(teamIndex, teamIndex + teamsPerGroup);
    const groupId = `group_${eventId}_${g + 1}`;

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
