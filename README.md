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

Alternatively, you can use the default export. This allows for easier mocking, since hashing lockfiles is an expensive operation that you really don't want to do during unit tests:

```js
import lockfileHasher from 'lockfile-hasher';

const combinedHash = lockfileHasher.generateCombinedLockfileHash(pathToRepositoryRoot);
```
