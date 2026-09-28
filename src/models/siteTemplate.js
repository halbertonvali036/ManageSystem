/**
 * Website template architecture.
 *
 * A template is a *starting structure*, not a finished design and not a
 * marketplace product. Each one names the pages a new project begins with, the
 * section types on those pages, and the site theme it starts on. The blocks
 * themselves come from the section library, so a template never carries a second
 * copy of page content that could drift away from it.
 *
 * The field set is deliberately the shape a backend can own later:
 *
 *   id             stable identifier
 *   nameKey        localised name
 *   descriptionKey localised description
 *   category       used by the /templates filter
 *   layout         a short hint for the structural preview
 *   thumbnail      preview descriptor, not an image file
 *   pages          page skeletons, each a list of section ids
 *   themePreset    initial site theme id
 *   isStarter      true for every entry here (see the note below)
 *
 * `thumbnail` is a descriptor rather than a URL on purpose. There is no image
 * hosting yet, so a real screenshot would have to be a fake asset. The
 * templates page draws the structure preview from `pages` instead, which means
 * the preview cannot disagree with what the template actually creates.
 *
 * `isStarter` is true for all of these: they are frontend starter presets, not
 * production marketplace content. The flag is carried in the data so the UI can
 * say so, rather than leaving the distinction to a comment.
 */

import { SECTION_TYPE, isValidSectionId } from '@/models/siteSection'
import { DEFAULT_SITE_THEME_ID, isValidSiteThemeId } from '@/models/siteTheme'

export const TEMPLATE_CATEGORY = Object.freeze({
  BASIC: 'basic',
  BUSINESS: 'business',
  PERSONAL: 'personal',
  MARKETING: 'marketing',
})

/** Filter order for the templates page. */
export const TEMPLATE_CATEGORIES = Object.freeze([
  { id: 'all', labelKey: 'templates.filterAll' },
  { id: TEMPLATE_CATEGORY.BASIC, labelKey: 'templates.categoryBasic' },
  { id: TEMPLATE_CATEGORY.BUSINESS, labelKey: 'templates.categoryBusiness' },
  { id: TEMPLATE_CATEGORY.PERSONAL, labelKey: 'templates.categoryPersonal' },
  { id: TEMPLATE_CATEGORY.MARKETING, labelKey: 'templates.categoryMarketing' },
])

/**
 * Label key per category.
 *
 * Separate from `TEMPLATE_CATEGORIES` because a card needs to label *its* category
 * without walking the filter list, and deriving the key from the id would make a
 * renamed category silently fall back to a missing translation.
 */
export const TEMPLATE_CATEGORY_LABELS = Object.freeze(
  Object.fromEntries(TEMPLATE_CATEGORIES.map((entry) => [entry.id, entry.labelKey])),
)

export const ALL_TEMPLATE_CATEGORIES = 'all'

const page = (id, nameKey, sections) => ({ id, nameKey, sections: Object.freeze(sections) })

export const SITE_TEMPLATES = Object.freeze([
  {
    id: 'blank',
    category: TEMPLATE_CATEGORY.BASIC,
    layout: 'blank',
    nameKey: 'siteTemplate.blank.name',
    descriptionKey: 'siteTemplate.blank.description',
    thumbnail: Object.freeze({ kind: 'blank' }),
    themePreset: 'aurora',
    isStarter: true,
    pages: Object.freeze([page('home', 'siteTemplate.blank.pageHome', [])]),
  },
  {
    id: 'business',
    category: TEMPLATE_CATEGORY.BUSINESS,
    layout: 'landing',
    nameKey: 'siteTemplate.business.name',
    descriptionKey: 'siteTemplate.business.description',
    thumbnail: Object.freeze({ kind: 'structure', pageCount: 2 }),
    themePreset: 'aurora',
    isStarter: true,
    pages: Object.freeze([
      page('home', 'siteTemplate.business.pageHome', [
        SECTION_TYPE.HERO,
        SECTION_TYPE.FEATURES,
        SECTION_TYPE.CTA,
        SECTION_TYPE.FOOTER,
      ]),
      page('contact', 'siteTemplate.business.pageContact', [
        SECTION_TYPE.CONTACT,
        SECTION_TYPE.FOOTER,
      ]),
    ]),
  },
  {
    id: 'portfolio',
    category: TEMPLATE_CATEGORY.PERSONAL,
    layout: 'split',
    nameKey: 'siteTemplate.portfolio.name',
    descriptionKey: 'siteTemplate.portfolio.description',
    thumbnail: Object.freeze({ kind: 'structure', pageCount: 2 }),
    themePreset: 'ink',
    isStarter: true,
    pages: Object.freeze([
      page('home', 'siteTemplate.portfolio.pageHome', [
        SECTION_TYPE.HERO,
        SECTION_TYPE.SPLIT,
        SECTION_TYPE.TESTIMONIALS,
        SECTION_TYPE.CTA,
      ]),
      page('about', 'siteTemplate.portfolio.pageAbout', [
        SECTION_TYPE.SPLIT,
        SECTION_TYPE.FOOTER,
      ]),
    ]),
  },
  {
    id: 'landing',
    category: TEMPLATE_CATEGORY.MARKETING,
    layout: 'narrative',
    nameKey: 'siteTemplate.landing.name',
    descriptionKey: 'siteTemplate.landing.description',
    thumbnail: Object.freeze({ kind: 'structure', pageCount: 1 }),
    themePreset: 'sand',
    isStarter: true,
    pages: Object.freeze([
      page('home', 'siteTemplate.landing.pageHome', [
        SECTION_TYPE.HERO,
        SECTION_TYPE.SPLIT,
        SECTION_TYPE.FEATURES,
        SECTION_TYPE.TESTIMONIALS,
        SECTION_TYPE.CTA,
        SECTION_TYPE.FOOTER,
      ]),
    ]),
  },
])

export const SITE_TEMPLATE_IDS = Object.freeze(SITE_TEMPLATES.map((t) => t.id))

export const SITE_TEMPLATE_BY_ID = Object.freeze(
  Object.fromEntries(SITE_TEMPLATES.map((t) => [t.id, t])),
)

export const DEFAULT_SITE_TEMPLATE_ID = 'blank'
export const BLANK_SITE_TEMPLATE_ID = DEFAULT_SITE_TEMPLATE_ID

export const isValidSiteTemplateId = (value) => SITE_TEMPLATE_IDS.includes(value)

export const getSiteTemplate = (id) =>
  SITE_TEMPLATE_BY_ID[id] ?? SITE_TEMPLATE_BY_ID[DEFAULT_SITE_TEMPLATE_ID]

/**
 * Validates a template skeleton.
 *
 * A template that names a section the library does not define, or a theme that
 * does not exist, would produce a draft that cannot render. Bad references are
 * dropped rather than passed through, so the templates page and the wizard can
 * both trust what they read.
 */
export const normalizeSiteTemplate = (raw) => {
  if (!raw || typeof raw !== 'object') {
    return getSiteTemplate(DEFAULT_SITE_TEMPLATE_ID)
  }

  const preset = getSiteTemplate(raw.id)
  const pages = Array.isArray(raw.pages) && raw.pages.length ? raw.pages : preset.pages

  return {
    ...preset,
    pages: pages
      .map((entry) => ({
        id: typeof entry?.id === 'string' && entry.id ? entry.id : 'page',
        nameKey:
          typeof entry?.nameKey === 'string' && entry.nameKey ? entry.nameKey : preset.pages[0].nameKey,
        sections: (Array.isArray(entry?.sections) ? entry.sections : []).filter(isValidSectionId),
      }))
      .slice(0, 20),
  }
}

/** Total section count across a template, used for the summary line. */
export const countTemplateSections = (template) =>
  (template?.pages ?? []).reduce((total, entry) => total + entry.sections.length, 0)

export const filterTemplatesByCategory = (category = ALL_TEMPLATE_CATEGORIES) =>
  category === ALL_TEMPLATE_CATEGORIES
    ? SITE_TEMPLATES
    : SITE_TEMPLATES.filter((template) => template.category === category)

/**
 * Builds the page skeletons a template would create.
 *
 * This is what the wizard and the editor both use, so a project started from a
 * template is described the same way everywhere. It returns descriptors, not
 * editor blocks: the editor turns them into real sections with real ids when the
 * draft is built.
 */
export const getTemplatePageSkeletons = (templateId) => {
  const template = normalizeSiteTemplate({ id: templateId })
  return template.pages.map((entry) => ({
    id: entry.id,
    nameKey: entry.nameKey,
    sections: [...entry.sections],
  }))
}

/** The theme a new project starts on, validated against the theme library. */
export const getTemplateThemePresetId = (templateId) => {
  const themePreset = getSiteTemplate(templateId).themePreset
  return isValidSiteThemeId(themePreset) ? themePreset : DEFAULT_SITE_THEME_ID
}

export default SITE_TEMPLATES
