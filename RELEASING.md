# Releasing `@data-generators/core`

## Prerequisites

- [Node.js](https://nodejs.org/) ≥ 24.0.0 (active LTS)
- [pnpm](https://pnpm.io/) ≥ 9 — install with `npm i -g pnpm`
- Write access to the `@data-generators` npm organisation

Verify you are logged in to npm:

```sh
npm whoami
```

If not, authenticate first:

```sh
npm login
```

---

## Development workflow

Install dependencies from the workspace root:

```sh
pnpm install
```

### Available scripts (run from `packages/core` or the workspace root)

| Command | What it does |
|---|---|
| `pnpm build` | Compile TypeScript → `dist/` (ESM + CJS + declarations) |
| `pnpm test` | Run unit tests against TypeScript source via vitest |
| `pnpm test:release` | Build then smoke-test the built `dist/` as a downstream consumer would |
| `pnpm typecheck` | Type-check without emitting files |

---

## Release process

### 1. Verify everything is green

```sh
# From the workspace root
pnpm test          # 97 unit tests
pnpm test:release  # 22 release smoke tests against the built dist/
pnpm typecheck
```

### 2. Bump the version

Edit `packages/core/package.json` and increment the `"version"` field following [semver](https://semver.org/):

- **patch** (`0.2.10` → `0.2.11`): bug fixes only, no API changes
- **minor** (`0.2.10` → `0.3.0`): new backwards-compatible API surface
- **major** (`0.2.10` → `1.0.0`): breaking changes

Or use npm's built-in helper (run from `packages/core`):

```sh
# patch | minor | major
npm version patch --no-git-tag-version
```

The `--no-git-tag-version` flag keeps npm from creating a git tag immediately so you can review the change first.

### 3. Update the changelog / commit

```sh
git add packages/core/package.json
git commit -m "chore: release @data-generators/core@<version>"
git tag v<version>
```

### 4. Build the release artifacts

> **All remaining steps must be run from `packages/core`**, not the repo root.
> The root `package.json` is a private workspace shell (`data-generators@0.0.0`) and is not what gets published.

```sh
cd packages/core
pnpm build
```

This produces:

```
dist/
  index.js      # ESM bundle
  index.cjs     # CommonJS bundle
  index.d.ts    # ESM type declarations
  index.d.cts   # CJS type declarations
  *.map         # source maps
```

Only the files listed in the `"files"` field of `package.json` are published:
`dist/` and `package.json`.

### 5. Dry-run to verify the tarball contents

```sh
# Must be run from packages/core
cd packages/core
npm pack --dry-run
```

Check that no unexpected files are included and that all expected declarations and bundles are present.

### 6. Publish

npm requires 2FA to be satisfied at publish time. The `--otp` flag only works with TOTP authenticator apps, not physical security keys (WebAuthn/FIDO2). If your account uses a physical key you must use a **Granular Access Token** that bypasses 2FA:

1. On [npmjs.com](https://www.npmjs.com) go to **Account → Access Tokens → Generate New Token → Granular Access Token**.
2. Set the token's package permission to **Read and Write** for `@data-generators/core` and enable **Bypass 2FA**.
3. Configure npm to use it (run once, stored in `~/.npmrc`):

```sh
npm config set //registry.npmjs.org/:_authToken=<token>
```

4. Then publish:

```sh
# Must be run from packages/core
npm publish --access public
```

> The `--access public` flag is required for scoped packages on npm's free tier. It can be omitted after the first publish if the organisation's default visibility is already set to public.

### 7. Push the tag

```sh
git push origin main --tags
```

---

## Troubleshooting

**`dist/` missing or stale** — Always run `pnpm build` immediately before `npm publish`. The `test:release` script does this automatically.

**Type errors after bumping TypeScript** — Run `pnpm typecheck` and fix any new errors before releasing.

**Release smoke tests failing** — The `test:release` suite imports exclusively from the built `dist/`. A failure there means something is wrong with the published artifact itself, not just the source. Fix the root cause before publishing.
