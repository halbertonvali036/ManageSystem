# SiteBuilder â€” Frontend â†’ Backend API Handoff

Reference for the backend developer connecting the existing frontend.

The product is a **website builder**: people create a site project, edit pages in
a visual editor, manage domains and deployments inside a workspace, and are
billed per plan. The frontend service layer is complete and does **not** require
any particular backend framework â€” these are the contracts it already
understands.

Every path below is relative to `VITE_API_BASE_URL`. Nothing is hardcoded in
components; every service reads `config.api.baseUrl`.

## Final status (verified 2026-10)

- The frontend service layer is complete and ready to consume a real API.
- **Authentication transport is not yet settled.** `httpClient` sends only
  `Content-Type: application/json`. It attaches **no bearer token** and does
  **not** set `credentials: 'include'`. The backend team and frontend must agree
  on one transport before real accounts are enabled.
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

- **Single HTTP client** â€” `src/services/httpClient.js`. Exports
  `httpClient.get/post/put/patch/delete/upload`. `upload` drops the JSON
  content type so the browser sets the multipart boundary.
- **Error taxonomy** â€” `RequestError` carries `{ status, code, data, message }`.
  `codeForStatus` maps 400â†’`UNKNOWN`, 401â†’`UNAUTHORIZED`, 403â†’`FORBIDDEN`,
  404â†’`NOT_FOUND`, 422â†’`VALIDATION`, 5xxâ†’`SERVER`; a network failure produces
  `NETWORK`. Helpers `getRequestErrorCode` and `getRequestErrorMessage` give a
  stable code plus a localised-safe default message. Reuse â€” do not duplicate.
- **Error body** â€” the client reads `data.message` for the thrown message and
  keeps the whole parsed body on `error.data`. **Return `{ message, errors? }`**
  where `errors` maps fieldâ†’message or fieldâ†’string[].
- **Response unwrapping** â€” services accept a bare array/object *or* an
  enveloped `{ data }` / `{ items }` response (`response?.data ?? response`).
  Either shape works.
- **204 / empty body** â€” handled and returned as `null`.
- **Not connected** â€” with an empty `VITE_API_BASE_URL`, `httpClient` throws
  `BackendNotConnectedError` before any fetch. Reads render honest empty states
  and writes render an explicit "integration unavailable" state.
- **No fake data anywhere.** No seeded projects, prices, invoices, users,
  submissions or successful requests. Mutations refuse rather than simulate.
- **No frontend conflict engine.** 409/422/field errors are surfaced to the
  user, never auto-resolved.
- **Identity is server-derived.** The frontend never sends a user id for "me"
  reads. Roles come back from the session.

## Per-resource contract

### Auth â€” `src/services/authService.js`

| Method | Request |
| --- | --- |
| `login` | `POST /auth/login` `{ email, password }` â†’ `{ token, user: { id, name, email, role } }` |
| `logout` | client-side only (clears storage); add an endpoint if you need server revocation |
| `register` | **not implemented** â€” always refuses |
| `forgotPassword` | `POST /auth/forgot-password` `{ email }` |
| `resetPassword` | `POST /auth/reset-password` `{ token, newPassword }` |
| `resendVerification` | `POST /auth/resend-verification` `{ email }` |
| `beginGoogleLogin` | `POST /auth/oauth/google/start` `{ intent, returnTo }` â†’ `{ authorizationUrl }` |
| `handleOAuthCallback` | `POST /auth/oauth/google/callback` `{ code, state }` |
| `linkGoogleAccount` | `POST /auth/oauth/google/link` `{ intent, returnTo }` â†’ `{ authorizationUrl }` |

`role` must be one of the values in `src/utils/roles.js`; an unknown role causes
the client to discard the session. `intent` is a routing hint only â€” the backend
still decides which account and role the caller ends up with. The returned
`authorizationUrl` is host-validated against Google's domains before redirect.

### Workspaces â€” `workspaceService.js`

`GET /workspaces` Â· `POST /workspaces` Â· `GET /sites or /activity or /deployments` Â·
`PUT /sites or /activity or /deployments` Â· `DELETE /sites or /activity or /deployments` Â·
`POST /sites or /activity or /deployments`

### Sites â€” `siteService.js`

`GET /sites` (filters `search`, `status`, â€¦) Â· `GET /sites/:id` Â·
`POST /sites` Â· `PUT /sites/:id` Â· `DELETE /sites/:id` Â·
`POST /sites/:id/duplicate`

### Editor draft & site settings

- `GET|PUT /sites/:siteId/draft` â€” `siteEditorService.js`. Round-trips the whole
  normalized editor document, including theme tokens, motion metadata and form
  blocks.
- `GET|PUT /sites/:siteId/settings` â€” `siteSettingsService.js`. Publication
  status is **read-only** and is deliberately omitted from the mutation payload.

### Publishing â€” `src/services/sitePublishService.js`

**Intentionally has no endpoints.** `publishSite`, `unpublishSite`,
`getPublishStatus` and `getPublishedUrl` always refuse
(`BackendNotConnectedError`) even when an API URL *is* configured. Reads return
unknown status and a `null` published URL. Real deployment work goes through
`deploymentService` below; do not invent publishing endpoints.

### Deployments â€” `deploymentService.js`

`GET /sites or /activity or /deployments` (filters `siteId`, `status`) Â·
`GET /sites or /activity or /deployments` Â·
`POST /sites or /activity or /deployments` Â·
`POST .../deployments/:deploymentId/redeploy` Â· `/rollback` Â· `/stop` Â·
`GET /sites or /activity or /deployments` (deployable sites)

### Domains â€” `domainService.js`

`GET /sites or /activity or /deployments` Â·
`POST /sites or /activity or /deployments` Â·
`GET|DELETE /sites or /activity or /deployments` Â·
`POST .../domains/:domainId/verify` Â· `POST .../domains/:domainId/primary`

DNS record values are supplied by the backend; the UI never invents them.
Statuses: `unconfigured | pending | connected | error` (SSL: `unconfigured |
pending | active | error`).

### Database / schema builder â€” `databaseService.js`

`GET|POST /sites or /activity or /deployments` Â·
`GET|PUT|DELETE .../models/:modelId` Â·
`GET|POST .../models/:modelId/records` Â·
`GET|PUT|DELETE .../models/:modelId/records/:recordId`

### Members â€” `memberService.js`

`GET|POST /sites or /activity or /deployments` Â·
`GET|PATCH|DELETE .../members/:memberId` Â·
`POST .../members/:memberId/invite/resend`

Invite is a `POST` to the collection. Role updates use `PATCH` with `{ role }`.

### Capabilities â€” `capabilityService.js`

`GET /sites or /activity or /deployments` Â·
`GET /sites or /activity or /deployments` Â·
`POST .../capabilities/:capabilityId/enable` Â· `/disable` Â·
`PUT .../capabilities/:capabilityId` (config, body `{ config }`)

### Integrations â€” `integrationService.js`

`GET /sites or /activity or /deployments` Â·
`GET /sites or /activity or /deployments` Â·
`POST .../integrations/:integrationId/connect` Â· `/disconnect` Â·
`PUT .../integrations/:integrationId` (config)

### Activity & usage â€” `activityService.js`

`GET /sites or /activity or /deployments` Â· `GET .../usage` Â· `GET .../usage/limits`
Â· `GET /admin/audit` (platform-wide, admin scope)

### AI assistant â€” `aiService.js`

`GET /sites or /activity or /deployments` Â·
`GET .../conversations/current` Â· `.../conversations/:conversationId` Â·
`GET .../ai/suggestions` Â· `POST .../conversations/messages` Â·
`POST .../ai/actions`

Reads append a context query string (site/domain scope) via `buildAiContext`;
honour it as a filter and echo it back in the response shape the client expects.

### Account security â€” `accountSecurityService.js`

`GET /account/security` Â· `POST /account/security/password` Â·
`POST /account/security/verification-email` Â·
`GET /account/security/sessions` Â· `DELETE /account/security/sessions/:sessionId`
Â· `POST /account/security/sessions/revoke-others` Â·
`GET /account/security/activity`

### Billing â€” `billingService.js`

`GET /billing` Â· `GET /billing/plans` Â· `GET /billing/payment-methods` Â·
`GET /billing/invoices` Â· `GET /billing/invoices/:invoiceId/receipt` Â·
`POST /billing/checkout-session` Â· `POST /billing/portal-session` Â·
`POST /billing/subscription` Â· `POST /billing/subscription/resume` Â·
`POST /billing/payment-methods` Â·
`POST /billing/payment-methods/:paymentMethodId/default` Â·
`DELETE /billing/payment-methods/:paymentMethodId`

Checkout/portal sessions are expected to return a provider URL to redirect to,
the same shape as the OAuth authorization URL.

### Notifications â€” `notificationsService.js`

`GET /notifications` (filters `category`) Â· `GET /notifications/unread-count` Â·
`PATCH /notifications/:id/read` Â· `POST /notifications/read-all` Â·
`GET|PATCH /notifications/preferences`

### Support â€” `supportService.js`

`POST /support/requests`

### Users (admin) â€” `usersService.js`

`GET /users` (filters `search`, `status`, â€¦) Â· `GET /users/:id` Â·
`POST /users` Â· `PUT /users/:id` Â· `DELETE /users/:id` Â·
`POST /users/:id/activate` Â· `POST /users/:id/deactivate`

### Admin collections â€” `adminPlatformService.js`

`GET /admin/:section` where `section` âˆˆ `users | websites | templates | billing |
domains | notifications | support | audit` (see `ADMIN_COLLECTIONS` in
`src/models/adminPlatform.js`, which also defines each table's columns). `users`
routes through `usersService` instead.

## Backend-side requirements

- **Return errors as** 401/403/404/409/422 with `{ message, errors? }` where
  `errors` maps fieldâ†’message or fieldâ†’string[] (e.g. `email`, `hostname`,
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

Server persistence for sites/editor drafts/media Â· publishing and hosting Â·
form submission delivery and storage (see `src/services/siteFormService.js`,
which deliberately always refuses) Â· payments Â·
Google sign-in completion.
