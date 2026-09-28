/**
 * Site project model.
 *
 * This is the frontend contract for a website project. The fields below are the
 * shape the product is designed around; the backend will eventually own them.
 * No sample project is defined here on purpose — pages render empty states
 * until the API is connected.
 */

import {
  DEFAULT_SITE_TEMPLATE_ID,
  isValidSiteTemplateId,
} from '@/models/siteTemplate'
import {
  DEFAULT_SITE_THEME_ID,
  isValidSiteThemeId,
} from '@/models/siteTheme'

export const SITE_STATUS = Object.freeze({
  DRAFT: 'draft',
  PUBLISHED: 'published',
  UNPUBLISHED: 'unpublished',
  ARCHIVED: 'archived',
})

/** Status values the API is expected to return. Anything else reads as draft. */
export const SITE_STATUSES = Object.freeze([
  SITE_STATUS.DRAFT,
  SITE_STATUS.PUBLISHED,
  SITE_STATUS.UNPUBLISHED,
  SITE_STATUS.ARCHIVED,
])

export const SITE_STATUS_LABEL_KEYS = Object.freeze({
  [SITE_STATUS.DRAFT]: 'siteStatus.draft',
  [SITE_STATUS.PUBLISHED]: 'siteStatus.published',
  [SITE_STATUS.UNPUBLISHED]: 'siteStatus.unpublished',
  [SITE_STATUS.ARCHIVED]: 'siteStatus.archived',
})

/** Statuses offered in the project list filter, in display order. */
export const SITE_STATUS_FILTERS = Object.freeze([
  SITE_STATUS.DRAFT,
  SITE_STATUS.PUBLISHED,
  SITE_STATUS.UNPUBLISHED,
  SITE_STATUS.ARCHIVED,
])

export const ALL_SITES_FILTER = 'all'

/**
 * Template and theme architecture live in their own models.
 *
 * `site.js` re-exports them so a consumer that only needs "which template and
 * which theme does this project use" has one import. The data itself is not
 * duplicated here: a second copy of the template list would be a second source of
 * truth, and the picker, the wizard and the editor would eventually disagree.
 */
export {
  ALL_TEMPLATE_CATEGORIES,
  BLANK_SITE_TEMPLATE_ID,
  countTemplateSections,
  DEFAULT_SITE_TEMPLATE_ID,
  filterTemplatesByCategory,
  getSiteTemplate,
  getTemplatePageSkeletons,
  getTemplateThemePresetId,
  isValidSiteTemplateId,
  normalizeSiteTemplate,
  SITE_TEMPLATE_BY_ID,
  SITE_TEMPLATE_IDS,
  SITE_TEMPLATES,
  TEMPLATE_CATEGORIES,
  TEMPLATE_CATEGORY,
  TEMPLATE_CATEGORY_LABELS,
} from '@/models/siteTemplate'

export {
  DEFAULT_SITE_THEME_ID,
  getSiteTheme,
  getSiteThemeCssVars,
  isValidSiteThemeId,
  SITE_THEME_BY_ID,
  SITE_THEME_IDS,
  SITE_THEME_PRESETS,
} from '@/models/siteTheme'

/**
 * @typedef {Object} Site
 * @property {string} id              Backend identifier.
 * @property {string} name            User-facing project name.
 * @property {string} slug            URL segment for the site.
 * @property {'draft'|'published'|'unpublished'|'archived'} status
 * @property {string|null} templateId  Starting template id.
 * @property {string|null} themePresetId Site theme preset id.
 * @property {string|null} thumbnailUrl Preview image, null until generated.
 * @property {string|null} publishedUrl Public address once published.
 * @property {string|null} customDomain Custom domain, null until connected.
 * @property {string|null} createdAt   ISO 8601 timestamp.
 * @property {string|null} updatedAt   ISO 8601 timestamp.
 */

/**
 * Project shape used when creating a project.
 *
 * `templateId` names the structure the project starts from and `themePresetId`
 * the site theme it starts on. Both are validated against the libraries, so an
 * unknown id falls back to the default rather than being forwarded to a backend
 * that would have to guess what was meant.
 */
export const buildSiteDraft = ({
  name = '',
  slug = '',
  templateId = DEFAULT_SITE_TEMPLATE_ID,
  themePresetId = DEFAULT_SITE_THEME_ID,
} = {}) => ({
  name: name.trim(),
  slug: slug.trim().toLowerCase(),
  templateId: isValidSiteTemplateId(templateId) ? templateId : DEFAULT_SITE_TEMPLATE_ID,
  themePresetId: isValidSiteThemeId(themePresetId) ? themePresetId : DEFAULT_SITE_THEME_ID,
})

/** Only the fields a rename may change. Keeps PUT updates narrow on purpose. */
export const buildSiteRename = ({ name = '' } = {}) => ({
  name: name.trim(),
})

export const normalizeSiteStatus = (status) =>
  SITE_STATUSES.includes(status) ? status : SITE_STATUS.DRAFT

/**
 * Maps an API response onto the model above. Optional fields stay null rather
 * than becoming empty strings, so the UI can tell "not set" from "set to blank".
 */
export const normalizeSite = (raw) => {
  if (!raw || typeof raw !== 'object') {
    return null
  }

  return {
    id: raw.id ?? null,
    name: raw.name ?? '',
    slug: raw.slug ?? '',
    status: normalizeSiteStatus(raw.status),
    templateId: isValidSiteTemplateId(raw.templateId)
      ? raw.templateId
      : DEFAULT_SITE_TEMPLATE_ID,
    themePresetId: isValidSiteThemeId(raw.themePresetId ?? raw.styleId)
      ? (raw.themePresetId ?? raw.styleId)
      : DEFAULT_SITE_THEME_ID,
    thumbnailUrl: raw.thumbnailUrl ?? null,
    publishedUrl: raw.publishedUrl ?? null,
    customDomain: raw.customDomain ?? null,
    createdAt: raw.createdAt ?? null,
    updatedAt: raw.updatedAt ?? null,
  }
}

export const isSitePublished = (site) =>
  normalizeSiteStatus(site?.status) === SITE_STATUS.PUBLISHED

/**
 * The address a project is actually reachable at, preferring a connected custom
 * domain over the platform URL. Returns null while the site is not live, so a
 * draft never shows a link that would not resolve.
 */
export const getSiteAddress = (site) => {
  if (!isSitePublished(site)) {
    return null
  }
  return site?.customDomain || site?.publishedUrl || null
};

/** Label for the card footer: the live address, or the draft URL segment. */
export const getSiteAddressLabel = (site) => {
  const address = getSiteAddress(site)
  if (address) {
    return address.replace(/^https?:\/\//, '')
  }
  return site?.slug ? `/${site.slug}` : null
};

/**
 * URL rules for a project slug. Kept in the model so the create form, the
 * project card and any future editor agree on what a valid URL is.
 */
export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

export const SLUG_MAX_LENGTH = 63
export const SITE_NAME_MAX_LENGTH = 80

export const isValidSiteSlug = (value) =>
  SLUG_PATTERN.test(value) && value.length <= SLUG_MAX_LENGTH

export const isValidSiteName = (value) =>
  value.trim().length > 0 && value.trim().length <= SITE_NAME_MAX_LENGTH

/**
 * Letters that carry meaning in Azerbaijani but do not decompose under NFD.
 *
 * Without this table `ı`, `ə`, `ş`, `ğ` and `ç` are simply deleted by the
 * ASCII filter, so "Şəhər" would suggest the slug `s-h-r`. They are folded to
 * their Latin equivalents first, and NFD then handles the rest of Latin-1.
 */
const SLUG_CHARACTER_FOLD = Object.freeze({
  ə: 'e',
  Ə: 'e',
  ı: 'i',
  I: 'i',
  İ: 'i',
  ş: 's',
  Ş: 's',
  ğ: 'g',
  Ğ: 'g',
  ç: 'c',
  Ç: 'c',
  ö: 'o',
  Ö: 'o',
  ü: 'u',
  Ü: 'u',
})

/** Turns a project name into a first URL suggestion. */
export const slugifySiteName = (name) =>
  name
    .trim()
    .toLowerCase()
    .replace(/[əƏıIİşŞğĞçÇöÖüÜ]/g, (char) => SLUG_CHARACTER_FOLD[char] ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, SLUG_MAX_LENGTH)

export const formatSiteDate = (value, locale) => {
  if (!value) {
    return null
  }
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return null
  }
  return new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(date)
}

/**
 * Case-insensitive match on the project name, used by the list search field.
 * Matching happens on loaded data only, so search never invents results.
 */
export const siteMatchesQuery = (site, query) => {
  const needle = query.trim().toLowerCase()
  if (!needle) {
    return true
  }
  return (site?.name ?? '').toLowerCase().includes(needle)
}

export const filterSites = (sites, { query = '', status = ALL_SITES_FILTER } = {}) =>
  sites.filter(
    (site) =>
      (status === ALL_SITES_FILTER || site.status === status) &&
      siteMatchesQuery(site, query),
  )

/** Counts per status, for the list summary. Derived, never stored. */
export const countSitesByStatus = (sites) =>
  sites.reduce(
    (counts, site) => {
      counts[site.status] = (counts[site.status] ?? 0) + 1
      return counts
    },
    {},
  )

export default SITE_STATUS
