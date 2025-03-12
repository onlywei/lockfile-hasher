# lockfile-hasher

Generates a combined hash of all the lockfiles in a repo. Supports `package-lock.json`, `pnpm-lock.yaml`, and `yarn.lock` files.

This can be used as a cache key for CI/CD pipelines in repositories that have multiple lock files.

## Installation

```
npm install lockfile-hasher
```

## Usage

```js
import { generateCombinedLockFileHash } from 'lockfile-hasher';

const combinedHash = generateCombinedLockfileHash(pathToRepositoryRoot);
```
