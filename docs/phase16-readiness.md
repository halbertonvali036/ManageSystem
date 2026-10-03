# Phase 16 deployment readiness

Validated on 2026-09-28 with Node 22.20.0 and local Chromium.

## Deployment decision

Ready to deploy as a static frontend for review, once the host implements the
SPA fallback described in README. Not ready to operate as a complete public
website-building service: real authentication transport, registration, project
persistence, publishing and domain services are still backend dependencies.
No backend or publishing implementation was added.

## Configuration and routing

- All application environment reads use Vite configuration (`VITE_` values,
  plus Vite's built-in `DEV` flag). `.env.example` contains empty public values
  for API base URL, platform base domain and the optional companion-app link.
  No private environment values were found. Environment variants are ignored.
- Services share `src/config/index.js` and `httpClient`. API base URLs now have
  whitespace and trailing slashes removed. The client refuses to fetch when
  no API URL is configured; existing service-level empty states remain intact.
- No hardcoded localhost service endpoints were found. React Router contains
  a library-internal localhost URL parsing fallback; it is not an API endpoint.
- Relative source imports were checked for resolution and exact filename case.
  Production compilation resolves all route imports. The favicon exists.
- No hosting platform is selected. README specifies origin-root hosting,
  index.html fallback, asset/API exclusions, caching and direct-route checks.
  Local preview verifies deep links; the actual host rewrite is unverified
  until a deployment target exists.

## Product, assets and bundle

- The existing neutral SiteBuilder title and favicon are retained. No legacy
  document title or unused image assets remain. The description now describes
  draft creation and preview without promising working publishing.
- The only public asset is the referenced favicon. No unused image assets or
  dependencies needed removal.
- Production dependency inspection finds one deduplicated React/React DOM
  installation, React Router and Lucide. No new dependencies were introduced.
- Main JavaScript: 463.43 KB / 145.99 KB gzip. Shared CSS: 360.41 KB / 52.25 KB
  gzip. Site Settings CSS is loaded with its route: 5.96 KB / 1.35 KB gzip.
  Shared CSS is sizeable but still supports Admin; no risky style purge or
  architecture change was attempted.
- Production output has no source maps or demo credentials. The only app
  console logging is the useful caught-error report; no ordinary-flow debug
  noise was found.

## Behavior and accessibility

- Error fallback and 404 copy now support Azerbaijani and English. Navigating
  from the error boundary recovers the destination without remounting healthy
  routes. Technical error details remain development-only.
- Reading a saved auth session safely handles unavailable browser storage.
  Demo login still works in development; production rejects demo credentials
  and saved demo tokens. `/admin/login` stays unlinked. Internal `/admin` and
  `/admin/users` routes were exercised as Admin.
- Azerbaijani is the first-load default. Actual language/theme switch buttons
  were exercised and their English/light preferences verified after reload.
  Theme attributes initialize before React; the saved light theme now also
  initializes the browser theme-color correctly. Website theme previews remain
  independent from builder chrome.
- Site Settings was missing styling for its existing component classes.
  A scoped, responsive stylesheet now supplies spacing, cards, navigation,
  fields and media previews using existing builder tokens.
- Confirmation dialogs trap keyboard focus and restore it when closed.
  Escape and recovery-link navigation were tested. Light secondary text now
  has 4.89:1 contrast on the main light background and 4.73:1 on the alternate
  light surface (previous main-background ratio: 3.87:1).

## Validation

| Check | Result |
| --- | --- |
| `npm run lint` | PASS, no warnings |
| `npm run build` | PASS, 2,383 transformed modules |
| `node scripts/validation/phase16-check.cjs` | PASS, no findings or unexpected console errors |
| `node scripts/validation/phase16-production-check.cjs` | PASS, public deep links, 404, guards and production auth checks |
| `node scripts/validation/phase16-runtime-check.cjs` | PASS, backend guard, error recovery, dialog focus, UI preference persistence and final settings layout |

Responsive coverage at **1440, 1024, 768 and 375 px**: Landing, Login, Register,
My Websites, Create Website, Editor, Site Settings, Preview and Admin Login.
Additional workspace/account/Admin routes were checked. Scans found no page
overflow, unnamed visible inputs/buttons, clipped dialogs or missing builder
translation keys. Screenshots were inspected, including the settings screen
before and after its stylesheet was added.

The phase16 suite extends the existing phase15 browser workflows. There is no
separate npm test script or unit-test runner. Chromium smoke tests use a fresh
temporary profile and write screenshots/results to the OS temporary directory.
External font requests are blocked in the final scripts to make runs independent
of network delays and exercise the local font fallback. This is a smoke review,
not a full screen-reader audit or an exhaustive contrast/browser certification.

## Files changed or added

- Environment/handoff: `.env.example`, `.gitignore`, `README.md`,
  `docs/phase16-readiness.md`, `index.html`.
- API/auth: `src/config/index.js`, `src/services/httpClient.js`,
  `src/services/authService.js`.
- Recovery/localization: `src/components/errors/RouteErrorBoundary.jsx`,
  `src/components/errors/ErrorFallback.jsx`, `src/pages/NotFoundPage.jsx`,
  `src/i18n/auditLocales.js`.
- Accessibility/styles: `src/components/common/ConfirmDialog.jsx`,
  `src/components/editor/ConfirmDialog.jsx`, `src/styles/theme.css`,
  `src/pages/SiteSettingsPage.jsx`, `src/styles/site-settings.css`.
- Checks: `scripts/validation/phase16-check.cjs`,
  `scripts/validation/phase16-production-check.cjs`,
  `scripts/validation/phase16-runtime-check.cjs`,
  `scripts/validation/phase16-runtime-fixture.js`.

`dist/` was regenerated. No Git commands, parallel agents, dependency changes,
backend, hosting service, PWA, real domains or builder features were introduced.
