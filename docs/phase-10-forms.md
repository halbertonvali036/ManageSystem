# Phase 10 — contact form builder

The editor now supports a reusable `form` block through the existing palette, canvas renderer, right settings panel, document normalization and draft payload. Starter fields are Name, Email and Message with a Submit button; all are editable draft content. The model contains a form ID/name, fields, submit label, future success-message text, button variant and an explicitly unavailable configuration placeholder. Fields have stable IDs, unique machine keys, labels, types, placeholders, required flags and select options. Preview answers live only in React state and are not part of the site draft payload.

Supported types: Text, Email, Textarea, Number, Select and Checkbox. Fields can be added, relabeled, retyped, made required/optional, given placeholders, reordered, duplicated and deleted. Keys are generated and read-only. Select options use one line per option and apply on leaving the field; empty/duplicate options are removed. The lightweight editor caps forms at 30 fields and selects at 40 options. Form, section and page duplication regenerate form/field identifiers so copies remain independent. Form data survives the existing normalized draft payload round trip.

The submit label and solid/outline variant are editable. Submit alignment uses existing responsive block alignment, and the form participates in the existing typography, color, spacing and width controls. Builder controls use builder theme tokens; the website form uses only site tokens for field surfaces, borders, text, buttons and focus. New Contact sections include this same form block instead of the old placeholder action button. Existing Contact sections can receive a form from the block palette; existing user content is not migrated or replaced.

Editing renders an inert form inside the selectable block. Preview renders semantic labels and controls, supports keyboard navigation, uses native required attributes and shows associated `aria-invalid`/`aria-describedby` errors. Invalid submission focuses the first invalid field after errors render. Frontend checks cover required values (including required checkboxes), email shape, numeric values and select membership. These are UX checks only; server validation remains mandatory. A valid preview attempt calls the refusing service and shows an integration-unavailable message. It does not clear entered answers or display the configured success message.

`siteFormService` exports `submitSiteForm(siteId, formId, payload)` and `getFormSubmissions(siteId, formId)`. Both always reject with `BackendNotConnectedError`, even if the general API URL is configured. There are no HTTP requests, local-storage submissions, queues, fake success responses or invented submission records. The success-message field is future draft metadata. Redirect URL, notification email, spam protection and storage controls are disabled and explain their integration-pending state. Configuration contains null placeholders, no credentials or secrets.

Backend work still required: authenticated form configuration, authoritative validation, anti-spam, rate limiting, delivery/storage, submission access control and any approved redirect behavior. This phase implements no email, database, CAPTCHA, automation, webhooks, external integrations, upload fields, conditional logic, analytics or payment forms.

All new labels and starter content are in `src/i18n/formLocales.js`, connected to both Azerbaijani and English dictionaries. Azerbaijani remains the default. Contact preset descriptions were updated in both locales.

## Verification

- Chromium at 1440, 1024, 768 and 375 px: editor field management and all three preview device modes checked; no document horizontal overflow.
- At each width: add, rename, type change, duplicate, reorder and delete; Select option edits; all six control types; required fields/checkbox and invalid email handling; valid attempts report integration unavailable.
- Label associations, input keyboard order, focus behavior and site-theme field surface inheritance checked. This is targeted browser verification, not a complete screen-reader audit.
- Model checks: stable payload round trip, unique copied identifiers and keys, field ordering, option normalization, Contact form integration, localized starter fields and matching locale key sets.
- Both service methods rejected with empty and configured API URLs. Browser flows produced no submission POST requests and no runtime errors.
- `npm run lint`: exit 0. One pre-existing `react(set-state-in-effect)` warning in `src/pages/SiteSettingsPage.jsx:102`; no new warnings.
- `npm run build`: passed, 2443 modules transformed. Build and local browser checks used approved process execution after sandbox `spawn EPERM` failures.

The temporary verification script used the existing local Playwright installation and was removed after passing. No dependencies were added.

## Files changed

Added:

- `src/components/editor/FormBlock.jsx`
- `src/components/editor/FormSettings.jsx`
- `src/models/siteForm.js`
- `src/services/siteFormService.js`
- `src/i18n/formLocales.js`
- `src/styles/site-forms.css`
- `docs/phase-10-forms.md`

Updated:

- `src/components/editor/BlockRenderer.jsx`
- `src/components/editor/EditorSidebar.jsx`
- `src/components/editor/EditorSettingsPanel.jsx`
- `src/pages/SiteEditorPage.jsx`
- `src/models/siteEditor.js`
- `src/models/siteSection.js`
- `src/i18n/locales/az.js`
- `src/i18n/locales/en.js`
- `src/main.jsx`

The build regenerated `dist/`. No Git commands, parallel agents or SmartWeb source were used. No fake submissions, backend implementation or email-delivery logic was added.
