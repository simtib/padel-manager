// Retries `next build` because Windows Defender / Search Indexer intermittently
// lock files inside `.next` (errno: -4094 / ERROR_SHARING_VIOLATION) during the
// build's heavy filesystem I/O. The collision is per-file and timing-based, so a
// retry almost always succeeds once the scanner releases the handle.
import { spawnSync } from 'node:child_process';

const MAX_ATTEMPTS = 6;

for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
  const res = spawnSync('npx', ['next', 'build'], { stdio: 'inherit', shell: true });
  const code = res.status ?? 1;
  if (code === 0) {
    process.exit(0);
  }
  const out = (res.stderr?.toString() ?? '') + (res.stdout?.toString() ?? '');
  const isSharingViolation = /errno:\s*-4094|ERROR_SHARING_VIOLATION|unknown error, open/i.test(out);
  if (!isSharingViolation) {
    console.error(`\nBuild failed (attempt ${attempt}) with a non-retryable error.`);
    process.exit(code);
  }
  console.error(
    `\n[retry-build] Build hit a Windows file-lock (sharing violation) on attempt ${attempt}/${MAX_ATTEMPTS}. Retrying...`
  );
  // Give the scanner a moment to release handles.
  await new Promise((r) => setTimeout(r, attempt * 1500));
}

console.error(`\n[retry-build] Gave up after ${MAX_ATTEMPTS} attempts.`);
process.exit(1);
