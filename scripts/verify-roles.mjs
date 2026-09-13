// Integration tests against LOCAL Supabase and the local Next.js server only.
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';
import { getLocalEnvironment } from './supabase-local.mjs';

const env = getLocalEnvironment();
const app = new URL(env.NEXT_PUBLIC_SITE_URL);
assert.ok(app.protocol === 'http:' && ['localhost', '127.0.0.1'].includes(app.hostname));
const url = env.NEXT_PUBLIC_SUPABASE_URL;
const key = env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const options = { auth: { persistSession: false, autoRefreshToken: false } };
const service = createClient(url, env.SUPABASE_SERVICE_ROLE_KEY, options);
const checked = ({ data, error }) => { if (error) throw error; return data; };
const denied = (result) => assert.ok(result.error || result.data?.length === 0, 'Expected permission denial');
const accounts = [];
const clubIds = [];
const caseIds = [];
const eventIds = [];
const feedbackIds = [];

async function login(email, password) {
  const jar = new Map();
  const api = createServerClient(url, key, { cookies: {
    getAll: () => [...jar].map(([name, value]) => ({ name, value })),
    setAll: (cookies) => cookies.forEach(({ name, value }) => jar.set(name, value)),
  } });
  const { user } = checked(await api.auth.signInWithPassword({ email, password }));
  return { api, id: user.id, cookie: () => [...jar].map(([name, value]) => `${name}=${value}`).join('; ') };
}
async function request(account, path, payload, origin = app.origin) {
  return fetch(new URL(path, app), { redirect: 'manual',
    signal: AbortSignal.timeout(60000),
    method: payload ? 'POST' : 'GET',
    headers: { ...(account ? { Cookie: account.cookie() } : {}), ...(payload ? { Origin: origin, 'Content-Type': 'application/json' } : {}) },
    ...(payload ? { body: JSON.stringify(payload) } : {}),
  });
}
async function post(account, payload, status = 200) {
  const response = await request(account, '/api/admin', payload);
  const body = await response.json();
  assert.equal(response.status, status, JSON.stringify(body));
  return body;
}

try {
  const superAdmin = await login('superadmin@example.test', 'LocalPadel-Only-2026!');
  assert.equal(checked(await superAdmin.api.from('profiles').select('role').eq('id', superAdmin.id).single()).role, 'super_admin');
  for (const label of ['user', 'admin']) {
    const email = `roles-${label}-${randomUUID()}@example.test`;
    const password = `Local-${randomUUID()}!`;
    const { user } = checked(await service.auth.admin.createUser({ email, password, email_confirm: true,
      user_metadata: { first_name: 'Role', last_name: label, display_name: `Role ${label}`, role: 'super_admin', is_admin: true },
    }));
    accounts.push({ id: user.id });
    Object.assign(accounts.at(-1), await login(email, password));
    assert.equal(checked(await accounts.at(-1).api.from('profiles').select('role').eq('id', user.id).single()).role, 'user', 'Signup metadata cannot assign roles');
  }
  const [user, admin] = accounts;
  checked(await superAdmin.api.rpc('set_user_role', { target_user_id: admin.id, new_role: 'admin' }));
  assert.equal(checked(await admin.api.rpc('is_app_admin')), true);
  assert.equal(checked(await user.api.rpc('is_app_admin')), false);
  assert.equal(checked(await admin.api.rpc('is_super_admin')), false);
  assert.equal(checked(await superAdmin.api.rpc('is_super_admin')), true);

  const anonymous = createClient(url, key, options);
  denied(await anonymous.from('profiles').select('*'));
  denied(await anonymous.from('player_directory').select('*'));
  assert.equal(checked(await user.api.from('profiles').select('id')).length, 1);
  assert.ok(checked(await user.api.from('player_directory').select('*')).every((row) => !('email' in row) && !('phone' in row) && !('role' in row)));
  denied(await user.api.from('player_directory').select('email,role'));
  denied(await user.api.from('player_directory').update({ display_name: 'Attack' }).eq('id', admin.id));
  for (const account of [user, admin, superAdmin]) {
    denied(await account.api.from('profiles').update({ role: 'super_admin' }).eq('id', account.id));
    denied(await account.api.from('profiles').upsert({ id: account.id, first_name: 'Attack', last_name: '', display_name: 'Attack', email: 'attack@example.test', role: 'super_admin' }));
  }
  for (const account of [user, admin]) {
    denied(await account.api.rpc('set_user_role', { target_user_id: account.id, new_role: 'super_admin' }));
    denied(await account.api.from('application_admins').insert({ user_id: account.id }));
    assert.deepEqual(checked(await account.api.from('role_changes').select('*')), []);
  }
  checked(await user.api.auth.updateUser({ data: { role: 'super_admin', is_admin: true } }));
  assert.equal(checked(await user.api.rpc('is_app_admin')), false);
  checked(await user.api.from('profiles').update({ display_name: 'Own name' }).eq('id', user.id).select('id').single());
  denied(await user.api.from('profiles').update({ display_name: 'Attack' }).eq('id', admin.id).select('id'));
  denied(await user.api.from('profiles').delete().eq('id', user.id));

  const payload = { user_id: user.id, type: 'suggestion', title: 'Roles regression', description: 'Synthetic feedback' };
  const feedback = checked(await user.api.from('feedback').insert(payload).select('*').single()); feedbackIds.push(feedback.id);
  const other = checked(await admin.api.from('feedback').insert({ ...payload, user_id: admin.id }).select('*').single()); feedbackIds.push(other.id);
  denied(await user.api.from('feedback').select('*').eq('id', other.id));
  denied(await user.api.from('feedback').update({ status: 'done' }).eq('id', feedback.id).select('id'));
  for (const account of [admin, superAdmin]) {
    checked(await account.api.from('feedback').update({ status: 'reviewing' }).eq('id', feedback.id).select('id').single());
    denied(await account.api.from('feedback').update({ description: 'Attack' }).eq('id', feedback.id));
    checked(await account.api.from('profiles').update({ phone: '+971000000000' }).eq('id', user.id).select('id').single());
  }
  const clubFields = { name: 'Role test club', address: 'Synthetic', city: 'Test', country: 'Test', created_by: user.id };
  denied(await user.api.from('facilities').insert(clubFields));
  const club = checked(await admin.api.from('facilities').insert({ ...clubFields, created_by: admin.id }).select('id').single()); clubIds.push(club.id);
  // Even a legacy creator cannot manage clubs without an application admin role.
  checked(await service.from('facilities').update({ created_by: user.id }).eq('id', club.id));
  denied(await user.api.from('facilities').update({ name: 'Attack' }).eq('id', club.id).select('id'));
  denied(await user.api.from('facilities').delete().eq('id', club.id).select('id'));
  denied(await user.api.from('courts').insert({ facility_id: club.id, name: 'Attack' }));
  const court = checked(await admin.api.from('courts').insert({ facility_id: club.id, name: 'Court', court_number: 1 }).select('id').single());
  denied(await user.api.from('courts').update({ name: 'Attack' }).eq('id', court.id).select('id'));
  checked(await superAdmin.api.from('courts').update({ name: 'Managed court' }).eq('id', court.id).select('id').single());
  const support = checked(await admin.api.from('support_cases').insert({ user_id: user.id, subject: 'Internal case', notes: 'Admin-only notes', created_by: admin.id }).select('id').single()); caseIds.push(support.id);
  assert.deepEqual(checked(await user.api.from('support_cases').select('*')), []);
  denied(await user.api.from('support_cases').insert({ user_id: user.id, subject: 'Attack', created_by: user.id }));
  denied(await user.api.from('support_cases').update({ notes: 'Attack' }).eq('id', support.id).select('id'));
  checked(await superAdmin.api.from('support_cases').update({ status: 'resolved' }).eq('id', support.id).select('id').single());

  // Normal gameplay still exposes roster names without leaking full profiles.
  const eventId = checked(await user.api.rpc('create_event', { event_name: 'Role roster test', event_description: '', event_type_value: 'normal_match', event_date_value: '2026-10-01', start_time_value: '18:00', visibility_value: 'public', max_players_value: 4 })); eventIds.push(eventId);
  checked(await admin.api.rpc('register_for_event', { target_event_id: eventId }));
  const roster = checked(await user.api.from('event_participants').select('user_id, profiles:player_directory!event_participants_user_id_fkey(display_name)').eq('event_id', eventId));
  assert.equal(roster.find((row) => row.user_id === admin.id).profiles.display_name, 'Role admin');
  console.log('PASS: local seed login, metadata spoofing, profile/directory privacy, RLS, feedback, clubs/courts, support, and normal roster access.');

  const anonymousPage = await request(null, '/admin');
  assert.equal(new URL(anonymousPage.headers.get('location'), app).pathname, '/login');
  const userPage = await request(user, '/admin');
  assert.equal(new URL(userPage.headers.get('location'), app).pathname, '/dashboard');
  for (const path of ['/', '/login', '/dashboard', '/games', '/tournaments', '/player-groups', '/profile', '/join/example']) {
    const response = await request(superAdmin, path);
    assert.equal(new URL(response.headers.get('location'), app).pathname, '/admin', path);
  }
  assert.equal((await request(user, '/dashboard')).status, 200, 'Normal users keep their dashboard');
  const adminHtml = await (await request(superAdmin, '/admin')).text();
  for (const label of ['Overview', 'Feedback', 'Users', 'Clubs', 'Matches', 'Bookings', 'Reports', 'Audit Log', 'Settings', 'Profile', 'Sign Out']) {
    assert.ok(adminHtml.includes(label), `Missing admin navigation: ${label}`);
  }
  for (const label of ['Provide Feedback', 'My Feedback', 'Back to PadelManager', 'Admin sections']) {
    assert.ok(!adminHtml.includes(label), `Redundant user navigation: ${label}`);
  }
  for (const section of ['matches', 'bookings', 'reports', 'settings']) {
    const response = await request(superAdmin, `/admin?section=${section}`);
    assert.equal(response.status, 200);
    assert.ok((await response.text()).includes('Coming soon'));
  }
  const ownProfile = await (await request(superAdmin, '/api/admin?resource=profile')).json();
  assert.deepEqual(ownProfile.data.map((row) => row.id), [superAdmin.id]);
  for (const resource of ['users', 'clubs', 'feedback', 'support', 'roles']) {
    assert.equal((await request(null, `/api/admin?resource=${resource}`)).status, 401);
    assert.equal((await request(user, `/api/admin?resource=${resource}`)).status, 403);
    assert.equal((await request(admin, `/api/admin?resource=${resource}`)).status, resource === 'roles' ? 403 : 200);
    assert.equal((await request(superAdmin, `/api/admin?resource=${resource}`)).status, 200);
  }
  for (const account of [admin, superAdmin]) {
    const response = await request(account, '/admin');
    assert.equal(response.status, 200); assert.ok((await response.text()).includes('Admin area'));
  }
  const edits = [
    { action: 'profile.update', id: user.id, first_name: 'Role', last_name: 'User', display_name: 'Managed user', phone: '' },
    { action: 'feedback.status', id: feedback.id, status: 'done' },
    { action: 'club.save', id: club.id, name: 'Managed club', address: 'Synthetic', city: 'Test', country: 'Test' },
    { action: 'court.save', id: court.id, facility_id: club.id, name: 'API court', court_number: 2, is_active: false },
    { action: 'support.update', id: support.id, subject: 'Managed case', notes: 'Internal notes updated', status: 'in_progress' },
  ];
  for (const edit of edits) {
    await post(user, edit, 403);
    await post(admin, edit);
    await post(superAdmin, edit);
  }
  assert.equal(checked(await user.api.from('profiles').select('display_name').eq('id', user.id).single()).display_name, 'Managed user');
  assert.equal(checked(await user.api.from('facilities').select('name').eq('id', club.id).single()).name, 'Managed club');
  assert.equal(checked(await user.api.from('courts').select('is_active').eq('id', court.id).single()).is_active, false);
  assert.equal(checked(await user.api.from('feedback').select('status').eq('id', feedback.id).single()).status, 'done');
  assert.equal(checked(await admin.api.from('support_cases').select('notes').eq('id', support.id).single()).notes, 'Internal notes updated');
  for (const account of [admin, superAdmin]) {
    const name = `HTTP club ${randomUUID()}`;
    const createClub = { action: 'club.save', name, address: 'Synthetic', city: 'Test', country: 'Test' };
    await post(user, createClub, 403);
    await post(account, createClub);
    const created = checked(await service.from('facilities').select('id').eq('name', name).single()); clubIds.push(created.id);
    const createCourt = { action: 'court.save', facility_id: created.id, name: 'HTTP court', court_number: 1, is_active: true };
    await post(user, createCourt, 403);
    await post(account, createCourt);
    const createdCourt = checked(await service.from('courts').select('id').eq('facility_id', created.id).single());
    const createSupport = { action: 'support.create', user_id: user.id, subject: name, notes: 'HTTP case' };
    await post(user, createSupport, 403);
    await post(account, createSupport);
    caseIds.push(checked(await service.from('support_cases').select('id').eq('subject', name).single()).id);
    await post(user, { action: 'court.delete', id: createdCourt.id }, 403);
    await post(account, { action: 'court.delete', id: createdCourt.id });
    await post(user, { action: 'club.delete', id: created.id }, 403);
    await post(account, { action: 'club.delete', id: created.id });
    assert.deepEqual(checked(await user.api.from('facilities').select('id').eq('id', created.id)), []);
  }
  await post(admin, { ...edits[0], role: 'super_admin' }, 400);
  assert.equal((await request(admin, '/api/admin', edits[0], 'https://attacker.example')).status, 403);
  await post(admin, { action: 'role.set', id: user.id, role: 'admin' }, 403);
  await post(superAdmin, { action: 'role.set', id: superAdmin.id, role: 'user' }, 403);
  await post(superAdmin, { action: 'role.set', id: user.id, role: 'super_admin' });
  assert.equal(checked(await user.api.rpc('is_super_admin')), true, 'Existing session sees promotions');
  await post(superAdmin, { action: 'role.set', id: user.id, role: 'user' });
  await post(superAdmin, { action: 'role.set', id: admin.id, role: 'user' });
  assert.equal(checked(await admin.api.rpc('is_app_admin')), false, 'Existing session loses permissions immediately');
  assert.equal((await request(admin, '/api/admin?resource=users')).status, 403);
  assert.equal(new URL((await request(admin, '/admin')).headers.get('location'), app).pathname, '/dashboard');
  await post(admin, edits[0], 403);
  assert.deepEqual(checked(await admin.api.from('support_cases').select('*')), []);
  denied(await admin.api.from('feedback').update({ status: 'rejected' }).eq('id', feedback.id).select('id'));
  assert.ok(checked(await superAdmin.api.from('role_changes').select('id').eq('user_id', admin.id)).length >= 2);
  console.log('PASS: server page/API protection for all roles, validated admin mutations, CSRF, super-admin-only role changes, audit history, and immediate revocation with existing sessions.');
} finally {
  for (const id of eventIds) checked(await service.from('events').delete().eq('id', id));
  for (const id of caseIds) checked(await service.from('support_cases').delete().eq('id', id));
  for (const id of feedbackIds) checked(await service.from('feedback').delete().eq('id', id));
  for (const id of clubIds) checked(await service.from('facilities').delete().eq('id', id));
  for (const account of accounts) {
    checked(await service.from('role_changes').delete().eq('user_id', account.id));
    checked(await service.auth.admin.deleteUser(account.id));
  }
}
