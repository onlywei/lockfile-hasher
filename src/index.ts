import crypto from 'node:crypto';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { glob } from 'glob';

const GLOB_PATTERNS = ['**/package-lock.json', '**/yarn.lock', '**/pnpm-lock.yaml'];
const GLOB_OPTIONS = { ignore: '**/node_modules/**' };

/**
 * Generate a combined hash of all lock files in a repo.
 * @param {string} rootPath - Root path of the repository
 * @returns {Promise<string>} - Combined hash string
 */
export async function generateCombinedLockFileHash(rootPath: string): Promise<string> {
  const files = await Promise.all(
    GLOB_PATTERNS.map((pattern) => glob(path.join(rootPath, pattern), GLOB_OPTIONS)),
  ).then((results) => results.flat());
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

export default {
  generateCombinedLockFileHash,
};
