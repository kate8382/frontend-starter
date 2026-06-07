# Frontend Starter

A minimal, accessible frontend starter template using Vite, TypeScript, BEM-style CSS, and a small class-based API client.

This repository provides a compact foundation for small projects and demos. It includes tooling for development, linting, and testing suitable for Windows and cross-platform development.

**Key features**

- Vite dev server and build pipeline
- TypeScript sources under `ts/` with class-based structure (`ApiClient`, `AppUI`)
- BEM-style CSS utilities and tokens
- ESLint (flat config) + Prettier integration
- Vitest for DOM and unit tests (jsdom)

**Quickstart**

1. Install dependencies:

   npm install

2. Run development server:

   npm run dev

   Open http://localhost:5173/

3. Run tests (Windows note):

   npm run test -- --pool threads --maxWorkers 1

   Vitest on Windows may require `--pool` flags to avoid worker startup timeouts.

4. Lint:

   npm run lint

5. Build for production:

   npm run build

Project structure

- `index.html` — HTML shell and example markup
- `ts/` — TypeScript source files (`api.ts`, `main.ts`, tests)
- `css/` — component styles (BEM-like)
- `dist/` — output (gitignored)

Api client (overview)

- `ts/api.ts` exports `ApiClient` class and default `api` instance.
- Use `api.setBaseUrl(url)`, `api.setAuth(token)` and `api.request()` or helper methods `get/post/put/delete`.
- Supports timeout and automatic JSON parsing; define `onAuthFailure` handler to centralize auth errors.

Notes

- There are optional `js/` copies planned for plain-JS usage (not included yet).
- Favicons are intentionally commented out in `index.html` to avoid stale cache issues during development.
- ESLint is configured as a flat config (`eslint.config.cjs`) and excludes `dist/` to avoid linting minified bundles.

Contributing

- Open an issue or create a PR. Keep changes minimal and focused.

License

- MIT — see [LICENSE](LICENSE)
