# Validation scripts

Browser-level smoke harnesses kept from the development phases. They are archived
verification artefacts, not part of the build: `npm run lint` and `npm run build`
are the maintained checks and are what CI should run.

## What is here

| Script | Scope |
| --- | --- |
| `admin-platform-check.cjs` | Admin console: routes, AZ/EN, theme persistence, keyboard drawer, API error/empty states, user isolation |
| `phase11-check.cjs` … `phase15-check.cjs` | Superseded per-phase UI workflows, kept for reference |
| `phase16-check.cjs` | Broad phase 16 route/overflow/a11y sweep |
| `phase16-production-check.cjs` | Production build (`npm run preview`) deep links, guards, 404s |
| `phase16-runtime-check.cjs` | No-backend guard, error boundary recovery, dialog focus trap |
| `phase16-runtime-fixture.js` | Served by Vite for `phase16-runtime-check.cjs` only; never imported by the app |

## Running them

These scripts are dependency-free: they drive a headless Chromium over the
DevTools protocol. They are not project dependencies, so point `CHROMIUM_PATH` at
a Chromium/Chrome binary you already have.

```bash
npm run dev                      # terminal 1 — serves on 5173
node scripts/validation/phase16-check.cjs
node scripts/validation/phase16-runtime-check.cjs

npm run build && npm run preview # terminal 1 — serves on 4173
node scripts/validation/phase16-production-check.cjs
```

## Caveat

Each script pins the selectors and routes that existed when its phase landed.
Several assert on chrome that has since moved (for example the identity block is
now the sidebar footer rather than a topbar user menu), so a phase script may fail
against today's UI while the feature itself is healthy. Treat a failure as a prompt
to re-read the script, not as a product defect.

## Known-stale assertions (re-checked 2026-10)

These are recorded so a future reader does not mistake them for regressions:

- `phase16-check.cjs` expects `/sites` to be the canonical home and waits for
  `location.pathname === '/sites'`. `/sites` is now a compatibility redirect to
  `/workspaces`, so the script times out on that wait. Roughly eight assertions
  encode the old home route and would need updating together.
- `phase11-check.cjs` … `phase15-check.cjs` pin pre-redesign UI. They are kept
  for reference only; `phase11`–`phase13` additionally need an external
  `playwright-core` via `PLAYWRIGHT_MODULE`.
- `phase16-runtime-check.cjs` is current and passes.
- `phase16-production-check.cjs` passes all of its route/viewport checks, then
  fails its final "no console errors" assertion in headless Chromium: `three`
  logs `WebGLRenderer: A WebGL context could not be created` because headless
  has no GPU. `HourglassVortex` catches that failure and renders its CSS
  fallback, so the page is correct — the noise comes from the library, not the
  app. Treat that one assertion as environment-only.

`phase16-runtime-check.cjs` and `phase16-production-check.cjs` also require the
Vite server to be reachable as `localhost`; the scripts use that name rather
than `127.0.0.1` because Vite may bind IPv6 only.

See [`docs/phase16-readiness.md`](../../docs/phase16-readiness.md) for the results
recorded when these ran.
