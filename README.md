# Dimah Monorepo

> A collection of open-source TypeScript packages for modern web development

This is a monorepo containing multiple npm packages maintained by [@hamidrezakz](https://github.com/hamidrezakz).

## 📦 Packages

### [@dimah/fa-utils](./packages/fa-utils)

Simple Persian (Farsi) date and number formatting helpers using built-in JavaScript Intl APIs.

```bash
pnpm add @dimah/fa-utils
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
pnpm --filter @dimah/fa-utils build
```

## 📖 Publishing

See [PUBLISHING.md](./PUBLISHING.md) for detailed instructions on publishing packages to npm.

## 🤝 Open-source process

- [CONTRIBUTING.md](./CONTRIBUTING.md)
- [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md)
- [SECURITY.md](./SECURITY.md)
- [RELEASING.md](./RELEASING.md)

## 📄 License

MIT © [Hamidreza](https://github.com/hamidrezakz)
