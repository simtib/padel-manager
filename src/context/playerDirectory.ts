import { SEED_PLAYERS } from '../data/seedData';
import type { PlayerProfile } from '../types';

// Restore missing demo players without overwriting saved statistics or identities.
export const withDemoPlayers = (players: PlayerProfile[]): PlayerProfile[] => {
  const ids = new Set(players.map((player) => player.id));
  return [...players, ...SEED_PLAYERS.filter((player) => !ids.has(player.id))];
};
