# Frontend Starter

A lightweight, accessible frontend starter built with Vite and TypeScript. It provides a compact foundation for prototypes, demos, and small projects with a focus on responsiveness, accessibility, and simple class-based patterns.

Why this starter

- Minimal opinionated setup — Vite dev server, build, and plain JS/TS examples.
- Accessible UI patterns (ARIA, focus management) implemented out of the box.
- Responsive primitives using CSS variables and `clamp()` for typography and spacing.
- Test-ready: Vitest + jsdom with example unit and DOM tests.

Key features

- Vite dev server and production build (`npm run dev`, `npm run build`).
- TypeScript sources in `ts/` and plain-JS mirrors in `js/` for quick integration.
- BEM-style CSS and design tokens in `css/variables.css` (uses `clamp()` to adapt font sizes, paddings and gaps across viewports).
- `ApiClient` class: centralized `fetch` wrapper with timeout, JSON parsing and `onAuthFailure` hook.
- `AppUI` class: accessible burger menu and off-canvas `aside` with keyboard and outside-click handling.
- ESLint + Prettier for consistent formatting, and Vitest for tests.

Quickstart

1. Install dependencies:
```
   npm ci
```

2. Run development server:
```
   npm run dev
```

   Visit http://localhost:5173/

3. Run tests (Windows-friendly):
```
   npm test -- --run --pool forks --maxWorkers 1
```

   **Note:** on Windows the `--pool forks --maxWorkers 1` flags help avoid worker startup issues with jsdom.

4. Lint and format:
```
   npm run lint
   npm run format
```

5. Build for production:
```
   npm run build
```

Project layout (important files)

- `index.html` — HTML shell, header and commented example for enabling `aside` and JS usage.
- `ts/` — TypeScript source files (`api.ts`, `main.ts`) and tests (`ts/__test__`).
- `js/` — plain-JS copies of the same classes and tests (`js/__test__`).
- `css/` — styles and tokens. See `css/variables.css` for responsive variables that use `clamp()`.
- `vitest.config.ts` — test config includes both `ts` and `js` test patterns.
- `package.json` — scripts for dev, build, lint and test.

Using the plain-JS bundle
If you prefer to use the plain-JS files instead of the TypeScript entry, replace the script reference in `index.html` with the JS file. Example HTML fragment:

```html
<!-- Use JS entry (uncomment to enable) -->
<script type="module" src="/js/main.js"></script>
```

Adaptive layout and tokens
The `css/variables.css` file exposes a set of CSS custom properties that drive spacing and typography. Many values use `clamp()` so components scale smoothly between mobile and desktop sizes. This makes the starter already well-suited for responsive projects without extra effort.

Testing

- Unit and DOM tests live in `ts/__test__` and `js/__test__`. Tests use `vi` (Vitest) and `jsdom` for DOM interactions.
- Run all tests:

```bash
npm test -- --run --pool forks --maxWorkers 1
```

Contributing

- Open an issue or submit a PR. Keep changes focused and include tests where appropriate.

CI suggestions

- The repository already contains a minimal workflow. If you expand CI later, include steps for `npm ci`, `npm test -- --run --pool forks --maxWorkers 1`, and `npm run lint`.

License

- MIT — see [LICENSE](LICENSE)
