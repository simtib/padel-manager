import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { localEnvironment } from './supabase-local.mjs';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import vm from 'node:vm';
import ts from 'typescript';

test('direct development rejects cloud configuration while production remains configurable', () => {
  const source = readFileSync(new URL('../next.config.ts', import.meta.url), 'utf8');
  const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
  const env = { NEXT_PUBLIC_SUPABASE_URL: 'https://example.supabase.co', NEXT_PUBLIC_SITE_URL: 'https://example.test', NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: 'test-key' };
  const exports = {};
  vm.runInNewContext(compiled, { exports, require: createRequire(import.meta.url), process: { env } });
  assert.throws(() => exports.default('phase-development-server'), /Development requires local Supabase/);
  assert.ok(exports.default('phase-production-build').images);
  assert.ok(exports.default('phase-production-server').images);
  env.NEXT_PUBLIC_SUPABASE_URL = 'http://127.0.0.1:54321';
  env.NEXT_PUBLIC_SITE_URL = 'http://localhost:3001';
  assert.ok(exports.default('phase-development-server').images);
  env.NEXT_PUBLIC_SUPABASE_URL = 'http://localhost.example.com:54321';
  assert.throws(() => exports.default('phase-development-server'));
});

test('local credentials replace inherited cloud credentials without changing env files', () => {
  const result = localEnvironment('API_URL="http://127.0.0.1:54321"\r\nANON_KEY="local-anon"\r\nSERVICE_ROLE_KEY="local-service"');
  assert.equal(result.NEXT_PUBLIC_SUPABASE_URL, 'http://127.0.0.1:54321');
  assert.equal(result.NEXT_PUBLIC_SITE_URL, 'http://localhost:3001');
  assert.equal(result.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, 'local-anon');
  assert.equal(result.SUPABASE_SERVICE_ROLE_KEY, 'local-service');
  const withoutService = localEnvironment('API_URL="http://127.0.0.1:54321"\nANON_KEY="local-anon"');
  assert.equal(withoutService.SUPABASE_SERVICE_ROLE_KEY, '');
});

test('local launcher rejects cloud URLs and missing credentials', () => {
  assert.throws(() => localEnvironment('API_URL="https://example.supabase.co"\nANON_KEY="key"'), /non-loopback/);
  assert.throws(() => localEnvironment('API_URL="http://localhost.example.com:54321"\nANON_KEY="key"'), /non-loopback/);
  assert.throws(() => localEnvironment('API_URL="http://localhost:54321"'), /anon key/);
  assert.throws(() => localEnvironment(''));
});

test('reset refuses remote overrides before invoking the CLI', () => {
  for (const flag of ['--linked', '--db-url', '--project-ref', '--workdir']) {
    const result = spawnSync(process.execPath, ['scripts/supabase-local.mjs', 'reset', flag], { encoding: 'utf8' });
    assert.equal(result.status, 1);
    assert.match(result.stderr, /do not accept additional arguments/);
  }
});
