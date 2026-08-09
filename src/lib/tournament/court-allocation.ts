import { Match } from '../../types';

export function allocateCourtsToMatches(
  matches: Match[],
  courtIds: string[],
  courtNamesMap: Record<string, string>
): Match[] {
  if (!courtIds || courtIds.length === 0) return matches;

  return matches.map((m, index) => {
    const assignedCourtId = courtIds[index % courtIds.length];
    const assignedCourtName = courtNamesMap[assignedCourtId] || `Court ${index + 1}`;

    return {
      ...m,
      courtId: assignedCourtId,
      courtName: assignedCourtName,
    };
  });
}
