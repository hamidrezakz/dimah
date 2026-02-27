# HRK Monorepo

> A collection of open-source TypeScript packages for modern web development

This is a monorepo containing multiple npm packages maintained by [@hamidrezakz](https://github.com/hamidrezakz).

## 📦 Packages

### [@hrk/fa-utils](./packages/fa-utils)

Simple Persian (Farsi) date and number formatting helpers using built-in JavaScript Intl APIs.

```bash
pnpm add @hrk/fa-utils
```

## 🛠 Development

This monorepo uses:

- **[pnpm](https://pnpm.io)** for package management
- **[Turborepo](https://turbo.build/repo)** for efficient builds
- **TypeScript** for type safety

### Setup

```bash
pnpm install
```

### Build all packages

```bash
pnpm build
```

### Build specific package

```bash
pnpm --filter @hrk/fa-utils build
```

## 📖 Publishing

See [PUBLISHING.md](./PUBLISHING.md) for detailed instructions on publishing packages to npm.

## 📄 License

MIT © [Hamidreza](https://github.com/hamidrezakz)
