# SiteBuilder (Frontend)

Responsive React frontend for a website-builder product: create a website
project, customize pages in the visual editor, preview a local draft, and review
publishing readiness.

`SiteBuilder` is a temporary, neutral working name. Every visible surface reads
the product name from `APP_NAME` in `src/utils/constants.js`, so it can be
replaced in one place once a real brand is decided.

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
- **Workspace** — dashboard, My Websites, Create Website (`/sites/new`),
  Templates.
- **Account** — Profile, Security, Plan & Billing, Notifications. Google and
  QR sign-in are frontend-ready entry points that stay disabled until the
  backend is connected.

## Roles

- A normal public account is a platform **user**. Sign-up and sign-in never ask
  for a role: authentication decides it.
- **Admin** is a separate internal role. It is reachable only through the
  unlinked `/admin/login` development entry and is never self-registered.
- Academic administration remains internal to Admin. Retired Teacher/Student
  portal routes redirect to the website workspace; they are not public product
  areas. Shared components used by Admin remain supported.

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
```

## Setup

```bash
npm install
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
```

## Backend status

The backend is a separate deliverable. All data flows through `src/services`
using `VITE_API_BASE_URL`; there is no bundled backend and no fake data.

## Development authentication

Authentication is not connected to a backend yet, so `authService` holds local
development accounts. They are never displayed on a public screen: the public
sign-in shows no credentials and public registration creates no role. The
`/admin/login` entry is unlinked from the public site. These accounts must be
removed once real authentication is available.
