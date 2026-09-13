// Integration checks against the running local stack only. Test accounts are
// synthetic and removed afterwards. Start Next.js with npm run dev:local first.
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { createClient } from '@supabase/supabase-js';
import { getLocalEnvironment } from './supabase-local.mjs';

const env = getLocalEnvironment();
const appUrl = new URL(env.NEXT_PUBLIC_SITE_URL);
assert.ok(appUrl.protocol === 'http:' && ['localhost', '127.0.0.1'].includes(appUrl.hostname), 'Test app must be local.');
const url = env.NEXT_PUBLIC_SUPABASE_URL;
const key = env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
assert.ok(env.SUPABASE_SERVICE_ROLE_KEY, 'Local service key is required for test cleanup.');
const options = { auth: { persistSession: false, autoRefreshToken: false } };
const admin = createClient(url, env.SUPABASE_SERVICE_ROLE_KEY, options);
const users = [];
const checked = ({ data, error }) => { if (error) throw error; return data; };

async function emailLink(email, type) {
  for (let attempt = 0; attempt < 15; attempt++) {
    const inbox = await fetch('http://127.0.0.1:54324/api/v1/messages').then((r) => r.json());
    for (const message of inbox.messages || []) {
      if (!message.To?.some((recipient) => recipient.Address === email)) continue;
      const detail = await fetch(`http://127.0.0.1:54324/api/v1/message/${message.ID}`).then((r) => r.json());
      const href = detail.HTML?.match(/href="([^"]+token_hash[^"]+)"/)?.[1];
      if (!href) continue;
      const link = new URL(href.replaceAll('&amp;', '&'));
      if (link.searchParams.get('type') !== type) continue;
      assert.equal(link.origin, appUrl.origin);
      assert.equal(link.pathname, '/auth/confirm');
      return link.href;
    }
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
  throw new Error(`Expected local ${type} email was not captured.`);
}

try {
  const settings = await fetch(`${url}/auth/v1/settings`, { headers: { apikey: key } }).then((r) => r.json());
  assert.equal(settings.external.email, true);
  assert.equal(settings.mailer_autoconfirm, false);
  const cors = await fetch(`${url}/auth/v1/token?grant_type=password`, {
    method: 'OPTIONS', headers: {
      Origin: appUrl.origin,
      'Access-Control-Request-Method': 'POST',
      'Access-Control-Request-Headers': 'apikey,content-type',
    },
  });
  assert.ok(cors.ok);
  assert.ok(['*', appUrl.origin].includes(cors.headers.get('access-control-allow-origin')));
  const clients = [];
  for (const role of ['organizer', 'player']) {
    const email = `${role}-${randomUUID()}@example.test`;
    const password = `Local-${randomUUID()}!`;
    const client = createClient(url, key, options);
    const signup = checked(await client.auth.signUp({ email, password, options: {
      emailRedirectTo: `${appUrl.origin}/auth/confirm`,
      data: { first_name: 'Local', last_name: role, display_name: `Local ${role}` },
    } }));
    assert.ok(signup.user);
    users.push(signup.user.id);
    assert.equal(signup.session, null, 'Signup must require confirmation.');
    const response = await fetch(await emailLink(email, 'email'), { redirect: 'manual' });
    assert.equal(new URL(response.headers.get('location')).pathname, '/dashboard');
    assert.equal(new URL(response.headers.get('location')).origin, appUrl.origin);
    assert.ok(response.headers.get('set-cookie'), 'SSR confirmation must set session cookies.');
    checked(await client.auth.signInWithPassword({ email, password }));
    // This suite exercises unrestricted legacy flows; Free boundaries have a
    // dedicated suite in verify-plans.mjs.
    checked(await admin.from('profiles').update({ plan: 'pro' }).eq('id', signup.user.id));
    assert.equal(checked(await client.from('profiles').select('id').eq('id', signup.user.id).single()).id, signup.user.id);
    clients.push(client);
  }
  const [owner, player] = clients;
  const facilities = checked(await owner.from('facilities').select('id').eq('id', '10000000-0000-4000-8000-000000000001'));
  assert.equal(facilities.length, 1, 'Synthetic seed club must exist.');
  assert.equal(checked(await owner.from('courts').select('id').eq('facility_id', facilities[0].id)).length, 8);
  const eventId = checked(await owner.rpc('create_event', {
    event_name: 'Local integration test', event_description: 'Synthetic test, removed after verification',
    event_type_value: 'normal_match', event_date_value: '2026-10-01', start_time_value: '18:00',
    facility_id_value: facilities[0].id, visibility_value: 'public', max_players_value: 4,
    rules_value: { format: 'standard_3_sets' },
  }));
  assert.equal(checked(await player.rpc('register_for_event', { target_event_id: eventId })), 'confirmed');
  const roster = checked(await owner.from('event_participants').select('user_id').eq('event_id', eventId));
  assert.ok(roster.some((row) => row.user_id === users[1]), 'Organizer must see another player registration.');
  const edit = {
    target_event_id: eventId, event_name: 'Edited local test', event_description: 'Synthetic update',
    format_value: 'standard_3_sets', event_date_value: '2026-10-02', start_time_value: '19:00',
    visibility_value: 'public', max_players_value: 4,
  };
  assert.ok((await player.rpc('update_event_settings', edit)).error, 'Players cannot edit organizer settings.');
  checked(await owner.rpc('update_event_settings', edit));
  assert.equal(checked(await player.from('events').select('name').eq('id', eventId).single()).name, edit.event_name);
  const groupId = checked(await owner.rpc('create_player_group', {
    group_name: 'Synthetic local group', group_description: 'Test only', member_ids: [users[1]],
  }));
  const privateEventId = checked(await owner.rpc('create_event', {
    event_name: 'Synthetic private game', event_description: 'Test only',
    event_type_value: 'normal_match', event_date_value: '2026-10-02', start_time_value: '18:00',
    visibility_value: 'private', player_group_id_value: groupId, max_players_value: 4,
    rules_value: { format: 'standard_3_sets' },
  }));
  assert.equal(checked(await player.from('events').select('id').eq('id', privateEventId).single()).id, privateEventId);
  checked(await owner.rpc('delete_event', { target_event_id: privateEventId }));
  checked(await owner.rpc('delete_player_group', { target_group_id: groupId }));
  checked(await owner.rpc('delete_event', { target_event_id: eventId }));
  assert.equal(checked(await owner.from('events').select('id').eq('id', eventId)).length, 0);
  const anonymous = createClient(url, key, options);
  const denied = await anonymous.rpc('create_event', {
    event_name: 'Denied', event_description: '', event_type_value: 'normal_match',
    event_date_value: '2026-10-01', start_time_value: '18:00',
  });
  assert.ok(denied.error, 'Anonymous event creation must be denied.');

  const ownerEmail = checked(await owner.auth.getUser()).user.email;
  checked(await owner.auth.resetPasswordForEmail(ownerEmail, { redirectTo: `${appUrl.origin}/reset-password` }));
  const response = await fetch(await emailLink(ownerEmail, 'recovery'), { redirect: 'manual' });
  assert.equal(new URL(response.headers.get('location')).pathname, '/reset-password');
  assert.equal(new URL(response.headers.get('location')).origin, appUrl.origin);
  assert.ok(response.headers.get('set-cookie'));
  const magic = checked(await admin.auth.admin.generateLink({
    type: 'magiclink', email: ownerEmail,
    options: { redirectTo: `${appUrl.origin}/auth/confirm` },
  }));
  assert.equal(new URL(magic.properties.action_link).searchParams.get('redirect_to'), `${appUrl.origin}/auth/confirm`);
  console.log('PASS: local auth, CORS, signup/profile trigger, confirmation/recovery, magic-link redirects, seed reads, event create/read/update/delete, registration, group/private-event flows, and unauthorized write restrictions.');
} finally {
  for (const id of users) checked(await admin.auth.admin.deleteUser(id));
}
