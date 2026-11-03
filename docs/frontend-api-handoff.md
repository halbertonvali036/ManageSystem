# SiteBuilder — Frontend → Backend API Handoff

Reference for the backend developer connecting the existing frontend.

The product is a **website builder**: people create a site project, edit pages in
a visual editor, manage domains and deployments inside a workspace, and are
billed per plan. The frontend service layer is complete and does **not** require
any particular backend framework — these are the contracts it already
understands.

Every path below is relative to `VITE_API_BASE_URL`. Nothing is hardcoded in
components; every service reads `config.api.baseUrl`.

## Final status (verified 2026-11)

- The frontend service layer is complete and ready to consume a real API.
- **Bearer-token transport is implemented.** `httpClient` attaches
  `Authorization: Bearer <token>` to every request that is not a public auth
  endpoint. Public auth endpoints (`/auth/login`, `/auth/register`,
  `/auth/forgot-password`, `/auth/reset-password`, `/auth/verify-email`,
  `/auth/resend-verification`, OAuth start/callback) stay anonymous. A 401 on an
  authenticated request clears the stored session and redirects to
  `/session-expired`; a 401 from `/auth/login` means bad credentials and never
  expires an existing session. Tokens are never logged or attached to errors.
- Sign-in and registration are **backend-only**. Demo auth has been removed: the
  frontend ships no demo accounts, mock tokens or fallback sessions, and refuses
  to sign in without a connected backend. `VITE_ENABLE_DEMO_AUTH` is kept only
  as a disabled configuration flag and has no effect.
- Registration (`authService.register`) posts to `POST /auth/register` with
  `{ name, surname, email, password }` and never sends a role. The endpoint
  returns `200 { message }`; the UI shows that message rather than claiming a
  verification email unless the backend asks for verification explicitly.
- Admin is a separate internal role reachable only through the unlinked
  `/admin/login` route. It is never linked from the landing page, public sign-in
  or registration, and public registration cannot create an admin account. The
  admin role must come from the backend session (`user.role === 'admin'`); the
  frontend never grants admin based on an email address.
- **Client-side route guards and role checks are UI isolation, not security.**
  The backend must enforce every authorization rule. See
  `src/utils/roles.js` and `src/models/workspacePermission.js`.

## Conventions (already implemented client-side)

- **Single HTTP client** — `src/services/httpClient.js`. Exports
  `httpClient.get/post/put/patch/delete/upload`. `upload` drops the JSON
  content type so the browser sets the multipart boundary.
- **Error taxonomy** — `RequestError` carries `{ status, code, data, message }`.
  `codeForStatus` maps 400→`UNKNOWN`, 401→`UNAUTHORIZED`, 403→`FORBIDDEN`,
  404→`NOT_FOUND`, 409→`CONFLICT`, 422→`VALIDATION`, 5xx→`SERVER`; a network
  failure produces `NETWORK`. Helpers `getRequestErrorCode` and
  `getRequestErrorMessage` give a stable code plus a localised-safe default
  message. Reuse — do not duplicate.
- **Error body** — the client reads `data.message` for the thrown message and
  keeps the whole parsed body on `error.data`. **Return `{ message, errors? }`**
  where `errors` maps field→message or field→string[].
- **Response unwrapping** — services accept a bare array/object *or* an
  enveloped `{ data }` / `{ items }` response (`response?.data ?? response`).
  Either shape works.
- **204 / empty body** — handled and returned as `null`.
- **Not connected** — with an empty `VITE_API_BASE_URL`, `httpClient` throws
  `BackendNotConnectedError` before any fetch. Reads render honest empty states
  and writes render an explicit "integration unavailable" state.
- **No fake data anywhere.** No seeded projects, prices, invoices, users,
  submissions or successful requests. Mutations refuse rather than simulate.
- **No frontend conflict engine.** 409/422/field errors are surfaced to the
  user, never auto-resolved.
- **Identity is server-derived.** The frontend never sends a user id for "me"
  reads. Roles come back from the session.

## Per-resource contract

### Auth — `src/services/authService.js`

| Method | Request |
| --- | --- |
| `login` | `POST /auth/login` `{ email, password }` → `{ token, user: { id, name, email, role } }` |
| `logout` | client-side only (clears storage); add an endpoint if you need server revocation |
| `register` | **not implemented** — always refuses |
| `forgotPassword` | `POST /auth/forgot-password` `{ email }` |
| `resetPassword` | `POST /auth/reset-password` `{ token, newPassword }` |
| `resendVerification` | `POST /auth/resend-verification` `{ email }` |
| `beginGoogleLogin` | `POST /auth/oauth/google/start` `{ intent, returnTo }` → `{ authorizationUrl }` |
| `handleOAuthCallback` | `POST /auth/oauth/google/callback` `{ code, state }` |
| `linkGoogleAccount` | `POST /auth/oauth/google/link` `{ intent, returnTo }` → `{ authorizationUrl }` |

`role` must be one of the values in `src/utils/roles.js`; an unknown role causes
the client to discard the session. `intent` is a routing hint only — the backend
still decides which account and role the caller ends up with. The returned
`authorizationUrl` is host-validated against Google's domains before redirect.

### Workspaces — `workspaceService.js`

`GET /workspaces` · `POST /workspaces` · `GET /sites or /activity or /deployments` ·
`PUT /sites or /activity or /deployments` · `DELETE /sites or /activity or /deployments` ·
`POST /sites or /activity or /deployments`

### Sites — `siteService.js`

`GET /sites` (filters `search`, `status`, …) · `GET /sites/:id` ·
`POST /sites` · `PUT /sites/:id` · `DELETE /sites/:id` ·
`POST /sites/:id/duplicate`

#### `POST /sites` — create a project

The create wizard sends exactly this body. `toCreateSitePayload` in
`src/services/siteService.js` is the single place that names these fields, so a
backend rename is a one-line change there and nowhere else.

```json
{
  "name": "Acme Studio",
  "slug": "acme-studio",
  "templateId": "saas-starter",
  "themePresetId": "aurora",
  "content": {
    "siteName": "Acme Studio",
    "tagline": "Calm websites, shipped fast",
    "heroTitle": "We build calm websites",
    "heroSubtitle": "A small senior team",
    "ctaLabel": "Start a project",
    "aboutText": "We have been building for a decade.",
    "email": "hello@acme.test",
    "phone": "+1 555 0100",
    "address": "12 Market Street, Baku"
  }
}
```

- `name`, `slug`, `templateId` and `themePresetId` are always sent.
- `content` is **optional and always present as an object**. It may be `{}` when
  the visitor skipped the information step.
- `content` contains **only trimmed, non-empty fields**: empty strings are
  omitted, not sent. The accepted keys are
  `siteName`, `tagline`, `heroTitle`, `heroSubtitle`, `ctaLabel`, `aboutText`,
  `email`, `phone`, `address`.
- `content` is plain text. `aboutText` is capped at 1000 characters and every
  other field at 120; the frontend validates email and phone before sending.
- Unknown `content` keys may be ignored safely. The backend should not fail a
  create request because a key it does not use yet is present.
- `201` should return the created site (`id` at minimum). The wizard then seeds
  the first draft (see below) and routes to `/sites/:id`.

**Duplicate slug.** The frontend treats a duplicate URL as either `409` or
`422`, and also recognises a plain `message` saying the slug/subdomain already
exists. Prefer `409` (or `422` with `errors.slug`) with a user-readable
`message`; the frontend shows it under the slug field and returns to step 1.

**Error format shown on the create step.** Return the shared error body:

```json
{
  "message": "Validation failed",
  "errors": {
    "name": ["A project name is required."],
    "slug": ["This URL is already taken."],
    "email": ["Enter a valid email address."]
  }
}
```

- Each `errors` value is a `string[]`; the frontend shows the **first** item.
- The frontend maps `title` → `name` and `subdomain` → `slug`. Content keys
  (`siteName`, `tagline`, `heroTitle`, `heroSubtitle`, `ctaLabel`, `aboutText`,
  `email`, `phone`, `address`) keep their names.
- A `name`/`slug` error sends the wizard back to step 1; a content error sends it
  to step 3. The first offending field is focused.
- Errors on keys the form does not know are ignored as field errors, and the
  top-level `message` is shown in the form error area instead.
- `500` and network failures show `message` when present, otherwise the client's
  default `SERVER`/`NETWORK` message. A `400` with a plain `message` is shown as
  is. The generic "Could not create" copy is used only when neither exists.
- `409`/`422` duplicate slug has no special body requirement beyond `message`;
  without it the frontend falls back to its own "URL already taken" copy.

### Editor draft & site settings

- `GET|PUT /sites/:siteId/draft` — `siteEditorService.js`. Round-trips the whole
  normalized editor document, including theme tokens, motion metadata and form
  blocks.
- **Draft seeding after create.** Once `POST /sites` returns an id, the wizard
  immediately calls `PUT /sites/:siteId/draft` with a document built from the
  chosen template plus the visitor's `content`, so the editor opens
  personalized instead of on sample copy. `applySiteContent` is pure: it never
  removes or reorders sections, and leaves sample copy where the visitor left a
  field blank. A field with no matching slot in that template (for example
  `aboutText` in a template without an about band) is simply not written.
  A failed seed is not fatal — the project exists, the wizard stays on the
  project's details page with a notice, and the personalized draft is kept in
  `sessionStorage` so the editor can apply it once on open and mark the document
  **UNSAVED** until the visitor saves.
- The backend needs no extra endpoint for seeding: a successful `PUT` plus a
  subsequent `GET` returning the same document is enough.
- `GET|PUT /sites/:siteId/settings` — `siteSettingsService.js`. Publication
  status is **read-only** and is deliberately omitted from the mutation payload.

### Publishing — `src/services/sitePublishService.js`

**Intentionally has no endpoints.** `publishSite`, `unpublishSite`,
`getPublishStatus` and `getPublishedUrl` always refuse
(`BackendNotConnectedError`) even when an API URL *is* configured. Reads return
unknown status and a `null` published URL. Real deployment work goes through
`deploymentService` below; do not invent publishing endpoints.

### Deployments — `deploymentService.js`

`GET /sites or /activity or /deployments` (filters `siteId`, `status`) ·
`GET /sites or /activity or /deployments` ·
`POST /sites or /activity or /deployments` ·
`POST .../deployments/:deploymentId/redeploy` · `/rollback` · `/stop` ·
`GET /sites or /activity or /deployments` (deployable sites)

### Domains — `domainService.js`

`GET /sites or /activity or /deployments` ·
`POST /sites or /activity or /deployments` ·
`GET|DELETE /sites or /activity or /deployments` ·
`POST .../domains/:domainId/verify` · `POST .../domains/:domainId/primary`

DNS record values are supplied by the backend; the UI never invents them.
Statuses: `unconfigured | pending | connected | error` (SSL: `unconfigured |
pending | active | error`).

### Database / schema builder — `databaseService.js`

`GET|POST /sites or /activity or /deployments` ·
`GET|PUT|DELETE .../models/:modelId` ·
`GET|POST .../models/:modelId/records` ·
`GET|PUT|DELETE .../models/:modelId/records/:recordId`

### Members — `memberService.js`

`GET|POST /sites or /activity or /deployments` ·
`GET|PATCH|DELETE .../members/:memberId` ·
`POST .../members/:memberId/invite/resend`

Invite is a `POST` to the collection. Role updates use `PATCH` with `{ role }`.

### Capabilities — `capabilityService.js`

`GET /sites or /activity or /deployments` ·
`GET /sites or /activity or /deployments` ·
`POST .../capabilities/:capabilityId/enable` · `/disable` ·
`PUT .../capabilities/:capabilityId` (config, body `{ config }`)

### Integrations — `integrationService.js`

`GET /sites or /activity or /deployments` ·
`GET /sites or /activity or /deployments` ·
`POST .../integrations/:integrationId/connect` · `/disconnect` ·
`PUT .../integrations/:integrationId` (config)

### Activity & usage — `activityService.js`

`GET /sites or /activity or /deployments` · `GET .../usage` · `GET .../usage/limits`
· `GET /admin/audit` (platform-wide, admin scope)

### AI assistant — `aiService.js`

`GET /sites or /activity or /deployments` ·
`GET .../conversations/current` · `.../conversations/:conversationId` ·
`GET .../ai/suggestions` · `POST .../conversations/messages` ·
`POST .../ai/actions`

Reads append a context query string (site/domain scope) via `buildAiContext`;
honour it as a filter and echo it back in the response shape the client expects.

### Account security — `accountSecurityService.js`

`GET /account/security` · `POST /account/security/password` ·
`POST /account/security/verification-email` ·
`GET /account/security/sessions` · `DELETE /account/security/sessions/:sessionId`
· `POST /account/security/sessions/revoke-others` ·
`GET /account/security/activity`

### Billing — `billingService.js`

`GET /billing` · `GET /billing/plans` · `GET /billing/payment-methods` ·
`GET /billing/invoices` · `GET /billing/invoices/:invoiceId/receipt` ·
`POST /billing/checkout-session` · `POST /billing/portal-session` ·
`POST /billing/subscription` · `POST /billing/subscription/resume` ·
`POST /billing/payment-methods` ·
`POST /billing/payment-methods/:paymentMethodId/default` ·
`DELETE /billing/payment-methods/:paymentMethodId`

Checkout/portal sessions are expected to return a provider URL to redirect to,
the same shape as the OAuth authorization URL.

### Notifications — `notificationsService.js`

`GET /notifications` (filters `category`) · `GET /notifications/unread-count` ·
`PATCH /notifications/:id/read` · `POST /notifications/read-all` ·
`GET|PATCH /notifications/preferences`

### Support — `supportService.js`

`POST /support/requests`

### Users (admin) — `usersService.js`

`GET /users` (filters `search`, `status`, …) · `GET /users/:id` ·
`POST /users` · `PUT /users/:id` · `DELETE /users/:id` ·
`POST /users/:id/activate` · `POST /users/:id/deactivate`

### Admin collections — `adminPlatformService.js`

`GET /admin/:section` where `section` ∈ `users | websites | templates | billing |
domains | notifications | support | audit` (see `ADMIN_COLLECTIONS` in
`src/models/adminPlatform.js`, which also defines each table's columns). `users`
routes through `usersService` instead.

## Backend-side requirements

- **Return errors as** 401/403/404/409/422 with `{ message, errors? }` where
  `errors` maps field→message or field→string[] (e.g. `email`, `hostname`,
  `name`, `role`). The client surfaces these verbatim.
- **Enforce authorization server-side.** `role` on the session drives UI only.
  Workspace membership and per-capability permission checks must be enforced on
  every scoped endpoint.
- **Agree the auth transport** (bearer header vs. cookie session) before real
  accounts are enabled. The client is ready for either; it currently sends
  neither credential.
- **Do not invent endpoints** beyond those listed. The client short-circuits to
  honest states for anything not yet built, so partial rollout is safe.

## Backend work still outstanding

Server persistence for sites/editor drafts/media · publishing and hosting ·
form submission delivery and storage (see `src/services/siteFormService.js`,
which deliberately always refuses) · payments ·
Google sign-in completion.
