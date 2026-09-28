import { createStarterForm } from '@/models/siteForm'
/**
 * Section library.
 *
 * A section is a reusable band of the page. This file owns the *library data*:
 * which sections exist, what each one is for, and the neutral placeholder copy
 * each one starts with. Turning that data into real blocks is the editor model's
 * job, so there is no import from `siteEditor` here and no cycle.
 *
 * Copy rules for this file, which are product rules rather than style rules:
 *
 *  - Every string is an obviously editable placeholder. There are no invented
 *    company names, customer names, review quotes, addresses, phone numbers,
 *    statistics or business claims. A testimonial slot says "Customer name",
 *    not a plausible-looking person, because a convincing fake testimonial is
 *    the kind of thing a user forgets to replace and then publishes.
 *  - Copy is referenced by key and resolved by the caller with `t`, so a
 *    section reads in the visitor's language.
 *  - Presets are built only from existing block primitives, so a section is
 *    never a special rendering path: it is blocks the user can select, reorder,
 *    duplicate and delete like anything else.
 */

export const SECTION_TYPE = Object.freeze({
  HERO: 'hero',
  FEATURES: 'features',
  CTA: 'cta',
  SPLIT: 'split',
  TESTIMONIALS: 'testimonials',
  CONTACT: 'contact',
  FOOTER: 'footer',
})

/** Block primitive names, mirrored here to keep this file free of editor imports. */
const HEADING = 'heading'
const TEXT = 'text'
const BUTTON = 'button'
const IMAGE = 'image'
const SPACER = 'spacer'

/** Section-level style defaults, shared shape across the library. */
const BAND_STYLE = Object.freeze({
  background: '',
  padding: 56,
  radius: 0,
  maxWidth: 1120,
  align: 'left',
})

export const SITE_SECTIONS = Object.freeze([
  {
    id: SECTION_TYPE.HERO,
    nameKey: 'siteSection.hero.name',
    descriptionKey: 'siteSection.hero.description',
    style: { ...BAND_STYLE, background: 'surface', padding: 72 },
    blocks: [
      { type: HEADING, copyKey: 'heading', style: { fontSize: 44, fontWeight: 800 } },
      { type: TEXT, copyKey: 'body', style: { fontSize: 18 } },
      { type: BUTTON, copyKey: 'action', style: { background: 'accent', padding: 14 } },
    ],
  },
  {
    id: SECTION_TYPE.FEATURES,
    nameKey: 'siteSection.features.name',
    descriptionKey: 'siteSection.features.description',
    style: { ...BAND_STYLE, background: 'surface' },
    blocks: [
      { type: HEADING, copyKey: 'heading', style: { fontSize: 32, fontWeight: 700 } },
      { type: TEXT, copyKey: 'intro', style: { fontSize: 17 } },
      { type: HEADING, copyKey: 'item1Title', style: { fontSize: 20, fontWeight: 700 } },
      { type: TEXT, copyKey: 'item1Body', style: { fontSize: 16 } },
      { type: HEADING, copyKey: 'item2Title', style: { fontSize: 20, fontWeight: 700 } },
      { type: TEXT, copyKey: 'item2Body', style: { fontSize: 16 } },
      { type: HEADING, copyKey: 'item3Title', style: { fontSize: 20, fontWeight: 700 } },
      { type: TEXT, copyKey: 'item3Body', style: { fontSize: 16 } },
    ],
  },
  {
    id: SECTION_TYPE.CTA,
    nameKey: 'siteSection.cta.name',
    descriptionKey: 'siteSection.cta.description',
    style: { ...BAND_STYLE, background: 'accent-soft', padding: 48, align: 'center' },
    blocks: [
      { type: HEADING, copyKey: 'heading', style: { fontSize: 30, fontWeight: 700 } },
      { type: TEXT, copyKey: 'body', style: { fontSize: 17 } },
      { type: BUTTON, copyKey: 'action', style: { background: 'accent', padding: 14 } },
    ],
  },
  {
    id: SECTION_TYPE.SPLIT,
    nameKey: 'siteSection.split.name',
    descriptionKey: 'siteSection.split.description',
    style: BAND_STYLE,
    blocks: [
      { type: HEADING, copyKey: 'heading', style: { fontSize: 32, fontWeight: 700 } },
      { type: TEXT, copyKey: 'body', style: { fontSize: 17 } },
      { type: BUTTON, copyKey: 'action', style: { background: 'accent', padding: 14 } },
      { type: IMAGE, copyKey: 'alt', style: { height: 260 } },
    ],
  },
  {
    id: SECTION_TYPE.TESTIMONIALS,
    nameKey: 'siteSection.testimonials.name',
    descriptionKey: 'siteSection.testimonials.description',
    style: { ...BAND_STYLE, background: 'surface' },
    blocks: [
      { type: HEADING, copyKey: 'heading', style: { fontSize: 30, fontWeight: 700 } },
      { type: TEXT, copyKey: 'item1Quote', style: { fontSize: 17 } },
      { type: TEXT, copyKey: 'item1Name', style: { fontSize: 15, fontWeight: 700 } },
      { type: TEXT, copyKey: 'item2Quote', style: { fontSize: 17 } },
      { type: TEXT, copyKey: 'item2Name', style: { fontSize: 15, fontWeight: 700 } },
    ],
  },
  {
    id: SECTION_TYPE.CONTACT,
    nameKey: 'siteSection.contact.name',
    descriptionKey: 'siteSection.contact.description',
    style: BAND_STYLE,
    blocks: [
      { type: HEADING, copyKey: 'heading', style: { fontSize: 30, fontWeight: 700 } },
      { type: TEXT, copyKey: 'body', style: { fontSize: 17 } },
      { type: TEXT, copyKey: 'address', style: { fontSize: 16 } },
      { type: TEXT, copyKey: 'phone', style: { fontSize: 16 } },
      { type: TEXT, copyKey: 'email', style: { fontSize: 16 } },
      { type: 'form' },
    ],
  },
  {
    id: SECTION_TYPE.FOOTER,
    nameKey: 'siteSection.footer.name',
    descriptionKey: 'siteSection.footer.description',
    style: { ...BAND_STYLE, background: 'surface', padding: 40 },
    blocks: [
      { type: TEXT, copyKey: 'about', style: { fontSize: 16 } },
      { type: TEXT, copyKey: 'link1', style: { fontSize: 15 } },
      { type: TEXT, copyKey: 'link2', style: { fontSize: 15 } },
      { type: SPACER, style: { height: 24 } },
      { type: TEXT, copyKey: 'finePrint', style: { fontSize: 14 } },
    ],
  },
])

/**
 * Label key per section id.
 *
 * Derived from the presets so a section's name can never drift from the name
 * shown in the picker. A migrated or empty band has no library entry, so the UI
 * falls back to its own `editor.section.custom` label.
 */
export const SECTION_TYPE_LABELS = Object.freeze(
  Object.fromEntries(SITE_SECTIONS.map((section) => [section.id, section.nameKey])),
)

export const SECTION_IDS = Object.freeze(SITE_SECTIONS.map((section) => section.id))

export const SECTION_BY_ID = Object.freeze(
  Object.fromEntries(SITE_SECTIONS.map((section) => [section.id, section])),
)

export const isValidSectionId = (value) => SECTION_IDS.includes(value)

export const getSiteSection = (id) => SECTION_BY_ID[id] ?? null

/** Where a section's placeholder copy lives in the locale files. */
export const sectionCopyPrefix = (id) => `siteSection.${id}`

/**
 * Resolves a preset into a plain block specification.
 *
 * `t` is the caller's translation function. It is required, because a section
 * must never fall back to a hard-coded string that would ignore the visitor's
 * language. Each resolved block carries a `content` object ready for
 * `createBlock`.
 */
export const buildSectionSpec = (preset, t) => {
  const prefix = sectionCopyPrefix(preset.id)

  return {
    type: preset.id,
    style: { ...preset.style },
    blocks: preset.blocks.map((block) => {
      const content =
        block.type === 'form'
          ? { form: createStarterForm(t) }
          : block.type === BUTTON
          ? { label: t(`${prefix}.${block.copyKey}`), href: '' }
          : block.type === IMAGE
            ? { alt: t(`${prefix}.${block.copyKey}`), src: '' }
            : { text: t(`${prefix}.${block.copyKey}`) }

      return { type: block.type, content, style: { ...(block.style ?? {}) } }
    }),
  }
}

/** Every copy key a preset needs, so a locale file can be checked for gaps. */
export const listSectionCopyKeys = (preset) =>
  preset.blocks.filter((block) => block.copyKey).map((block) => `${sectionCopyPrefix(preset.id)}.${block.copyKey}`)

export default SITE_SECTIONS
