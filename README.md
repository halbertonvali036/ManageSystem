# SiteBuilder (Frontend)

Responsive React frontend for a website-builder product: create a website
project, customize pages in the visual editor, preview a local draft, and review
publishing readiness.

`SiteBuilder` is a temporary, neutral working name. Application components read the product name from `APP_NAME` in
`src/utils/constants.js`; the static document title and favicon label also need
updating when a final brand is decided.

## Current phase

The frontend includes the public product surface, authenticated workspace,
template wizard, visual page editor, navigation, local media, forms, site themes,
settings, preview, and publishing readiness UI. Local drafts are session-scoped;
empty states remain honest when project data is unavailable.

Deliberately **not** implemented yet, because each needs a backend contract
first:

- server persistence for projects, editor drafts and media
- live publishing, domains and hosting
- form delivery and submission storage
- payments and plan purchase
- QR pairing and Google sign-in completion
- the mobile app

Where a feature is missing the UI says so instead of faking it. Nothing in the
app invents a website project, price, discount or successful request.

## Product areas

- **Public** — landing page, pricing, sign-in, registration, language and
  theme controls.
- **Workspace** — dashboard, site list, Create Website (`/sites/new`), editor,
  site settings, Templates and per-workspace applications.
- **Account** — Profile, Security, Plan & Billing, Notifications, Support. Google
  and QR sign-in are frontend-ready entry points that stay disabled until the
  backend is connected.

## Roles

- A normal public account is a platform **user**. Sign-up and sign-in never ask
  for a role: authentication decides it.
- **Admin** is a separate internal role. It is reachable only through the
  unlinked `/admin/login` development entry and is never self-registered.
- Client-side route guards are UI isolation, not security: the backend must
  enforce every authorization rule.

## Localization

- Azerbaijani (`az`) is the default; English (`en`) is secondary.
- One `LocaleProvider` owns the active language. Components read words through
  `useTranslation()` rather than hardcoding labels.
- `index.html` sets `lang` before first paint so assistive technology sees the
  right locale from the first frame.

## Theming

Dark is the default expression. Light is a deliberate alternative, not a
fallback. A saved preference always wins over the default. Colors resolve
through the tokens in `src/styles/theme.css`; the neon dark palette is built on
`#39ff14` over deep green-black surfaces with restrained glow.

## Tech stack

- React 19 + Vite
- React Router v7
- Lucide icons
- Oxlint (linting)
- No CSS framework; custom CSS in `src/styles`

## Folder structure

```
src/
  components/   Shared + feature components (sites, landing, layout, auth)
  config/       App config (API base URL from env)
  context/      React contexts (auth, locale, theme)
  hooks/        Data hooks (useWebsites, useAuth, ...)
  i18n/         Locale provider, dictionaries (az, en)
  layouts/      Workspace, editor, auth, billing and security layouts
  models/       Domain constants, validation and formatters
  pages/        Route-level pages
  routes/       Route definitions and guards
  services/     HTTP client + per-resource API services
  styles/       Global, theme and portal stylesheets
  utils/        Validation, role guards, constants
docs/
  frontend-api-handoff.md   API contract notes for the backend developer
scripts/
  validation/   Archived browser smoke harnesses (not part of the build)
```

## Setup

Use Node.js 22.12+ (validated with 22.20.0) and npm.

```bash
npm ci
```

## Environment variable

Copy `.env.example` to `.env` and set the API base URL:

```bash
VITE_API_BASE_URL=https://api.example.com
```

Leave it empty (the default) while the backend is unavailable. Reads then
return empty lists and writes refuse with an explicit "not connected" state
rather than reporting false success.

## Scripts

```bash
npm run dev    # start the Vite dev server
npm run lint   # run Oxlint
npm run build  # production build to dist/
npm run preview # local check of dist/; not a production server
```

## Backend status

The backend is a separate deliverable. All data flows through `src/services`
using `VITE_API_BASE_URL`; there is no bundled backend and no fake data.

## Development authentication

With an empty API URL, `authService` allows local accounts only in Vite
development mode (`npm run dev`). Production builds exclude these credentials,
reject saved demo tokens, and require the authentication backend. A configured
API URL sends sign-in to `/auth/login`; registration remains unavailable pending
its backend contract. They are never displayed on a public screen: the public
sign-in shows no credentials and public registration creates no role. The
`/admin/login` entry is unlinked from the public site. These accounts must be
removed once real authentication is available.


## Deployment handoff

Deploy the contents of `dist/` to a static host at the origin root (`/`). No
hosting platform is selected, so no provider-specific configuration is included.
Subdirectory hosting is not configured: it would require coordinated Vite base,
router basename and asset-path changes.

- Configure the host to serve existing assets normally and internally rewrite
  other application routes to `/index.html` with HTTP 200. Preserve the requested
  path and query string. Test direct loads and refreshes of `/login`, `/sites`,
  `/sites/<siteId>/editor`, `/sites/<siteId>/settings` and `/admin/login`.
- Exclude API paths and missing static assets from the HTML fallback; they should
  return their actual response/404. Unknown application paths use the app's 404.
- Revalidate `index.html` on every deployment; hashed `/assets/*` can be cached
  immutably. Deploy HTML and assets together and retain old hashed assets during
  rollouts so open sessions can still load lazy routes.
- Set `VITE_API_BASE_URL` before building (an HTTPS API URL, optionally including
  a path prefix, or a same-origin prefix such as `/api`). Environment changes
  require a rebuild. Every `VITE_` value is public: never use secrets or private
  credentials. `.env.example` lists all optional configuration values.
- Leave publishing-domain and companion-app values blank until those services
  exist. Setting them does not enable hosting, publishing or a mobile app.
- The backend must agree on authentication transport and enforce authorization.
  The shared client currently does not attach a bearer token or enable
  cross-origin cookies. API CORS/session integration must be validated before
  enabling real accounts; client-side role guards are not server authorization.
- Fonts use Google Fonts with a local sans-serif fallback. A restrictive CSP
  must account for those origins and the two inline theme/locale bootstrap
  scripts (use hashes); blocking the bootstrap can cause a theme flash.
- Production source maps are disabled by Vite's default. No PWA is configured.

The static frontend can be deployed for review. A functioning public service
still requires real authentication, registration, project persistence and the
other backend integrations listed above. `/admin/login` is an unlinked internal
entry; its prefilled demo account exists only in development. Public navigation
never exposes Admin or a role selector.

## Frontend smoke checks

`npm run lint` and `npm run build` are the maintained checks, and there is no
unit-test runner. The archived per-phase browser harnesses live in
[`scripts/validation`](scripts/validation) with their own README. The one that
matches today's UI is:

```bash
npm run dev                                          # terminal 1 — serves on 5173
node scripts/validation/phase16-runtime-check.cjs     # passes
```

It uses a local Chromium executable (set `CHROMIUM_PATH` if needed), writes
screenshots to the OS temporary directory and adds no project dependency. The
older harnesses pin the UI of the phase that wrote them; `scripts/validation/README.md`
lists the specific assertions that are known to be stale, so read that before
treating a failure there as a defect.

See [Phase 16 validation](docs/phase16-readiness.md) for the recorded results.

