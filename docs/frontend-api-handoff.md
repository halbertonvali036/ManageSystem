# SiteBuilder — Frontend → Backend API Handoff

Reference for the backend developer connecting the existing frontend.

The product is a **website builder**: people create a site project, edit pages in
a visual editor, manage domains and deployments inside a workspace, and are
billed per plan. The frontend service layer is complete and does **not** require
any particular backend framework — these are the contracts it already
understands.

Every path below is relative to `VITE_API_BASE_URL`. Nothing is hardcoded in
components; every service reads `config.api.baseUrl`.

## Final status (verified 2026-10)

- The frontend service layer is complete and ready to consume a real API.
- **Authentication transport is not yet settled.** `httpClient` sends only
  `Content-Type: application/json`. It attaches **no bearer token** and does
  **not** set `credentials: 'include'`. The backend team and frontend must agree
  on one transport before real accounts are enabled.
- Sign-in is mock/demo **only in Vite dev mode** (`import.meta.env.DEV`). A
  production build has an empty demo account list, refuses any request to
  `authService.login` without a connected backend, and discards saved sessions
  that carry the demo token. **Remove the demo accounts when real auth lands.**
- Registration (`authService.register`) always throws
  `BackendNotConnectedError` until a registration contract is agreed.
- Admin is a separate internal role reachable only through the unlinked
  `/admin/login` route. It is never linked from the landing page, public sign-in
  or registration, and public registration cannot create an admin account.
- **Client-side route guards and role checks are UI isolation, not security.**
  The backend must enforce every authorization rule. See
  `src/utils/roles.js` and `src/models/workspacePermission.js`.

## Conventions (already implemented client-side)

- **Single HTTP client** — `src/services/httpClient.js`. Exports
  `httpClient.get/post/put/patch/delete/upload`. `upload` drops the JSON
  content type so the browser sets the multipart boundary.
- **Error taxonomy** — `RequestError` carries `{ status, code, data, message }`.
  `codeForStatus` maps 400→`UNKNOWN`, 401→`UNAUTHORIZED`, 403→`FORBIDDEN`,
  404→`NOT_FOUND`, 422→`VALIDATION`, 5xx→`SERVER`; a network failure produces
  `NETWORK`. Helpers `getRequestErrorCode` and `getRequestErrorMessage` give a
  stable code plus a localised-safe default message. Reuse — do not duplicate.
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

`GET /workspaces` · `POST /workspaces` · `GET /workspaces/:id` ·
`PUT /workspaces/:id` · `DELETE /workspaces/:id` ·
`POST /workspaces/:workspaceId/sites`

### Sites — `siteService.js`

`GET /sites` (filters `search`, `status`, …) · `GET /sites/:id` ·
`POST /sites` · `PUT /sites/:id` · `DELETE /sites/:id` ·
`POST /sites/:id/duplicate`

### Editor draft & site settings

- `GET|PUT /sites/:siteId/draft` — `siteEditorService.js`. Round-trips the whole
  normalized editor document, including theme tokens, motion metadata and form
  blocks.
- `GET|PUT /sites/:siteId/settings` — `siteSettingsService.js`. Publication
  status is **read-only** and is deliberately omitted from the mutation payload.

### Publishing — `src/services/sitePublishService.js`

**Intentionally has no endpoints.** `publishSite`, `unpublishSite`,
`getPublishStatus` and `getPublishedUrl` always refuse
(`BackendNotConnectedError`) even when an API URL *is* configured. Reads return
unknown status and a `null` published URL. Real deployment work goes through
`deploymentService` below; do not invent publishing endpoints.

### Deployments — `deploymentService.js`

`GET /workspaces/:workspaceId/deployments` (filters `siteId`, `status`) ·
`GET /workspaces/:workspaceId/deployments/:deploymentId` ·
`POST /workspaces/:workspaceId/deployments` ·
`POST .../deployments/:deploymentId/redeploy` · `/rollback` · `/stop` ·
`GET /workspaces/:workspaceId/sites` (deployable sites)

### Domains — `domainService.js`

`GET /workspaces/:workspaceId/domains` ·
`POST /workspaces/:workspaceId/domains` ·
`GET|DELETE /workspaces/:workspaceId/domains/:domainId` ·
`POST .../domains/:domainId/verify` · `POST .../domains/:domainId/primary`

DNS record values are supplied by the backend; the UI never invents them.
Statuses: `unconfigured | pending | connected | error` (SSL: `unconfigured |
pending | active | error`).

### Database / schema builder — `databaseService.js`

`GET|POST /workspaces/:workspaceId/database/models` ·
`GET|PUT|DELETE .../models/:modelId` ·
`GET|POST .../models/:modelId/records` ·
`GET|PUT|DELETE .../models/:modelId/records/:recordId`

### Members — `memberService.js`

`GET|POST /workspaces/:workspaceId/members` ·
`GET|PATCH|DELETE .../members/:memberId` ·
`POST .../members/:memberId/invite/resend`

Invite is a `POST` to the collection. Role updates use `PATCH` with `{ role }`.

### Capabilities — `capabilityService.js`

`GET /workspaces/:workspaceId/capabilities` ·
`GET /workspaces/:workspaceId/capabilities/:capabilityId` ·
`POST .../capabilities/:capabilityId/enable` · `/disable` ·
`PUT .../capabilities/:capabilityId` (config, body `{ config }`)

### Integrations — `integrationService.js`

`GET /workspaces/:workspaceId/integrations` ·
`GET /workspaces/:workspaceId/integrations/:integrationId` ·
`POST .../integrations/:integrationId/connect` · `/disconnect` ·
`PUT .../integrations/:integrationId` (config)

### Activity & usage — `activityService.js`

`GET /workspaces/:workspaceId/activity` · `GET .../usage` · `GET .../usage/limits`
· `GET /admin/audit` (platform-wide, admin scope)

### AI assistant — `aiService.js`

`GET /workspaces/:workspaceId/ai/conversations` ·
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
`GET /account/security/activity` ·
`POST /account/security/two-factor/setup` · `/setup/confirm` · `/disable` ·
`POST /account/security/qr-login` · `GET|DELETE /account/security/qr-login/:sessionId`

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
which deliberately always refuses) · payments · QR pairing completion ·
Google sign-in completion.