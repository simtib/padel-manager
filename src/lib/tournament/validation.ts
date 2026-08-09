import { EventItem, Match } from '../../types';

export function validateScoreEntry(
  match: Match,
  team1Score: number,
  team2Score: number
): { valid: boolean; reason?: string } {
  if (isNaN(team1Score) || isNaN(team2Score)) {
    return { valid: false, reason: 'Scores must be valid numbers' };
  }

  if (team1Score < 0 || team2Score < 0) {
    return { valid: false, reason: 'Scores cannot be negative' };
  }

  if (team1Score === team2Score) {
    return { valid: false, reason: 'Padel matches cannot end in a draw' };
  }

  return { valid: true };
}

export function validateEventPermissions(
  event: EventItem,
  userId: string
): { isOwner: boolean; isAdmin: boolean; canManage: boolean } {
  const isOwner = event.ownerId === userId;
  const isAdmin = (event.coAdminIds || []).includes(userId);
  const canManage = isOwner || isAdmin;

  return { isOwner, isAdmin, canManage };
}

export function promoteWaitingListParticipant<T extends { status: string; waitingListPosition?: number }>(
  participants: T[]
): T[] {
  const confirmedCount = participants.filter((p) => p.status === 'confirmed').length;
  const waitingList = participants
    .filter((p) => p.status === 'waiting_list')
    .sort((a, b) => (a.waitingListPosition || 0) - (b.waitingListPosition || 0));

  if (waitingList.length === 0) {
    return participants;
  }

  const promotedId = waitingList[0];

  return participants.map((p) => {
    if (p === promotedId) {
      return {
        ...p,
        status: 'confirmed',
        waitingListPosition: undefined,
      };
    }
    return p;
  });
}
