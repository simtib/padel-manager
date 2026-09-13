import type { EventItem, PlayerProfile } from '../types';
export const upgradeMessages = {
  organize: 'Free lets you organize 1 active match. Complete or cancel your current match, or upgrade to Pro.',
  join: 'Free lets you join 3 upcoming matches. Leave a match or upgrade to Pro.',
  guest: 'Upgrade to Pro to add guest players.',
  waitlist: 'Free lets you join 1 waiting list. Leave a waiting list or upgrade to Pro.',
};
export const activeMatch = (event: EventItem) => !['completed', 'cancelled'].includes(event.status);
export const upcomingMatch = (event: EventItem) => activeMatch(event) && new Date(`${event.date}T${event.startTime}+04:00`).getTime() >= Date.now();
export function organizeRestriction(user: PlayerProfile, events: EventItem[]) {
  return user.plan !== 'pro' && events.some((event) => event.ownerId === user.id && activeMatch(event)) ? upgradeMessages.organize : '';
}
export function joinRestriction(user: PlayerProfile, events: EventItem[], event: EventItem) {
  if (user.plan === 'pro' || event.participants.some((player) => player.id === user.id)) return '';
  if (event.participants.filter((player) => player.status === 'confirmed').length >= event.maxPlayers) {
    const activeWaitlists = events.filter((item) => activeMatch(item) && item.participants.some((player) => player.id === user.id && player.status === 'waiting_list')).length;
    if (activeWaitlists >= 1) return upgradeMessages.waitlist;
  }
  return event.ownerId !== user.id && upcomingMatch(event) && events.filter((item) => item.ownerId !== user.id && upcomingMatch(item) && item.participants.some((player) => player.id === user.id)).length >= 3 ? upgradeMessages.join : '';
}
