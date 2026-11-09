import { SECTION_TYPE } from '@/models/siteSection'

/**
 * The "Your information" content collected by the create-site wizard.
 *
 * These are the visitor's own words, not template copy: a brand name, a tagline,
 * a hero, an about paragraph and contact details. Every field is optional and
 * plain text, so the values can travel in a create-site payload and be applied
 * to a fresh editor document without a rich-text or HTML contract.
 */

export const SITE_CONTENT_SHORT_MAX = 120
export const SITE_CONTENT_ABOUT_MAX = 1000

export const SITE_CONTENT_SHORT_FIELDS = Object.freeze([
  'siteName',
  'tagline',
  'heroTitle',
  'heroSubtitle',
  'ctaLabel',
  'email',
  'phone',
  'address',
])

export const SITE_CONTENT_FIELDS = Object.freeze([
  ...SITE_CONTENT_SHORT_FIELDS,
  'aboutText',
])

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PHONE_PATTERN = /^[\d\s+\-()]+$/

/**
 * The editor's page-level SEO limits. They are repeated here rather than
 * imported from `siteEditor` because that model already imports this one; a
 * local constant keeps the dependency pointing one way.
 */
const SEO_MAX = Object.freeze({ title: 60, description: 160 })

/** Editor block types this helper writes to. Mirroring the strings keeps it free of an editor import. */
const BLOCK = Object.freeze({
  HEADING: 'heading',
  TEXT: 'text',
  BUTTON: 'button',
  FORM: 'form',
})

/** Sections that open a page and therefore carry the hero content. */
const HERO_SECTIONS = new Set([
  SECTION_TYPE.HERO,
  SECTION_TYPE.AI_HERO,
  SECTION_TYPE.EDITORIAL_HERO,
  SECTION_TYPE.HERO_SPLIT,
  SECTION_TYPE.HERO_IMAGE,
  SECTION_TYPE.HERO_TYPE,
])

/** Sections whose text block is the page's about copy. */
const ABOUT_SECTIONS = new Set([
  SECTION_TYPE.ABOUT,
  SECTION_TYPE.STORY,
  SECTION_TYPE.STATEMENT,
])

/**
 * Contact sections have a known block order: body, address, phone, email.
 * The ordinals below count text blocks only, so they survive an extra image or
 * button elsewhere in the band.
 */
const CONTACT_TEXT_ORDINALS = Object.freeze({
  address: 1,
  phone: 2,
  email: 3,
})

/**
 * Keeps a value plain: no tags, no control characters, no surrounding spaces.
 * Only the browser's own text escaping is relied on when the value is rendered.
 */
const toPlainText = (value) => {
  if (typeof value !== 'string') {
    return ''
  }
  return value
    .replace(/<\/?[a-z!][^>]*>/gi, ' ')
    .replace(/[\p{Cc}]/gu, '')
    .trim()
}

const textValue = (value, max) => toPlainText(value).slice(0, max)

export const isValidSiteContentEmail = (value) => {
  const email = toPlainText(value)
  return !email || EMAIL_PATTERN.test(email)
}

export const isValidSiteContentPhone = (value) => {
  const phone = toPlainText(value)
  return !phone || PHONE_PATTERN.test(phone)
}

/**
 * Trims and bounds every content field. `siteName` falls back to the project
 * name, because the brand is what the created site should be called when the
 * visitor did not type one.
 */
export const normalizeSiteContent = (raw = {}, fallbackName = '') => ({
  siteName: textValue(raw?.siteName, SITE_CONTENT_SHORT_MAX) || textValue(fallbackName, SITE_CONTENT_SHORT_MAX),
  tagline: textValue(raw?.tagline, SITE_CONTENT_SHORT_MAX),
  heroTitle: textValue(raw?.heroTitle, SITE_CONTENT_SHORT_MAX),
  heroSubtitle: textValue(raw?.heroSubtitle, SITE_CONTENT_SHORT_MAX),
  ctaLabel: textValue(raw?.ctaLabel, SITE_CONTENT_SHORT_MAX),
  aboutText: textValue(raw?.aboutText, SITE_CONTENT_ABOUT_MAX),
  email: textValue(raw?.email, SITE_CONTENT_SHORT_MAX),
  phone: textValue(raw?.phone, SITE_CONTENT_SHORT_MAX),
  address: textValue(raw?.address, SITE_CONTENT_SHORT_MAX),
})

/** Builds the model shape directly from the wizard's values object. */
export const buildSiteContent = (values = {}) =>
  normalizeSiteContent(values, values?.name ?? '')

/** True when the visitor entered something beyond the project-name fallback. */
export const hasUserSiteContent = (content) =>
  [
    'tagline',
    'heroTitle',
    'heroSubtitle',
    'ctaLabel',
    'aboutText',
    'email',
    'phone',
    'address',
  ].some((field) => Boolean(content?.[field]))

/**
 * Finds a section by its type and, when needed, by the block it contains.
 *
 * Indexes are returned rather than ids because the caller is already mapping
 * the same pages and sections; this avoids an id lookup per block.
 */
const findSectionIndex = (pages, types, blockType = null) => {
  for (let pageIndex = 0; pageIndex < pages.length; pageIndex += 1) {
    const sections = pages[pageIndex]?.sections ?? []
    for (let sectionIndex = 0; sectionIndex < sections.length; sectionIndex += 1) {
      const section = sections[sectionIndex]
      if (!types.has(section?.type)) continue
      if (blockType && !(section.blocks ?? []).some((block) => block?.type === blockType)) {
        continue
      }
      return { pageIndex, sectionIndex }
    }
  }
  return null
}

/**
 * Hero sections normally start with an eyebrow text, then the heading, then the
 * supporting line. If the chosen template has no hero at all, only the blank
 * template's starter band stands in for one: it is the plain `custom` section
 * the builder creates so a blank project has somewhere to put the visitor's
 * words. A dashboard's app bar is not a hero and is deliberately not hijacked.
 */
const findHeroIndex = (pages) => {
  const typedHero = findSectionIndex(pages, HERO_SECTIONS)
  if (typedHero) {
    return typedHero
  }
  const homeIndex = pages.findIndex((page) => page.isHome)
  const pageIndex = homeIndex >= 0 ? homeIndex : 0
  const sections = pages[pageIndex]?.sections ?? []
  if (sections.length !== 1 || sections[0]?.type !== 'custom') {
    return null
  }
  return sections[0].blocks?.some((block) => block?.type === BLOCK.HEADING)
    ? { pageIndex, sectionIndex: 0 }
    : null
}

const findBlockIndex = (blocks, type, startAt = 0) =>
  blocks.findIndex(
    (block, index) => index >= startAt && block?.type === type,
  )

const setBlockContent = (blocks, index, key, value) => {
  const block = blocks[index]
  if (!block || block.content?.[key] === value) {
    return blocks
  }
  return blocks.map((item, position) =>
    position === index
      ? { ...item, content: { ...item.content, [key]: value } }
      : item,
  )
}

/** A plain text block, shaped like the editor's own normalized text blocks. */
const createContactTextBlock = (text, id) => ({
  id,
  type: BLOCK.TEXT,
  isVisible: true,
  content: { text },
  style: { fontSize: 16 },
  animation: {
    type: 'none',
    duration: null,
    delay: null,
    easing: 'ease-out',
    trigger: 'scroll',
  },
  overrides: {},
})

const collectBlockIds = (pages) => {
  const ids = new Set()
  for (const page of pages) {
    for (const section of page?.sections ?? []) {
      for (const block of section?.blocks ?? []) {
        if (block?.id) ids.add(block.id)
      }
    }
  }
  return ids
}

const createUniqueBlockId = (usedIds) => {
  let suffix = 1
  let id = `block-contact-${suffix}`
  while (usedIds.has(id)) {
    suffix += 1
    id = `block-contact-${suffix}`
  }
  usedIds.add(id)
  return id
}

/**
 * Applies the create-wizard content to a template-generated editor document.
 *
 * The document model is deliberately unchanged: the visitor's words replace
 * template copy in ordinary heading, text and button blocks. Sections are never
 * removed or reordered, and empty fields leave the template's sample text
 * untouched.
 *
 * Mapping:
 *   siteName     -> the home page's name (the header brand) and its empty SEO
 *                   title
 *   tagline      -> the home page's empty SEO description, and the hero subtitle
 *                   when heroSubtitle is empty
 *   heroTitle    -> first hero heading
 *   heroSubtitle -> first supporting text block in that hero (after the heading,
 *                   so an eyebrow stays an eyebrow)
 *   ctaLabel     -> first hero button label
 *   aboutText    -> first text block in the first about/story/statement section
 *   email/phone/address -> the contact section's email/phone/address text blocks,
 *                   or one appended contact text block when that section has no
 *                   place for the filled values
 *
 * The editor document has no site-settings object, so the settings name has no
 * field here. The project name already reaches the site record through the
 * create payload, and the header brand is the home page's name.
 */
export const applySiteContent = (document, content) => {
  if (!document || !content) {
    return document
  }

  const brand = textValue(content.siteName, SITE_CONTENT_SHORT_MAX)
  const tagline = textValue(content.tagline, SITE_CONTENT_SHORT_MAX)
  const heroTitle = textValue(content.heroTitle, SITE_CONTENT_SHORT_MAX)
  const heroSubtitle =
    textValue(content.heroSubtitle, SITE_CONTENT_SHORT_MAX) || tagline
  const ctaLabel = textValue(content.ctaLabel, SITE_CONTENT_SHORT_MAX)
  const aboutText = textValue(content.aboutText, SITE_CONTENT_ABOUT_MAX)
  const contact = {
    address: textValue(content.address, SITE_CONTENT_SHORT_MAX),
    phone: textValue(content.phone, SITE_CONTENT_SHORT_MAX),
    email: textValue(content.email, SITE_CONTENT_SHORT_MAX),
  }

  const pages = Array.isArray(document.pages) ? document.pages : []
  const heroLocation = findHeroIndex(pages)
  const aboutLocation = findSectionIndex(pages, ABOUT_SECTIONS, BLOCK.TEXT)
  const homeIndex = pages.findIndex((page) => page.isHome)
  const homePageIndex = homeIndex >= 0 ? homeIndex : 0
  const usedBlockIds = collectBlockIds(pages)

  const nextPages = pages.map((page, pageIndex) => {
    let nextPage = page

    if (pageIndex === homePageIndex) {
      /*
       * The site header draws its brand from the home page's name, so this is
       * the document's real brand slot. Changing the name does not touch pages,
       * sections or their order.
       */
      const name = brand || page.name
      const seoTitle = brand && !page.seoTitle
        ? brand.slice(0, SEO_MAX.title)
        : page.seoTitle
      const seoDescription = tagline && !page.seoDescription
        ? tagline.slice(0, SEO_MAX.description)
        : page.seoDescription
      if (
        name !== page.name ||
        seoTitle !== page.seoTitle ||
        seoDescription !== page.seoDescription
      ) {
        nextPage = { ...nextPage, name, seoTitle, seoDescription }
      }
    }

    let pageChanged = false
    const sections = (page.sections ?? []).map((section, sectionIndex) => {
      let blocks = Array.isArray(section.blocks) ? section.blocks : []
      const original = blocks

      if (
        heroLocation &&
        heroLocation.pageIndex === pageIndex &&
        heroLocation.sectionIndex === sectionIndex
      ) {
        const headingIndex = findBlockIndex(blocks, BLOCK.HEADING)
        if (headingIndex >= 0 && heroTitle) {
          blocks = setBlockContent(blocks, headingIndex, 'text', heroTitle)
        }

        /*
         * Start after the heading so a hero's small eyebrow text is preserved.
         * A hero with no heading still gets the first text block.
         */
        const textStart = headingIndex >= 0 ? headingIndex + 1 : 0
        const textIndex = findBlockIndex(blocks, BLOCK.TEXT, textStart)
        if (textIndex >= 0 && heroSubtitle) {
          blocks = setBlockContent(blocks, textIndex, 'text', heroSubtitle)
        }

        const buttonIndex = findBlockIndex(blocks, BLOCK.BUTTON)
        if (buttonIndex >= 0 && ctaLabel) {
          blocks = setBlockContent(blocks, buttonIndex, 'label', ctaLabel)
        }
      }

      if (
        aboutLocation &&
        aboutLocation.pageIndex === pageIndex &&
        aboutLocation.sectionIndex === sectionIndex &&
        aboutText
      ) {
        const textIndex = findBlockIndex(blocks, BLOCK.TEXT)
        if (textIndex >= 0) {
          blocks = setBlockContent(blocks, textIndex, 'text', aboutText)
        }
      }

      if (section.type === SECTION_TYPE.CONTACT) {
        const textBlockIndexes = blocks
          .map((block, index) => (block?.type === BLOCK.TEXT ? index : -1))
          .filter((index) => index >= 0)
        const missing = []

        for (const [field, ordinal] of Object.entries(CONTACT_TEXT_ORDINALS)) {
          const value = contact[field]
          if (!value) continue
          const blockIndex = textBlockIndexes[ordinal]
          if (blockIndex === undefined) {
            missing.push(value)
            continue
          }
          blocks = setBlockContent(blocks, blockIndex, 'text', value)
        }

        if (missing.length > 0) {
          const combined = missing.join(' · ')
          const alreadyPresent = blocks.some(
            (block) => block?.type === BLOCK.TEXT && block.content?.text === combined,
          )
          if (!alreadyPresent) {
            const formIndex = findBlockIndex(blocks, BLOCK.FORM)
            const insertAt = formIndex >= 0 ? formIndex : blocks.length
            const contactBlock = createContactTextBlock(
              combined,
              createUniqueBlockId(usedBlockIds),
            )
            blocks = [
              ...blocks.slice(0, insertAt),
              contactBlock,
              ...blocks.slice(insertAt),
            ]
          }
        }
      }

      if (blocks === original) {
        return section
      }
      pageChanged = true
      return { ...section, blocks }
    })

    if (pageChanged) {
      nextPage = { ...nextPage, sections }
    }

    return nextPage
  })

  if (!nextPages.some((page, index) => page !== pages[index])) {
    return document
  }

  return { ...document, pages: nextPages }
}

/**
 * Cache of probe results, keyed by the (stable, frozen) template document.
 * The wizard renders on every keystroke, so the nine probes run once per
 * template document instead of on every render.
 */
const supportedFieldsCache = new WeakMap()

/**
 * The content fields a given template document can actually host.
 *
 * The mapping above is the single source of truth: a field counts as supported
 * exactly when applying a unique sentinel value for it changes the document.
 * When the template has no slot for a field (for example `aboutText` in a
 * template without an about band), applying it is a no-op and the field is
 * reported as unsupported, so the wizard can hide it and explain why — without
 * this model ever re-declaring the mapping itself.
 *
 * Returns every field for a document without pages, so an unexpected input
 * degrades to the previous behaviour (all fields shown) instead of an empty form.
 */
export const getSupportedContentFields = (document) => {
  if (!document || !Array.isArray(document.pages)) {
    return [...SITE_CONTENT_FIELDS]
  }
  const cached = supportedFieldsCache.get(document)
  if (cached) {
    return cached
  }
  const supported = SITE_CONTENT_FIELDS.filter((field) => {
    const sentinel = `${field} probe value`
    return applySiteContent(document, { [field]: sentinel }) !== document
  })
  supportedFieldsCache.set(document, supported)
  return supported
}

export default normalizeSiteContent
