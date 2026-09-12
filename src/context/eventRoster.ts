import type { Participant } from '../types';
import { isValidUuid } from './contextHelpers';

export const reconcileRoster = (
  registrations: Participant[],
  cached: Participant[] = [],
): Participant[] => {
  const cachedById = new Map(cached.map((player) => [player.id, player]));
  const registeredIds = new Set(registrations.map((player) => player.id));
  return [
    ...registrations.map((player) => ({
      ...player,
      preferredPartnerId: cachedById.get(player.id)?.preferredPartnerId,
    })),
    // Demo players and local guests cannot be stored in UUID database columns.
    // Preserve them, while letting the server remove real registrations.
    ...cached.filter((player) => !isValidUuid(player.id) && !registeredIds.has(player.id)),
  ];
};
