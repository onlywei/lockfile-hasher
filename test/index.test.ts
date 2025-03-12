import assert from 'node:assert';
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { describe, it } from 'node:test';
import { generateCombinedLockFileHash } from '../src/index.ts';

describe('generatePackageLockHash', () => {
  const fixturesDir = path.resolve(import.meta.dirname, 'fixtures');

  it('generates a hash of all package-lock.json files', async () => {
    const hash = await generateCombinedLockFileHash(fixturesDir, 'package-lock.json');
    assert.ok(hash);
  });

  it('does not change provided the lock files do not change', async () => {
    const hash1 = await generateCombinedLockFileHash(fixturesDir, 'package-lock.json');
    const hash2 = await generateCombinedLockFileHash(fixturesDir, 'package-lock.json');

    assert.strictEqual(hash1, hash2);
  });

  it('changes when any lockfile is changed', async () => {
    const hash1 = await generateCombinedLockFileHash(fixturesDir, 'package-lock.json');

    const packageALock = path.resolve(fixturesDir, 'packages/package-a/package-lock.json');
    const originalContents = await readFile(packageALock, 'utf-8');
    const parsed = JSON.parse(originalContents);
    parsed.name = 'modified-package-a';
    await writeFile(packageALock, JSON.stringify(parsed), 'utf-8');
    const hash2 = await generateCombinedLockFileHash(fixturesDir, 'package-lock.json');

    try {
      assert.notEqual(hash1, hash2);
    } finally {
      await writeFile(packageALock, originalContents, 'utf-8');
    }
  });
});
