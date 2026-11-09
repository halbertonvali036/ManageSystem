/**
 * Backend template catalogue mapping.
 *
 * The gallery is built from the static frontend templates in
 * `models/siteTemplate.js`, but a real backend owns its own template rows with
 * numeric ids. The two are matched here so every write can send a real backend
 * id instead of a frontend string.
 *
 * Matching order is deliberate:
 *
 *   1. `themeConfig.templateKey` equal to the frontend template id.
 *   2. The backend `name`, compared case-insensitively with the frontend
 *      template's English name.
 *
 * The English name is read from `locales/en.js`, which is the canonical source
 * for that string. Nothing is duplicated here.
 */

import en from '@/i18n/locales/en'
import {
  SITE_TEMPLATE_BY_ID,
  isValidSiteTemplateId,
} from '@/models/siteTemplate'

const asObject = (value) =>
  value && typeof value === 'object' && !Array.isArray(value) ? value : {}

/** Reads a numeric backend id, including a numeric string, or null. */
export const toBackendId = (value) => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value
  }
  if (typeof value === 'string' && /^\d+$/.test(value.trim())) {
    return Number(value.trim())
  }
  return null
}

const resolvePath = (dictionary, key) =>
  key.split('.').reduce(
    (node, segment) =>
      node && typeof node === 'object' && segment in node
        ? node[segment]
        : undefined,
    dictionary,
  )

const normalizeName = (value) =>
  typeof value === 'string'
    ? value.trim().replace(/\s+/g, ' ').toLocaleLowerCase('en-US')
    : ''

/** The English display name of a frontend template, or an empty string. */
export const getFrontendTemplateEnglishName = (frontendId) => {
  const template = SITE_TEMPLATE_BY_ID[frontendId]
  if (!template) {
    return ''
  }
  const name = resolvePath(en, template.nameKey)
  return typeof name === 'string' ? name : ''
}

const FRONTEND_ID_BY_ENGLISH_NAME = new Map(
  Object.values(SITE_TEMPLATE_BY_ID)
    .map((template) => [normalizeName(getFrontendTemplateEnglishName(template.id)), template.id])
    .filter(([name]) => Boolean(name)),
)

const normalizeTemplateKey = (value) =>
  typeof value === 'string' ? value.trim().toLocaleLowerCase('en-US') : ''

const matchFrontendIdByKey = (value) => {
  const key = normalizeTemplateKey(value)
  if (!key) {
    return null
  }
  return (
    Object.keys(SITE_TEMPLATE_BY_ID).find(
      (frontendId) => frontendId.toLocaleLowerCase('en-US') === key,
    ) ?? null
  )
}

const matchFrontendIdByName = (value) => {
  const name = normalizeName(value)
  return name ? FRONTEND_ID_BY_ENGLISH_NAME.get(name) ?? null : null
}

const readTemplateKey = (source) => {
  const themeConfig = asObject(source?.themeConfig)
  const nestedThemeConfig = asObject(source?.template?.themeConfig)
  return (
    themeConfig.templateKey ??
    nestedThemeConfig.templateKey ??
    source?.templateKey ??
    source?.template?.templateKey ??
    null
  )
}

const readName = (source) => {
  // `templateName` is the template's own name. On a normalized site, `name` is
  // the project name, so it must come last rather than shadowing the template.
  const candidates = [source?.templateName, source?.template?.name, source?.name]
  return (
    candidates.find((value) => typeof value === 'string' && value.trim()) ?? null
  )
}

/**
 * Maps a backend template or site response to a frontend template id.
 *
 * Accepts either the raw wire object (`{ templateId: 7, templateName, themeConfig }`)
 * or an already-normalized object. Returns null when nothing matches, which is
 * what lets the gallery keep the card visible but disabled.
 *
 * @param {object} [backendTemplateOrSite]
 * @returns {string|null}
 */
export const resolveFrontendTemplateId = (backendTemplateOrSite = {}) => {
  const source = asObject(backendTemplateOrSite)

  // A normalizer may already have produced a frontend id; still prefer the
  // explicit backend hints first so a stale `templateId` cannot win.
  const byKey = matchFrontendIdByKey(readTemplateKey(source))
  if (byKey) {
    return byKey
  }

  const byName = matchFrontendIdByName(readName(source))
  if (byName) {
    return byName
  }

  if (typeof source.templateId === 'string' && isValidSiteTemplateId(source.templateId)) {
    return source.templateId
  }

  return null
}

const findCatalogEntry = (frontendId, catalog) => {
  if (!Array.isArray(catalog) || !frontendId) {
    return null
  }

  return (
    catalog.find((entry) => entry?.templateId === frontendId) ??
    catalog.find((entry) => matchFrontendIdByKey(readTemplateKey(entry)) === frontendId) ??
    catalog.find((entry) => matchFrontendIdByName(readName(entry)) === frontendId) ??
    null
  )
}

/**
 * Maps a frontend template id to the backend template id, using `catalog`
 * (the normalized `GET /api/templates` list).
 *
 * A numeric id or a draft/site that already carries `backendTemplateId` is
 * returned unchanged, so an update never has to depend on a fresh catalogue
 * read just to echo the current template.
 *
 * @param {string|number|object} frontendId
 * @param {Array<object>} [catalog]
 * @returns {number|null}
 */
export const resolveBackendTemplateId = (frontendId, catalog = []) => {
  if (frontendId && typeof frontendId === 'object') {
    const explicit =
      toBackendId(frontendId.backendTemplateId) ?? toBackendId(frontendId.templateId)
    if (explicit !== null) {
      return explicit
    }
    frontendId = typeof frontendId.templateId === 'string' ? frontendId.templateId : null
  }

  const direct = toBackendId(frontendId)
  if (direct !== null) {
    return direct
  }

  if (typeof frontendId !== 'string') {
    return null
  }

  const id = matchFrontendIdByKey(frontendId) ?? matchFrontendIdByName(frontendId)
  if (!id) {
    return null
  }

  const entry = findCatalogEntry(id, catalog)
  return entry ? toBackendId(entry.backendTemplateId ?? entry.id) : null
}

/**
 * The frontend category id for a backend category string, or null.
 *
 * Backend categories may be written as `SAAS`, `saas`, `REAL_ESTATE` or
 * `realEstate`; the comparison ignores case and separators and then returns the
 * stable frontend id so the caller can reuse the existing localized label.
 */
export const normalizeBackendCategoryId = (category) => {
  const key =
    typeof category === 'string'
      ? category.trim().toLocaleLowerCase('en-US').replace(/[^a-z]/g, '')
      : ''
  if (!key) {
    return null
  }

  return (
    Object.values(SITE_TEMPLATE_BY_ID)
      .map((template) => template.category)
      .find((value) => value.toLocaleLowerCase('en-US').replace(/[^a-z]/g, '') === key) ?? null
  )
}

export default {
  getFrontendTemplateEnglishName,
  normalizeBackendCategoryId,
  resolveBackendTemplateId,
  resolveFrontendTemplateId,
  toBackendId,
}
