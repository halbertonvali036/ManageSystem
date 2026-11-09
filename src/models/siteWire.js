/**
 * The single wire boundary for site and template data.
 *
 * The backend contract and the frontend model deliberately use different words:
 *
 *   wire (backend)                    frontend model
 *   projectName                       name
 *   status: "DRAFT" | "PUBLISHED"     status: "draft" | "published"
 *   templateId: number                backendTemplateId (number)
 *   templateName                      templateName
 *   previewImageUrl                   thumbnailUrl
 *   themeConfig                       themeConfig
 *   createdAt / updatedAt             createdAt / updatedAt (ISO or null)
 *
 * Every translation between those two vocabularies lives in this file. Services
 * call the `normalize*` helpers on responses and the `to*Payload` helpers before
 * a write, so no other module has to know a wire field name.
 *
 * Nothing here imports `siteService` or `config`: the helpers stay pure, which
 * is what makes them safe to assert against sample backend JSON.
 */

import {
  DEFAULT_SITE_TEMPLATE_ID,
  isValidSiteTemplateId,
} from '@/models/siteTemplate'
import {
  DEFAULT_SITE_THEME_ID,
  isValidSiteThemeId,
} from '@/models/siteTheme'
import {
  resolveBackendTemplateId as resolveBackendTemplateIdFromCatalog,
  resolveFrontendTemplateId as resolveFrontendTemplateIdFromCatalog,
  toBackendId,
} from '@/models/templateCatalog'

const SITE_STATUS_BY_WIRE = Object.freeze({
  DRAFT: 'draft',
  PUBLISHED: 'published',
  UNPUBLISHED: 'unpublished',
  ARCHIVED: 'archived',
})

const WIRE_BY_SITE_STATUS = Object.freeze(
  Object.fromEntries(
    Object.entries(SITE_STATUS_BY_WIRE).map(([wire, status]) => [status, wire]),
  ),
)

/**
 * Normalizes a status from the wire (case-insensitive) to the UI's lower-case
 * vocabulary. Unknown values read as draft, so a new backend status can never
 * put a card into an unrenderable state.
 */
export const normalizeSiteStatus = (status) => {
  const key = typeof status === 'string' ? status.trim().toUpperCase() : ''
  return SITE_STATUS_BY_WIRE[key] ?? 'draft'
}

/** The uppercase status a write sends. Unknown values fall back to DRAFT. */
export const toWireSiteStatus = (status) => {
  const key = typeof status === 'string' ? status.trim().toLowerCase() : ''
  return WIRE_BY_SITE_STATUS[key] ?? 'DRAFT'
}

/** A plain object or an empty one. Arrays and null are never valid wire objects. */
const asObject = (value) =>
  value && typeof value === 'object' && !Array.isArray(value) ? value : {}

/**
 * Converts a backend LocalDateTime string to a valid ISO timestamp.
 *
 * The contract sends `2026-02-03T09:15:30` with no timezone suffix. That is a
 * local wall-clock value, so the parts are parsed explicitly instead of relying
 * on engine-specific `Date` fallbacks. Offset/Z timestamps still go through the
 * native parser. Missing, blank and invalid values return null rather than
 * throwing or producing an "Invalid Date".
 */
export const parseApiDate = (value) => {
  if (value === null || value === undefined || value === '') {
    return null
  }

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value.toISOString()
  }

  if (typeof value !== 'string') {
    return null
  }

  const text = value.trim()
  if (!text) {
    return null
  }

  const localDateTime =
    /^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})(?::(\d{2})(?:\.(\d{1,9}))?)?$/.exec(text)

  if (localDateTime) {
    const [, year, month, day, hour, minute, second = '0', fraction = '0'] =
      localDateTime
    const milliseconds = Number(fraction.padEnd(3, '0').slice(0, 3))
    const date = new Date(
      Number(year),
      Number(month) - 1,
      Number(day),
      Number(hour),
      Number(minute),
      Number(second),
      milliseconds,
    )
    return Number.isNaN(date.getTime()) ? null : date.toISOString()
  }

  const date = new Date(text)
  return Number.isNaN(date.getTime()) ? null : date.toISOString()
}

/**
 * Maps a backend template/site response to a frontend template id.
 *
 * The matching rules live in `models/templateCatalog.js`: first
 * `themeConfig.templateKey`, then the backend name against the frontend
 * template's English name. Keeping them in a pure model lets both the wire
 * normalizers and the catalogue service use the same answer.
 *
 * @param {object} [backendTemplateOrSite]
 * @returns {string|null} one of the frontend template ids, or null
 */
export const resolveFrontendTemplateId = resolveFrontendTemplateIdFromCatalog

/**
 * The reverse mapping used when writing. Without a catalogue it can only return
 * an already-known backend id (`backendTemplateId` or a numeric `templateId`).
 * The catalogue-aware version is exposed by `services/templateService.js`, and
 * `siteService` passes it into the payload builders below.
 *
 * @param {{ backendTemplateId?: number|string|null, templateId?: number|string|null }} draft
 * @returns {number|null}
 */
export const resolveBackendTemplateId = (draft = {}) =>
  resolveBackendTemplateIdFromCatalog(draft)

const resolveThemePresetId = (raw, themeConfig) => {
  const candidate =
    raw?.themePresetId ??
    themeConfig.themePresetId ??
    themeConfig.presetId ??
    themeConfig.id
  return isValidSiteThemeId(candidate) ? candidate : DEFAULT_SITE_THEME_ID
}

const normalizeSiteBase = (raw, { resolveTemplateId = resolveFrontendTemplateId } = {}) => {
  if (!raw || typeof raw !== 'object') {
    return null
  }

  const themeConfig = asObject(raw.themeConfig)
  const backendTemplateId = toBackendId(raw.templateId)
  const templateName =
    typeof raw.templateName === 'string' ? raw.templateName : null
  const resolvedTemplateId = resolveTemplateId({
    backendTemplateId,
    templateName,
    template: raw,
  })
  // A string templateId is already a frontend id (legacy/local shape); a
  // numeric one is the backend id and must wait for the mapping hook.
  const templateId =
    typeof raw.templateId === 'string' && isValidSiteTemplateId(raw.templateId)
      ? raw.templateId
      : resolvedTemplateId

  return {
    id: raw.id ?? null,
    name: typeof raw.projectName === 'string' ? raw.projectName : '',
    slug: typeof raw.slug === 'string' ? raw.slug : '',
    status: normalizeSiteStatus(raw.status),
    templateId: isValidSiteTemplateId(templateId)
      ? templateId
      : DEFAULT_SITE_TEMPLATE_ID,
    backendTemplateId,
    templateName,
    themePresetId: resolveThemePresetId(raw, themeConfig),
    themeConfig,
    thumbnailUrl:
      typeof raw.previewImageUrl === 'string' ? raw.previewImageUrl : null,
    // No backend contract for these yet; keeping them null lets the existing
    // address helpers fall back to the slug instead of inventing a URL.
    publishedUrl: null,
    customDomain: null,
    createdAt: parseApiDate(raw.createdAt),
    updatedAt: parseApiDate(raw.updatedAt),
  }
}

/**
 * A full site response: `GET /api/sites/{id}` and POST/PUT responses. `content`
 * is always an object, even when the backend omitted it.
 */
export const normalizeSiteResponse = (raw, options = {}) => {
  const site = normalizeSiteBase(raw, options)
  if (!site) {
    return null
  }
  return { ...site, content: asObject(raw.content) }
}

/**
 * A site list row: `GET /api/sites`. The backend does not include `content`
 * here, so the summary intentionally has no `content` key at all.
 */
export const normalizeSiteSummary = (raw, options = {}) =>
  normalizeSiteBase(raw, options)

/**
 * A template response: `GET /api/templates`.
 *
 * The numeric `id` stays available as `backendTemplateId`; `templateId` is the
 * frontend string id once the mapping hook above is implemented.
 */
export const normalizeTemplateResponse = (
  raw,
  { resolveTemplateId = resolveFrontendTemplateId } = {},
) => {
  if (!raw || typeof raw !== 'object') {
    return null
  }

  const backendTemplateId = toBackendId(raw.id)
  const name = typeof raw.name === 'string' ? raw.name : ''
  const resolvedTemplateId = resolveTemplateId({
    backendTemplateId,
    templateName: name,
    template: raw,
  })

  return {
    id: raw.id ?? null,
    backendTemplateId,
    templateId: isValidSiteTemplateId(resolvedTemplateId)
      ? resolvedTemplateId
      : null,
    name,
    category: typeof raw.category === 'string' ? raw.category : '',
    description: typeof raw.description === 'string' ? raw.description : '',
    previewImageUrl:
      typeof raw.previewImageUrl === 'string' ? raw.previewImageUrl : null,
    premium: raw.premium === true,
    themeConfig: asObject(raw.themeConfig),
  }
}

/**
 * `POST /api/sites` body.
 *
 * Only the five contract keys are sent, in the contract's order. `name`,
 * `title`, `themePresetId` and every other local helper field stop here.
 *
 * `content` is the full editor document, built by the caller with the same
 * builder the editor uses when it has no server draft (including
 * `applySiteContent`). The document is what the backend persists, so creation
 * needs no second draft request. A missing document falls back to the draft's
 * plain content object, which is still a non-null JSON object.
 *
 * @param {object} draft The local wizard draft.
 * @param {{
 *   resolveTemplateId?: (draft: object) => number|null,
 *   content?: object,
 * }} options
 */
export const toCreateSitePayload = (
  draft = {},
  { resolveTemplateId = resolveBackendTemplateId, content } = {},
) => {
  const source = asObject(draft)
  const projectName =
    typeof source.name === 'string' ? source.name.trim() : ''

  return {
    templateId: resolveTemplateId(source),
    projectName,
    slug: typeof source.slug === 'string' ? source.slug.trim() : '',
    content: asObject(content ?? source.content),
    status: toWireSiteStatus('draft'),
  }
}

/**
 * `PUT /api/sites/{id}` body.
 *
 * The contract requires `projectName`, `slug` and `content` together on every
 * update; `templateId` and `status` are included only when the caller supplied
 * them. Again, no local-only field is forwarded.
 *
 * @param {object} site A normalized site or a partial update.
 * @param {{ resolveTemplateId?: (site: object) => number|null }} options
 */
export const toUpdateSitePayload = (
  site = {},
  { resolveTemplateId = resolveBackendTemplateId } = {},
) => {
  const source = asObject(site)
  const projectName =
    typeof source.name === 'string'
      ? source.name.trim()
      : typeof source.projectName === 'string'
        ? source.projectName.trim()
        : ''

  const payload = {
    projectName,
    slug: typeof source.slug === 'string' ? source.slug : '',
    content: asObject(source.content),
  }

  const backendTemplateId = resolveTemplateId(source)
  if (backendTemplateId !== null) {
    payload.templateId = backendTemplateId
  }

  if (source.status !== undefined && source.status !== null && source.status !== '') {
    payload.status = toWireSiteStatus(source.status)
  }

  return payload
}

export default {
  normalizeSiteResponse,
  normalizeSiteSummary,
  normalizeTemplateResponse,
  toCreateSitePayload,
  toUpdateSitePayload,
}
