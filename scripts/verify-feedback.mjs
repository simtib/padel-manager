// Local-only authorization regression checks; no Cloud credentials are used.
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { createClient } from '@supabase/supabase-js';
import { getLocalEnvironment } from './supabase-local.mjs';

const env = getLocalEnvironment();
const options = { auth: { persistSession: false, autoRefreshToken: false } };
const service = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, options);
const client = () => createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, options);
const checked = ({ data, error }) => { if (error) throw error; return data; };
const accounts = [];
try {
  for (const role of ['player', 'admin']) {
    const email = `feedback-${role}-${randomUUID()}@example.test`;
    const password = `Local-${randomUUID()}!`;
    const { user } = checked(await service.auth.admin.createUser({ email, password, email_confirm: true,
      user_metadata: { first_name: 'Feedback', last_name: role, display_name: `Feedback ${role}`, is_admin: true },
    }));
    const account = { id: user.id, api: client() };
    accounts.push(account);
    checked(await account.api.auth.signInWithPassword({ email, password }));
  }
  const [player, admin] = accounts;
  assert.equal(checked(await player.api.rpc('is_app_admin')), false, 'User metadata must not grant admin.');
  assert.ok((await player.api.from('profiles').update({ role: 'admin' }).eq('id', player.id)).error, 'Self-promotion must fail.');
  checked(await service.from('profiles').update({ role: 'admin' }).eq('id', admin.id));
  assert.equal(checked(await admin.api.rpc('is_app_admin')), true);
  assert.equal(checked(await player.api.from('profiles').select('id').eq('id', admin.id)).length, 0);

  const payload = { user_id: player.id, type: 'suggestion', title: 'Synthetic feedback test', description: 'Test only', status: 'new' };
  const submitted = checked(await player.api.from('feedback').insert(payload).select('*').single());
  const adminItem = checked(await admin.api.from('feedback').insert({ ...payload, user_id: admin.id }).select('*').single());
  assert.equal(checked(await player.api.from('feedback').select('id').eq('id', adminItem.id)).length, 0, 'Players must not see other users feedback.');
  assert.ok((await player.api.from('feedback').insert({ ...payload, user_id: admin.id })).error);
  assert.ok((await player.api.from('feedback').insert({ ...payload, status: 'done' })).error, 'New feedback cannot forge a moderation status.');
  await player.api.from('feedback').update({ status: 'done' }).eq('id', submitted.id);
  assert.equal(checked(await player.api.from('feedback').select('status').eq('id', submitted.id).single()).status, 'new');
  assert.equal(checked(await admin.api.from('feedback').select('id').in('id', [submitted.id, adminItem.id])).length, 2);
  checked(await admin.api.from('feedback').update({ status: 'reviewing' }).eq('id', submitted.id).select('id').single());
  assert.equal(checked(await player.api.from('feedback').select('status').eq('id', submitted.id).single()).status, 'reviewing');
  assert.ok((await admin.api.from('feedback').update({ description: 'Overwrite' }).eq('id', submitted.id)).error, 'Admins may change status, not submission content.');
  checked(await service.from('profiles').update({ role: 'user' }).eq('id', admin.id));
  assert.equal(checked(await admin.api.rpc('is_app_admin')), false);
  assert.equal(checked(await admin.api.from('feedback').select('id').eq('id', submitted.id)).length, 0);
  const anonymous = client();
  const publicRead = await anonymous.from('feedback').select('id');
  assert.ok(publicRead.error || publicRead.data.length === 0);
  console.log('PASS: feedback ownership, admin assignment/revocation, cross-user moderation, immutable author content, and rejected self-promotion/status forgery.');
} finally {
  for (const account of accounts) checked(await service.auth.admin.deleteUser(account.id));
}
