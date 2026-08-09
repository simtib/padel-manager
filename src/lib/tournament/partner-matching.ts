import { PartnerRequest } from '../../types';

export function createPartnerRequest(
  eventId: string,
  fromUserId: string,
  fromUserName: string,
  toUserId: string,
  toUserName: string
): PartnerRequest {
  return {
    id: `req_${eventId}_${Date.now()}`,
    eventId,
    fromUserId,
    fromUserName,
    toUserId,
    toUserName,
    status: 'pending',
    createdAt: new Date().toISOString(),
  };
}

export function validatePartnerRequest(
  existingRequests: PartnerRequest[],
  fromUserId: string,
  toUserId: string
): { valid: boolean; reason?: string } {
  if (fromUserId === toUserId) {
    return { valid: false, reason: 'Cannot select yourself as a preferred partner' };
  }

  const existing = existingRequests.find(
    (r) =>
      (r.fromUserId === fromUserId && r.toUserId === toUserId) ||
      (r.fromUserId === toUserId && r.toUserId === fromUserId)
  );

  if (existing) {
    if (existing.status === 'accepted') {
      return { valid: false, reason: 'Already partner with this player' };
    }
    if (existing.status === 'pending') {
      return { valid: false, reason: 'Partner request already pending' };
    }
  }

  return { valid: true };
}
