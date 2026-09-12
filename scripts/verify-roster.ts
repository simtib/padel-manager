import assert from 'node:assert/strict';
import { reconcileRoster } from '../src/context/eventRoster';
import type { Participant } from '../src/types';

const participant = (id: string, extra: Partial<Participant> = {}): Participant => ({
  id, displayName: id, isGuest: false, registeredAt: '2026-09-12T00:00:00Z',
  status: 'confirmed', ...extra,
});
const real = participant('11111111-1111-4111-8111-111111111111');
const dummy = participant('usr_simone', { preferredPartnerId: 'usr_marco' });
const guest = participant('gst_123', { isGuest: true });
const waiting = participant('usr_marco', { status: 'waiting_list', waitingListPosition: 1 });

// Simulate adding players between repeated empty server refreshes.
let roster: Participant[] = [];
for (const player of [dummy, guest, waiting]) {
  roster = reconcileRoster([], [...roster, player]);
}
for (let i = 0; i < 5; i++) roster = reconcileRoster([], roster);
assert.deepEqual(roster, [dummy, guest, waiting]);

// Server identity/status changes win; cached partner selections survive.
roster = reconcileRoster([real], [...roster, { ...real, preferredPartnerId: dummy.id }]);
assert.equal(roster.length, 4);
assert.equal(roster[0].preferredPartnerId, dummy.id);
roster = reconcileRoster([{ ...real, displayName: 'Updated', status: 'waiting_list' }], roster);
assert.equal(roster[0].displayName, 'Updated');
assert.equal(roster[0].status, 'waiting_list');
assert.equal(roster.length, 4);

// A server removal must not resurrect real users; local removals also stay removed.
roster = reconcileRoster([], roster);
assert.deepEqual(roster, [dummy, guest, waiting]);
roster = reconcileRoster([], roster.filter((player) => player.id !== dummy.id));
assert.deepEqual(roster, [guest, waiting]);
console.log('PASS: repeated refreshes preserve demo/guest rosters, updates, partners, and removals.');
