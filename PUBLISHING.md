# Publishing Guide

This guide explains how to publish packages from this monorepo to npm in a reliable, repeatable way.

## Package scope and access

- Scope: `@dimah`
- Package example: `@dimah/fa-utils`
- Access: `public` (configured in each package via `publishConfig.access`)

## One-time setup

### 1) Create npm account

- Sign up at <https://www.npmjs.com/signup>
- Verify your email

### 2) Create npm token

1. Go to npm access tokens settings.
2. Generate a new **Automation** token.
3. Store it securely.

### 3) Add token to GitHub Secrets

In this repository settings:

- Name: `NPM_TOKEN`
- Value: your npm automation token

### 4) Local auth (for manual publish)

```bash
npm login
npm whoami
```

## Standard release model (recommended)

This repository uses Changesets + SemVer:

- `patch`: backward-compatible fixes
- `minor`: backward-compatible features
- `major`: breaking changes

### Contributor workflow

1. Make package changes.
2. Run quality checks:

```bash
pnpm build
pnpm check-types
```

3. Create a changeset:

```bash
pnpm changeset
```

4. Commit code + changeset file.
5. Open PR.

### Maintainer workflow (after merge)

1. Apply version/changelog updates:

```bash
pnpm version-packages
```

2. Commit generated updates.
3. Push to `master`.
4. Existing GitHub Action publishes new version(s) if not already published.

## Manual publish flow (fallback)

Use this only when you intentionally want manual control.

```bash
# verify auth
npm whoami

# build package
pnpm --filter @dimah/fa-utils build

# publish package
pnpm --filter @dimah/fa-utils publish --access public
```

## Verify published package

- npm page: <https://www.npmjs.com/package/@dimah/fa-utils>
- install:

```bash
pnpm add @dimah/fa-utils
# or
npm install @dimah/fa-utils
```

## Pre-publish checklist

```bash
pnpm --filter @dimah/fa-utils build
pnpm --filter @dimah/fa-utils check-types
pnpm --filter @dimah/fa-utils pack --dry-run
```

Confirm:

- version is bumped
- package metadata is correct
- published files are expected

## Troubleshooting

### 403 Forbidden

- Verify `NPM_TOKEN` is present and valid.
- Confirm you can publish under scope `@dimah`.

### 402 Payment Required

- Make sure package access is public (`publishConfig.access: "public"`).

### Version already exists

- Bump version (prefer via Changesets + `pnpm version-packages`).

### GitHub Action fails

- Check Actions logs.
- Verify token permissions and secret name.
