import assert from 'node:assert';
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { describe, it } from 'node:test';
import lockfileHasher, { generateCombinedLockFileHash } from '../src/index.ts';

describe('generatePackageLockHash', () => {
  const fakeTestRepoDir = path.resolve(import.meta.dirname, 'fake-test-repo');

  it('generates a hash of all package-lock.json files', async () => {
    const hash = await generateCombinedLockFileHash(fakeTestRepoDir);
    assert.ok(hash);
  });

  it('does not change provided the lock files do not change', async () => {
    const hash1 = await generateCombinedLockFileHash(fakeTestRepoDir);
    const hash2 = await generateCombinedLockFileHash(fakeTestRepoDir);

    assert.strictEqual(hash1, hash2);
  });

  it('allows using the method from the default export', async () => {
    const hash1 = await generateCombinedLockFileHash(fakeTestRepoDir);
    const hash2 = await lockfileHasher.generateCombinedLockFileHash(fakeTestRepoDir);

    assert.strictEqual(hash1, hash2);
  });

  it("allows mocking the method using node's built in mocking system", async (t) => {
    t.mock.method(lockfileHasher, 'generateCombinedLockFileHash', async () => 'mocked-hash');
    const hash = await lockfileHasher.generateCombinedLockFileHash(fakeTestRepoDir);
    assert.strictEqual(hash, 'mocked-hash');
  });

  it('loses the mock when the previous test ends', async () => {
    const hash = await lockfileHasher.generateCombinedLockFileHash(fakeTestRepoDir);
    assert.notStrictEqual(hash, 'mocked-hash');
  });

  it('changes when any lockfile is changed', async () => {
    const hash1 = await generateCombinedLockFileHash(fakeTestRepoDir);

    const packageALock = path.resolve(fakeTestRepoDir, 'packages/package-a/package-lock.json');
    const originalContents = await readFile(packageALock, 'utf-8');
    const parsed = JSON.parse(originalContents);
    parsed.name = 'modified-package-a';
    await writeFile(packageALock, JSON.stringify(parsed), 'utf-8');
    const hash2 = await generateCombinedLockFileHash(fakeTestRepoDir);

    try {
      assert.notEqual(hash1, hash2);
    } finally {
      await writeFile(packageALock, originalContents, 'utf-8');
    }
  });
});
