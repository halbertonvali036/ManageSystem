/**
 * Site settings — the project's own identity, SEO and branding.
 *
 * This is a *separate* model from the editor document on purpose, and the reason
 * is worth stating because it decides the whole architecture:
 *
 *   The editor document answers "what is on the page": pages, sections, blocks.
 *   These settings answer "what is this site called, and what does the internet
 *   get told about it": name, description, language, logo, favicon, SEO defaults,
 *   social image, brand colour, domain.
 *
 * Merging them would be tidier to look at and worse to reason about. A logo is
 * not a block, a domain is not a page, and a search-engine toggle has no business
 * inside a section. Keeping them apart also means a future `GET /sites/:id` and a
 * future `GET /sites/:id/settings` can be reviewed as two contracts rather than
 * one endpoint that grows a settings object inside every page.
 *
 * Nothing here is persisted. There is no backend, so these values are a local
 * working state that a tab refresh discards, exactly like the editor draft. The
 * `indexInSearch` and `visibility` fields are recorded intent: nothing in this
 * codebase reads them, and nothing should imply a site is actually indexed,
 * published or private until a server acts on them.
 *
 * Like every model in this project, everything below is a pure function over plain
 * data.
 */

import { normalizeMediaItem } from '@/models/siteMedia'
import { SITE_FONT_STACKS } from '@/models/siteTheme'

/** How the user chooses a site language. Two locales are real; ru is declared. */
export const SITE_LANGUAGE = Object.freeze({
  AZ: 'az',
  EN: 'en',
  RU: 'ru',
})

export const SITE_LANGUAGES = Object.freeze([
  { id: SITE_LANGUAGE.AZ, labelKey: 'siteSettings.language.az' },
  { id: SITE_LANGUAGE.EN, labelKey: 'siteSettings.language.en' },
  { id: SITE_LANGUAGE.RU, labelKey: 'siteSettings.language.ru' },
])

export const SITE_LANGUAGE_IDS = Object.freeze(SITE_LANGUAGES.map((entry) => entry.id))

/**
 * A short, honest timezone list.
 *
 * Deliberately not the full IANA database. This is a dropdown for a site whose
 * content is mostly text; offering four hundred zones would imply a scheduling
 * feature that does not exist. A site that genuinely needs its own zone gets the
 * backend-driven list when that backend exists.
 */
export const SITE_TIMEZONES = Object.freeze([
  { id: '', labelKey: 'siteSettings.timezone.notSet' },
  { id: 'Europe/Baku', labelKey: 'siteSettings.timezone.baku' },
  { id: 'Europe/Istanbul', labelKey: 'siteSettings.timezone.istanbul' },
  { id: 'Europe/Moscow', labelKey: 'siteSettings.timezone.moscow' },
  { id: 'UTC', labelKey: 'siteSettings.timezone.utc' },
])

/**
 * Who the site is meant to be reached by.
 *
 * A recorded intention. "Private" here does not lock anything: it is a value the
 * user has chosen, waiting for a backend to enforce. The UI says so in the same
 * sentence as the control, so the word never stands on its own as a promise.
 */
export const SITE_VISIBILITY = Object.freeze({
  PUBLIC: 'public',
  PRIVATE: 'private',
  UNLISTED: 'unlisted',
})

export const SITE_VISIBILITIES = Object.freeze([
  { id: SITE_VISIBILITY.PUBLIC, labelKey: 'siteSettings.visibility.public' },
  { id: SITE_VISIBILITY.PRIVATE, labelKey: 'siteSettings.visibility.private' },
  { id: SITE_VISIBILITY.UNLISTED, labelKey: 'siteSettings.visibility.unlisted' },
])

/**
 * Length guidance for the two fields search engines actually care about.
 *
 * `min` and `max` are what the common engines display, and they are shown as
 * guidance only. Nothing here blocks typing, blocks a save, or claims a ranking
 * effect: a sixty-character title is not "better", it is just not truncated.
 *
 * `limit` is the only hard number, and it is a storage guard rather than advice —
 * it stops an unbounded string from reaching a future API. It is deliberately far
 * above `max` so a user is never blocked from writing a paragraph.
 */
export const SEO_LENGTHS = Object.freeze({
  title: Object.freeze({ min: 30, max: 60, limit: 120 }),
  description: Object.freeze({ min: 70, max: 160, limit: 320 }),
})

export const SITE_NAME_MAX = 80
export const BRAND_NAME_MAX = 80
export const BRAND_DESCRIPTION_MAX = 200
export const CANONICAL_URL_MAX = 300
export const DOMAIN_MAX = 253

/**
 * The status values this form accepts.
 *
 * The same four the project list and the site model already use, restated rather
 * than imported. The site model exports them alongside template and theme lookups
 * that have nothing to do with this form, and pulling all of that in to reach four
 * strings would tie the settings page to the project browser. The labels are
 * shared, so the same word means the same thing in both places.
 */
export const SITE_STATUS_VALUES = Object.freeze([
  'draft',
  'published',
  'unpublished',
  'archived',
])

/**
 * Brand colours are plain hex.
 *
 * A theme token or an `rgb()` value is a perfectly good CSS colour, but this
 * control is a native swatch plus a text field, and a swatch handed
 * `var(--site-accent)` draws black and invites the user to "fix" a colour that
 * was never black. Hex only keeps the swatch, the text field and the stored value
 * describing the same thing.
 */
const HEX_COLOR = /^#(?:[0-9a-f]{3}|[0-9a-f]{4}|[0-9a-f]{6}|[0-9a-f]{8})$/i

export const isValidBrandColor = (value) => HEX_COLOR.test(String(value ?? '').trim())

/**
 * Reduces any accepted hex form to the six digits a swatch can draw.
 *
 * `#abc` and `#abcd` are shorthand, so each digit becomes two. `#aabbccdd` is
 * six digits plus alpha, and an alpha channel has no meaning next to an opaque
 * swatch, so the last two are dropped. Anything invalid comes back empty, which
 * the field renders as "no colour" rather than as a black square.
 */
export const expandBrandHex = (hex) => {
  const trimmed = String(hex ?? '').trim()
  if (!isValidBrandColor(trimmed)) {
    return ''
  }
  const body = trimmed.replace(/^#/, '')
  const full = body.length <= 4 ? [...body].map((digit) => digit + digit).join('') : body
  return `#${full.slice(0, 6)}`
}

/**
 * A hostname, checked only for the shape of one.
 *
 * This is deliberately not verification. A real check needs DNS, and DNS needs a
 * backend. What this catches is a user typing a full url with a scheme, or a
 * path, into a field that asks for a hostname — a mistake worth pointing out
 * before it is stored.
 */
const DOMAIN_SHAPE = /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}$/i

export const isValidDomainShape = (value) =>
  String(value ?? '')
    .trim()
    .length <= DOMAIN_MAX && DOMAIN_SHAPE.test(String(value).trim())

const text = (value, max) => (typeof value === 'string' ? value.slice(0, max) : '')

const oneOf = (value, allowed, fallback) => (allowed.includes(value) ? value : fallback)

/* ------------------------------------------------------------------ *
 * Typography
 * ------------------------------------------------------------------ */

/**
 * The brand font choices.
 *
 * Ids, not font stacks. A stack is CSS, and storing raw CSS in a settings field
 * would put the validation burden on a value the user never typed. The stacks
 * themselves are reused from the site theme, so a brand font and a theme font
 * cannot drift apart.
 */
export const SITE_FONTS = Object.freeze([
  { id: 'sans', stack: SITE_FONT_STACKS.sans, labelKey: 'siteSettings.font.sans' },
  { id: 'serif', stack: SITE_FONT_STACKS.serif, labelKey: 'siteSettings.font.serif' },
  { id: 'mono', stack: SITE_FONT_STACKS.mono, labelKey: 'siteSettings.font.mono' },
])

export const SITE_FONT_IDS = Object.freeze(SITE_FONTS.map((font) => font.id))
export const DEFAULT_SITE_FONT_ID = 'sans'

export const getSiteFontStack = (id) =>
  SITE_FONTS.find((font) => font.id === id)?.stack ?? SITE_FONT_STACKS.sans

/* ------------------------------------------------------------------ *
 * Normalisation
 * ------------------------------------------------------------------ */

const normalizeGeneral = (raw) => ({
  name: text(raw?.name, SITE_NAME_MAX),
  description: text(raw?.description, BRAND_DESCRIPTION_MAX),
  language: oneOf(
    raw?.language,
    SITE_LANGUAGES.map((entry) => entry.id),
    SITE_LANGUAGE.AZ,
  ),
  timezone: oneOf(
    raw?.timezone,
    SITE_TIMEZONES.map((entry) => entry.id),
    '',
  ),
  /*
   * Status is recorded, not applied. Changing it here cannot publish or unpublish
   * anything, and the control says as much. It exists so the field is settled
   * before a backend has to interpret it.
   */
  status: oneOf(
    raw?.status,
    SITE_STATUS_VALUES,
    'draft',
  ),
  /*
   * Visibility is separate from indexing on purpose. `indexInSearch` is what a
   * crawler is allowed to do; visibility is who the site is meant for. A site can
   * be perfectly public and still ask not to be indexed, and treating the two as
   * one field would make that combination impossible to express.
   */
  visibility: oneOf(
    raw?.visibility,
    SITE_VISIBILITIES.map((entry) => entry.id),
    SITE_VISIBILITY.PUBLIC,
  ),
})

const normalizeIdentity = (raw) => ({
  brandName: text(raw?.brandName, BRAND_NAME_MAX),
  brandDescription: text(raw?.brandDescription, BRAND_DESCRIPTION_MAX),
  /*
   * A logo and a favicon are the same kind of value as a block image, so they go
   * through the same normaliser. That is what keeps a rejected address becoming an
   * empty record rather than an image the browser will try to load.
   */
  logo: raw?.logo ? normalizeMediaItem(raw.logo) : null,
  favicon: raw?.favicon ? normalizeMediaItem(raw.favicon) : null,
})

const normalizeSeo = (raw) => ({
  defaultTitle: text(raw?.defaultTitle, SEO_LENGTHS.title.limit),
  metaDescription: text(raw?.metaDescription, SEO_LENGTHS.description.limit),
  canonicalUrl: text(raw?.canonicalUrl, CANONICAL_URL_MAX),
  indexInSearch: raw?.indexInSearch !== false,
  socialImage: raw?.socialImage ? normalizeMediaItem(raw.socialImage) : null,
})

const normalizeBranding = (raw) => ({
  primaryColor: isValidBrandColor(raw?.primaryColor) ? raw.primaryColor.trim() : '',
  /*
   * Typography is a named stack, never a free string. A font is a CSS value the
   * user did not write here, so the stored value is an id from a list this file
   * owns; anything else falls back to the default rather than becoming CSS.
   */
  fontId: oneOf(raw?.fontId, SITE_FONT_IDS, DEFAULT_SITE_FONT_ID),
})

const normalizeDomain = (raw) => ({
  /*
   * Empty means "not configured". There is no state in which this model reports a
   * domain as working, because nothing here can know that.
   */
  hostname: text(raw?.hostname, DOMAIN_MAX).trim().toLowerCase(),
})

/**
 * Coerces anything into settings.
 *
 * A value that fails its check becomes empty rather than being kept in a shape
 * the UI cannot display, which is the same rule the editor follows for colour and
 * size: bad input leaves the field empty and visible rather than silently
 * substituted with something the user did not choose.
 */
export const normalizeSiteSettings = (raw) => ({
  siteId: typeof raw?.siteId === 'string' && raw.siteId ? raw.siteId : null,
  general: normalizeGeneral(raw?.general),
  identity: normalizeIdentity(raw?.identity),
  seo: normalizeSeo(raw?.seo),
  branding: normalizeBranding(raw?.branding),
  domain: normalizeDomain(raw?.domain),
})

/**
 * The starting point for a site that has never been configured.
 *
 * Built from a site's own values so the form opens showing the truth rather than
 * a blank page that looks like data loss.
 */
export const createLocalSiteSettings = (site) =>
  normalizeSiteSettings({
    siteId: typeof site?.id === 'string' ? site.id : null,
    general: {
      name: site?.name ?? '',
      description: '',
      status: site?.status ?? 'draft',
    },
    // The brand name starts as the site name: one honest default rather than an
    // empty field the user has to guess the meaning of.
    identity: { brandName: site?.name ?? '' },
  })

/* ------------------------------------------------------------------ *
 * Derived values
 * ------------------------------------------------------------------ */

/**
 * Every media id the settings still point at.
 *
 * The editor has the same list for its own document. Both are needed: a local
 * preview logo lives in this object, and revoking it while the settings form is
 * still open would blank the very image the user just chose.
 */
export const listSettingsMediaIdsInUse = (settings) => {
  const ids = new Set()
  for (const media of [settings?.identity?.logo, settings?.identity?.favicon, settings?.seo?.socialImage]) {
    if (media?.id) {
      ids.add(media.id)
    }
  }
  return ids
}

/**
 * The title a visitor would be shown, preferring the site's own SEO title.
 *
 * Used by the social preview and the favicon preview, so both read the same
 * resolved value rather than each deciding what "the title" means.
 */
export const getEffectiveSiteTitle = (settings) =>
  settings?.seo?.defaultTitle?.trim() || settings?.general?.name?.trim() || ''

export const getEffectiveSiteDescription = (settings) =>
  settings?.seo?.metaDescription?.trim() || settings?.identity?.brandDescription?.trim() || ''

/**
 * How the site would appear in a search result, as far as the entered text goes.
 *
 * The address shown is the entered canonical url when there is one and a
 * placeholder path otherwise. It is not a live address and is never presented as
 * one: the preview says in its own caption that this is a draft.
 */
export const getSearchPreview = (settings) => ({
  title: getEffectiveSiteTitle(settings),
  description: getEffectiveSiteDescription(settings),
  path: settings?.seo?.canonicalUrl?.trim() || '/',
  isIndexable: settings?.seo?.indexInSearch === true,
})

/**
 * The state of the domain field, as a fact rather than a claim.
 *
 * Only two answers exist. "not configured" is the only one reachable today, and
 * there is no code path that could report a domain as verified, connected or
 * secured.
 */
export const getDomainState = (settings) => {
  const hostname = settings?.domain?.hostname ?? ''
  if (!hostname) {
    return { isConfigured: false, isValid: true, hostname: '' }
  }
  return { isConfigured: true, isValid: isValidDomainShape(hostname), hostname }
}

/**
 * A character count against the guidance band, for the fields that show one.
 *
 * An unknown kind reports a plain count with no advice rather than throwing. The
 * two callers pass a literal, so this is not a case that occurs today — but this
 * function runs during render, and a throw here would take down the whole page
 * over a missing length band. Reporting "no guidance" is the harmless answer.
 */
export const getSeoLengthState = (value, kind) => {
  const length = String(value ?? '').length
  const band = SEO_LENGTHS[kind]
  if (!band) {
    return { length, isEmpty: length === 0, isShort: false, isLong: false, isOverLimit: false }
  }
  return {
    length,
    isEmpty: length === 0,
    isShort: length > 0 && length < band.min,
    isLong: length > band.max,
    isOverLimit: length > band.limit,
  }
}

/* ------------------------------------------------------------------ *
 * Service payload
 * ------------------------------------------------------------------ */

/**
 * The shape `updateSiteSettings` will send.
 *
 * Normalised on the way out, so the future contract is already fixed and a
 * hand-edited value cannot reach it in a shape the form never produced.
 */
export const buildSiteSettingsPayload = (settings) => {
  const normalized = normalizeSiteSettings(settings)
  return {
    // Publication status is read-only and belongs to the publishing service.
    general: {
      name: normalized.general.name,
      description: normalized.general.description,
      language: normalized.general.language,
      timezone: normalized.general.timezone,
      visibility: normalized.general.visibility,
    },
    identity: {
      brandName: normalized.identity.brandName,
      brandDescription: normalized.identity.brandDescription,
      logo: normalized.identity.logo ? { ...normalized.identity.logo } : null,
      favicon: normalized.identity.favicon ? { ...normalized.identity.favicon } : null,
    },
    seo: {
      defaultTitle: normalized.seo.defaultTitle,
      metaDescription: normalized.seo.metaDescription,
      canonicalUrl: normalized.seo.canonicalUrl,
      indexInSearch: normalized.seo.indexInSearch,
      socialImage: normalized.seo.socialImage ? { ...normalized.seo.socialImage } : null,
    },
    branding: { ...normalized.branding },
    domain: { ...normalized.domain },
  }
}
