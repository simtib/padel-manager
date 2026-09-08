const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');

const flush = () => new Promise((resolve) => setImmediate(resolve));

function mount() {
  let cleanup;
  let poll;
  let state = [{ id: 'event', participants: [{ id: 'stale' }], teams: [] }];
  let rows = [];
  let error = null;
  const changes = {};
  const channel = {
    on(_type, filter, callback) { changes[filter.table] = callback; return this; },
    subscribe() { return this; },
  };
  const client = {
    channel: () => channel,
    removeChannel() {},
    from(table) {
      let start = 0;
      let end = Infinity;
      const query = {
        select() { return this; },
        order() { return this; },
        in() { return this; },
        range(a, b) { start = a; end = b; return this; },
        then(resolve) {
          return Promise.resolve(table === 'events'
            ? { data: [{ id: 'event', event_type: 'tournament', status: 'open' }], error: null }
            : { data: rows.slice(start, end + 1), error }).then(resolve);
        },
      };
      return query;
    },
  };
  const source = fs.readFileSync(path.join(__dirname, '../src/context/useSupabaseEventSync.ts'), 'utf8');
  const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
  const exports = {};
  vm.runInNewContext(compiled, {
    exports,
    require(name) {
      if (name === 'react') return { useEffect: (effect) => { cleanup = effect(); } };
      if (name === '../lib/supabase/client') return { createClient: () => client };
      throw new Error(`Unexpected import: ${name}`);
    },
    console: { error() {} },
    window: { setInterval(fn) { poll = fn; }, clearInterval() {}, addEventListener() {}, removeEventListener() {} },
    document: { visibilityState: 'visible', addEventListener() {}, removeEventListener() {} },
  });
  exports.useSupabaseEventSync(true, (update) => { state = update(state); });
  return { get state() { return state; }, set rows(value) { rows = value; }, set error(value) { error = value; }, poll: () => poll(), change: () => changes.event_participants(), cleanup: () => cleanup() };
}

const registration = (id, status = 'confirmed') => ({
  id: `registration-${id}`, event_id: 'event', user_id: id, guest_player_id: null,
  registration_status: status, joined_at: '2026-09-08T00:00:00Z', profiles: { display_name: `Player ${id}` },
});

test('admin roster loads registrations from another browser and removes stale cached players', async () => {
  const app = mount();
  app.rows = [registration('new-player'), registration('waiting', 'waiting_list')];
  await flush();
  assert.equal(app.state[0].participants.length, 2);
  assert.equal(app.state[0].participants[0].id, 'new-player');
  assert.equal(app.state[0].participants[0].displayName, 'Player new-player');
  assert.equal(app.state[0].participants[1].waitingListPosition, 1);
  app.rows = [];
  app.change();
  await flush();
  assert.equal(app.state[0].participants.length, 0);
  app.cleanup();
});

test('polling loads all pages without requiring realtime and retries failed reads', async () => {
  const app = mount();
  app.rows = Array.from({ length: 501 }, (_, i) => registration(`player-${i}`));
  await flush();
  assert.equal(app.state[0].participants.length, 501);
  app.error = { message: 'Temporary outage' };
  app.rows = [];
  app.poll();
  await flush();
  assert.equal(app.state[0].participants.length, 501);
  app.error = null;
  app.poll();
  await flush();
  assert.equal(app.state[0].participants.length, 0);
  app.cleanup();
  app.rows = [registration('after-unmount')];
  app.poll();
  await flush();
  assert.equal(app.state[0].participants.length, 0);
});
