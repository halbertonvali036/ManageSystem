# Phase 9 — preview, publishing and domain foundation

Preview remains inside the mounted editor, with no additional route. EditorCanvas and its section/header renderers consume the same in-memory document, including unsaved edits and temporary image URLs. The editor top bar, side panels and editing controls disappear; a separate preview bar provides Desktop (1440), Tablet (834) and Mobile (390) target widths, capped to the available viewport. Controls can be hidden and restored. Escape returns to editing and restores focus. Site theme tokens remain scoped to the rendered site. This does not add persistence across reloads or leaving the editor.

Publish and unpublish actions open a native modal in both the workspace and editor. Publish shows the actual site name when available, selected homepage, domain information availability and local readiness checks. The editor passes its current draft directly; the workspace can request a stored draft through the existing draft service. Missing remote draft data is shown as unknown, not a failed local check. The integration check explicitly reports that no publication state changed. Unpublish includes a future-action confirmation explanation and the same refusal behavior.

Draft content, known publication status and local changes are separate. Published/unpublished labels in the editor require site data from the existing service; absent data stays unconfirmed. Local changes remain indicated even after saving a draft and never promote a site to published. Settings publication status is read-only and omitted from settings mutation payloads.

`sitePublishService` exports `publishSite(siteId)`, `unpublishSite(siteId)`, `getPublishStatus(siteId)` and `getPublishedUrl(siteId)`; these are also exposed through `siteService`. Both mutations always reject with `BackendNotConnectedError`, including when the general API base URL is configured. Reads return unavailable/unknown status and a null published URL. No deployment endpoints are assumed.

Domain settings include a local subdomain suggestion with optional `VITE_PLATFORM_BASE_DOMAIN`, undefined by default. It neither saves nor reserves a hostname. The custom-domain steps are add domain → DNS records → verify → connected; action buttons remain disabled. `normalizeDomainStatus` prepares unconfigured/pending/connected/error domain states and unconfigured/pending/active/error SSL states for a future backend adapter. No remote adapter is wired yet, so current UI stays unconfigured. `DnsRecords` displays supplied A/CNAME/TXT records and an honest empty state; no DNS values are invented.

All new copy lives under matching `publishing` namespaces in Azerbaijani and English localization files. Backend-dependent work still includes deployment, persisted-draft validation, domain allocation, DNS records and verification, SSL provisioning, publication status and live URL responses. No hosting, CDN, analytics, collaboration or history was added.

## Verification

- Headless Chromium at 1440, 1024, 768 and 375 px: no document horizontal overflow in editor, all three preview devices, publish dialog or domain settings.
- Edited content survived preview entry, device switching, hiding controls and return to the editor.
- Preview removed the editor top bar; Escape restored focus to the preview trigger.
- Modal Tab navigation stayed inside the dialog; publish/unpublish integration checks remained pending with no success state.
- Domain actions remained disabled, DNS records absent, and publication status read-only.
- Service mutations rejected with both an empty and configured API base URL. Status remained unknown and published URL null.
- No browser runtime errors in the checked flows. Automated checks cover these flows, not a full screen-reader audit.
- `npm run lint`: exit 0, one existing `react(set-state-in-effect)` warning at `src/pages/SiteSettingsPage.jsx:102`.
- `npm run build`: passed. Vite required an approved execution outside the sandbox after `spawn EPERM`.

The temporary browser-check script used the existing local Playwright installation and was removed after verification; no dependencies were added.

## Files changed

Added:

- `src/components/editor/PreviewBar.jsx`
- `src/components/sites/PublishActions.jsx`
- `src/components/sites/PublishDialog.jsx`
- `src/components/sitesettings/DnsRecords.jsx`
- `src/components/sitesettings/DomainFoundation.jsx`
- `src/models/sitePublishing.js`
- `src/services/sitePublishService.js`
- `src/styles/publishing.css`
- `docs/phase-9-publishing.md`

Updated:

- `.env.example`
- `src/config/index.js`
- `src/components/editor/EditorTopBar.jsx`
- `src/pages/SiteEditorPage.jsx`
- `src/pages/SiteDetailsPage.jsx`
- `src/pages/SiteSettingsPage.jsx`
- `src/models/siteSettings.js`
- `src/services/siteService.js`
- `src/i18n/locales/az.js`
- `src/i18n/locales/en.js`
- `src/main.jsx`

The build regenerated `dist/`. No Git commands, parallel agents, backend implementation, or SmartWeb source were used. No fake publishing, domain connection or SSL success was added.
