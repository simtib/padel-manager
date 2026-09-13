const { test } = require('node:test');
const assert = require('node:assert/strict');
require('tsx/cjs');
const { ensureProfile } = require('../src/context/authProfile.ts');

function client(user, existing = null, insertError = null) {
  const inserted = [];
  return {
    inserted,
    auth: { getUser: async () => ({ data: { user }, error: null }) },
    from: () => ({
      select() { return this; },
      eq() { return this; },
      maybeSingle: async () => ({ data: existing, error: null }),
      insert: async (row) => { inserted.push(row); return { error: insertError }; },
    }),
  };
}

test('a deleted account cannot be recreated from a cached session', async () => {
  const db = client(null);
  await assert.rejects(ensureProfile(db, { id: 'deleted' }), /sign out and sign in again/);
  assert.equal(db.inserted.length, 0);
});

test('a different signed-in account cannot repair the cached account', async () => {
  const db = client({ id: 'other' });
  await assert.rejects(ensureProfile(db, { id: 'cached' }), /sign out and sign in again/);
  assert.equal(db.inserted.length, 0);
});

test('valid accounts still get missing profiles using verified metadata', async () => {
  const db = client({ id: 'valid', email: 'verified@example.com' });
  await ensureProfile(db, { id: 'valid', email: 'cached@example.com' });
  assert.equal(db.inserted.length, 1);
  assert.equal(db.inserted[0].email, 'verified@example.com');
});

test('existing profiles need no repair', async () => {
  const db = client(null, { id: 'valid' });
  await ensureProfile(db, { id: 'valid' });
  assert.equal(db.inserted.length, 0);
});

test('account deletion during repair produces an actionable error', async () => {
  const db = client({ id: 'valid' }, null, { code: '23503' });
  await assert.rejects(ensureProfile(db, { id: 'valid' }), /sign out and sign in again/);
});
