// hash-package-locks.js
import crypto from 'node:crypto';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { glob } from 'glob';

type LockFileName = 'package-lock.json' | 'pnpm-lock.yaml' | 'yarn.lock';

/**
 * Generate a combined hash of all lock files in a repo.
 * @param {string} rootPath - Root path of the repository
 * @param {LockFileName} lockFileName - Name of the lock file to search for.
 *     Currently supports 'package-lock.json', 'pnpm-lock.yaml', and 'yarn.lock'
 * @returns {Promise<string>} - Combined hash string
 */
export async function generateCombinedLockFileHash(
  rootPath: string,
  lockFileName: LockFileName,
): Promise<string> {
  const pattern = path.join(rootPath, `**/${lockFileName}`);
  const files = await glob(pattern, { ignore: '**/node_modules/**' });
  const fileContents = await Promise.all(files.map((file) => readFile(file)));

  // Generate hash for each file
  const hashesMap: Record<string, string> = {};

  files.forEach((file, i) => {
    const relativePath = path.relative(rootPath, file);
    const fileContent = fileContents[i];
    const hash = crypto.createHash('sha256').update(fileContent).digest('hex');
    hashesMap[relativePath] = hash;
  });

  // Sort the entries to ensure consistent hash
  const sortedEntries = Object.entries(hashesMap).sort(([pathA], [pathB]) => {
    return pathA.localeCompare(pathB);
  });

  // Create a string representation of all hashes
  const combinedString = sortedEntries.map(([relPath, hash]) => `${relPath}:${hash}`).join('|');

  // Generate a new hash from the combined string
  return crypto.createHash('sha256').update(combinedString).digest('hex');
}
