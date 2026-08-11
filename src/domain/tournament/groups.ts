import {
  Participant, PartnerRequest, Team, TournamentGroup, Match,
  TournamentRule, GroupStanding, User, PlayerProfile, EventItem
} from '../../types';

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
