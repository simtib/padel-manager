let notificationSequence = 0;

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const isValidUuid = (id: unknown): id is string =>
  typeof id === 'string' && UUID_RE.test(id);

export const createNotificationId = (prefix = 'notif') => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `${prefix}_${crypto.randomUUID()}`;
  }
  notificationSequence += 1;
  return `${prefix}_${Date.now()}_${notificationSequence}`;
};
