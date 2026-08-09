import { Participant, PartnerRequest, Team } from '../../types';

export function generateTeamsFromParticipants(
  eventId: string,
  participants: Participant[],
  partnerRequests: PartnerRequest[],
  existingTeamsMap: Record<string, Team> = {}
): Team[] {
  const confirmedParticipants = participants.filter((p) => p.status === 'confirmed');
  const usedParticipantIds = new Set<string>();
  const teams: Team[] = [];

  // Keep existing locked teams
  Object.values(existingTeamsMap).forEach((team) => {
    if (team.locked) {
      teams.push(team);
      usedParticipantIds.add(team.player1.id);
      usedParticipantIds.add(team.player2.id);
    }
  });

  const availableParticipants = confirmedParticipants.filter(
    (p) => !usedParticipantIds.has(p.id)
  );

  // Priority 1: Mutual accepted partner requests
  const acceptedRequests = partnerRequests.filter(
    (r) => r.eventId === eventId && r.status === 'accepted'
  );

  let teamCounter = teams.length + 1;

  for (const req of acceptedRequests) {
    if (usedParticipantIds.has(req.fromUserId) || usedParticipantIds.has(req.toUserId)) {
      continue;
    }

    const p1 = availableParticipants.find((p) => p.id === req.fromUserId);
    const p2 = availableParticipants.find((p) => p.id === req.toUserId);

    if (p1 && p2) {
      teams.push({
        id: `team_${eventId}_${Date.now()}_${teamCounter}`,
        eventId,
        name: `Team ${String(teamCounter).padStart(2, '0')}`,
        player1: { id: p1.id, displayName: p1.displayName, isGuest: p1.isGuest },
        player2: { id: p2.id, displayName: p2.displayName, isGuest: p2.isGuest },
        locked: false,
      });

      usedParticipantIds.add(p1.id);
      usedParticipantIds.add(p2.id);
      teamCounter++;
    }
  }

  // Also pair preferred partner selections
  const remaining = availableParticipants.filter((p) => !usedParticipantIds.has(p.id));

  for (let i = 0; i < remaining.length; i++) {
    const p1 = remaining[i];
    if (usedParticipantIds.has(p1.id) || !p1.preferredPartnerId) continue;

    const p2 = remaining.find(
      (p) => p.id === p1.preferredPartnerId && !usedParticipantIds.has(p.id)
    );

    if (p2 && p2.id !== p1.id) {
      teams.push({
        id: `team_${eventId}_${Date.now()}_${teamCounter}`,
        eventId,
        name: `Team ${String(teamCounter).padStart(2, '0')}`,
        player1: { id: p1.id, displayName: p1.displayName, isGuest: p1.isGuest },
        player2: { id: p2.id, displayName: p2.displayName, isGuest: p2.isGuest },
        locked: false,
      });

      usedParticipantIds.add(p1.id);
      usedParticipantIds.add(p2.id);
      teamCounter++;
    }
  }

  // Priority 2: Auto-pair remaining players
  const stillUnpaired = confirmedParticipants.filter((p) => !usedParticipantIds.has(p.id));

  for (let i = 0; i < stillUnpaired.length; i += 2) {
    const p1 = stillUnpaired[i];
    const p2 = stillUnpaired[i + 1];

    if (p1 && p2) {
      teams.push({
        id: `team_${eventId}_${Date.now()}_${teamCounter}`,
        eventId,
        name: `Team ${String(teamCounter).padStart(2, '0')}`,
        player1: { id: p1.id, displayName: p1.displayName, isGuest: p1.isGuest },
        player2: { id: p2.id, displayName: p2.displayName, isGuest: p2.isGuest },
        locked: false,
      });
      usedParticipantIds.add(p1.id);
      usedParticipantIds.add(p2.id);
      teamCounter++;
    }
  }

  return teams;
}
