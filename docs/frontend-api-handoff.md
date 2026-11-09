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
  keeps the whole parsed body on `error.data`. **Return exactly
  `{ message, errors: { field: string[] } }`**; every `errors` value is an array
  of strings and the UI shows the first one.
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

### Sites — `siteService.js` + `models/siteWire.js`

**Base paths.** `SITES_API_PATH = '/api/sites'` and
`TEMPLATES_API_PATH = '/api/templates'` live in `src/utils/constants.js` and are
relative to `VITE_API_BASE_URL`. Auth keeps its own `/auth` paths; router paths
(`/sites`, `/templates`, …) are unrelated and unchanged.

`GET /api/sites` (optional `status`, `search`) · `GET /api/sites/{id}` ·
`POST /api/sites` · `PUT /api/sites/{id}` · `DELETE /api/sites/{id}` ·
`POST /api/sites/{id}/duplicate`

`GET /api/templates`

Every request is Bearer-authenticated by `httpClient`.

#### Site response

`GET /api/sites` returns a **plain array** of summaries. A summary has no
`content` key. `GET /api/sites/{id}` returns the same object **plus `content`**;
`POST` and `PUT` responses also include `content`.

```json
{
  "id": 17,
  "templateId": 4,
  "templateName": "Nova AI",
  "projectName": "Acme Studio",
  "slug": "acme-studio",
  "status": "PUBLISHED",
  "createdAt": "2026-02-03T09:15:30",
  "updatedAt": "2026-02-04T10:20:05",
  "content": {
    "siteName": "Acme Studio",
    "tagline": "Calm websites, shipped fast"
  }
}
```

- Field names and casing are exact: `projectName`, `templateId`, `templateName`,
  `slug`, `status`, `createdAt`, `updatedAt`, `content`.
- `templateId` is the backend's **numeric** template id. The frontend keeps it
  as `backendTemplateId` and maps it to its own string `templateId` through
  `src/models/templateCatalog.js` (`themeConfig.templateKey` first, then the
  template name).
- `status` is exactly `"DRAFT"` or `"PUBLISHED"`. The UI uses the lower-case
  values internally and translates only at this boundary.
- `createdAt` / `updatedAt` are `LocalDateTime` strings **without a timezone**.
  They are parsed safely; a missing or invalid value becomes `null` and never
  crashes a page.
- `content` is an arbitrary object. Only detail/create/update responses carry it.
  For a site created by this frontend it is the full editor document (pages,
  sections, blocks, theme, navigation), so the editor can open the project
  without a separate draft read.

#### `POST /api/sites` — create a project

`toCreateSitePayload` in `src/models/siteWire.js` is the only place that builds
this body.

```json
{
  "templateId": 4,
  "projectName": "Acme Studio",
  "slug": "acme-studio",
  "content": {
    "pages": [
      {
        "id": "page-1",
        "name": "Acme Studio",
        "slug": "",
        "isHome": true,
        "sections": [
          {
            "id": "section-1",
            "type": "hero",
            "blocks": [
              {
                "id": "block-1",
                "type": "heading",
                "content": { "text": "We build calm websites" }
              }
            ]
          }
        ]
      }
    ],
    "activePageId": "page-1",
    "navigation": { "items": [] },
    "theme": {},
    "motion": {},
    "globalStyles": {}
  },
  "status": "DRAFT"
}
```

- `templateId` is a number, `projectName` is the project's display name and
  `slug` is the URL segment.
- `content` is **required and always an object**. It is the full personalized
  editor document, built before the request with `buildSiteSeedDocument`
  (`createLocalDraftDocument` plus `applySiteContent`), so the visitor's brand,
  hero, about and contact values are already applied to the template skeleton.
  The backend stores this document; the wizard does **not** follow the create
  with a `PUT` draft request.
- `status` is always sent as `"DRAFT"` by the wizard.
- Every create body has exactly the five keys above. The frontend never sends
  `name`, `title`, `themePresetId` or any other local helper field.

#### `PUT /api/sites/{id}` — update a project

`toUpdateSitePayload` always sends these three keys together:

```json
{
  "projectName": "Acme Studio",
  "slug": "acme-studio",
  "content": {},
  "templateId": 4,
  "status": "PUBLISHED"
}
```

- `projectName`, `slug` and `content` are mandatory on **every** update, even
  when only one value changed. `content` is always an object.
- `templateId` and `status` are optional and are sent only when supplied.
- A rename reads the current site first and sends all required fields back with
  only `projectName` replaced, so it cannot clear the slug or content.

#### `GET /api/templates` — template catalogue

Returns an array of template objects (an enveloped `{ data: [...] }` response is
also accepted by the service):

```json
{
  "id": 4,
  "name": "Nova AI",
  "category": "ai",
  "description": "A product-led AI landing page.",
  "previewImageUrl": "https://cdn.example.com/nova.png",
  "premium": true,
  "themeConfig": {
    "accent": "#6d5efc",
    "radius": 12
  }
}
```

`normalizeTemplateResponse` keeps the numeric `id` as `backendTemplateId`, maps
`previewImageUrl` to `thumbnailUrl`-equivalent usage, preserves `premium` as a
boolean and `themeConfig` as an object. `templateId` is the matched frontend
template id, or `null` when the server template has no frontend counterpart.

#### Error format (create/update)

```json
{
  "message": "Validation failed",
  "errors": {
    "projectName": ["A project name is required."],
    "slug": ["This URL is already taken."],
    "content": ["Content must be an object."]
  }
}
```

- Every `errors` value is a `string[]`; the frontend shows the **first** item.
- `projectName` errors are shown on the project-name field; `slug` errors on the
  URL field. Content field errors keep their content key names.
- The top-level `message` is shown when no field matches.
- A duplicate slug should return `409`, or `422` with `errors.slug`.
- A `400` with a plain `message` is shown as-is; `500`/network failures fall back
  to the client's `SERVER`/`NETWORK` message.

### Editor draft & site settings

- **There is no `/draft` endpoint.** The editor draft is the site's `content`
  on the ordinary site resource:
  - `GET /api/sites/{siteId}` — `siteEditorService.js` reads `content` and
    normalizes it with `normalizeEditorDocument`. A `null`/empty `content`
    (no non-empty `pages` array) means "no server draft", so the editor seeds
    from the template exactly as before. The response's `projectName` and
    `slug` are kept beside the document so a save can echo them.
  - `PUT /api/sites/{siteId}` — the editor save sends
    `{ projectName, slug, content }` together: `projectName` and `slug` from
    the loaded site record, `content` from the edited document
    (`buildEditorDraftPayload`). Never a partial body.
- **Draft seeding after create.** `POST /api/sites` stores the personalized
  editor document as `content`, so the wizard does **not** call
  `PUT /api/sites/{siteId}` after a successful create. The document is
  built before the request from the chosen template plus the visitor's
  `content`; `applySiteContent` is pure: it never removes or reorders sections,
  and leaves sample copy where the visitor left a field blank. A field with no
  matching slot in that template (for example `aboutText` in a template without
  an about band) is simply not written.
- The created document is also kept in `sessionStorage` as a one-shot fallback.
  If the editor cannot load a server draft, it applies that document once on
  open and marks it **UNSAVED**; a server draft always wins and drops the
  fallback. Demo mode keeps its in-memory draft store.
- `GET /sites/{siteId}/settings` — `siteSettingsService.js` (outside this
  sites/templates contract, not implemented by the backend yet). The read
  degrades to `null` on `404/403/405`, so the page starts from the site's own
  values. The settings save persists through `PUT /api/sites/{id}` with
  `{ projectName, slug, content }` — the name comes from the form, the slug and
  the full editor document are echoed from the loaded site — so a rename can
  never wipe the content or fail required-field validation. The remaining
  settings fields stay local until a settings endpoint exists. Publication
  status is **read-only** and is deliberately omitted from the mutation payload.
- **Unimplemented endpoints.** Settings, duplicate, deployments, activity,
  notifications, billing, support and admin paths are kept, but a
  `404/403/405` response is treated as the existing unavailable/empty state
  (safe empty value on reads, `BackendNotConnectedError` on mutations) instead
  of a crash or a generic request error. `400/409/422/5xx` still surface as
  real errors.

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

- **Return errors as** 401/403/404/409/422 with exactly
  `{ message, errors: { field: string[] } }` (for example `projectName`, `slug`,
  `content`). The client surfaces these verbatim.
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
