import { createFormField, createStarterForm, normalizeSiteForm } from '@/models/siteForm'
/**
 * Section library.
 *
 * A section is a reusable band of the page. This file owns the *library data*:
 * which sections exist, what each one is for, how its content is laid out, and
 * the neutral placeholder copy each one starts with. Turning that data into real
 * blocks is the editor model's job, so there is no import from `siteEditor` here
 * and no cycle.
 *
 * Copy rules for this file, which are product rules rather than style rules:
 *
 *  - Every string is an obviously editable placeholder. There are no invented
 *    company names, customer names, review quotes, addresses, phone numbers,
 *    statistics or business claims. A testimonial slot says "Customer name",
 *    not a plausible-looking person, because a convincing fake testimonial is
 *    the kind of thing a user forgets to replace and then publishes.
 *  - Copy is referenced by key and resolved by the caller with `t`, so a
 *    section reads in the visitor's language. A block names the copy it needs in
 *    `copy`, keyed by the content field it fills, so two sections can share one
 *    set of strings (`shared.cards.*`) instead of duplicating them.
 *  - Presets are built only from existing block primitives, so a section is
 *    never a special rendering path: it is blocks the user can select, reorder,
 *    duplicate and delete like anything else.
 *
 * `layout` is a structural hint, not a design. It only says how the section's
 * blocks are arranged (a grid of cards, a two-column split, a full-width row),
 * and the canvas turns it into a data attribute a stylesheet can read. Every
 * layout still resolves to the same flat blocks, so nothing here depends on a
 * special renderer and every block stays individually editable.
 */

export const SECTION_TYPE = Object.freeze({
  HERO: 'hero',
  AI_HERO: 'aiHero',
  FEATURES: 'features',
  CTA: 'cta',
  SPLIT: 'split',
  TESTIMONIALS: 'testimonials',
  CONTACT: 'contact',
  FOOTER: 'footer',
  LOGO_CLOUD: 'logoCloud',
  FEATURE_GRID: 'featureGrid',
  PRODUCT_PREVIEW: 'productPreview',
  PRICING: 'pricing',
  FAQ: 'faq',
  BENTO: 'bento',
  WORKFLOW: 'workflow',
  INTEGRATIONS: 'integrations',
  METRICS: 'metrics',
  PROJECTS: 'projects',
  EDITORIAL_HERO: 'editorialHero',
  SERVICES: 'services',
  ABOUT: 'about',
  STORY: 'story',
  STATS: 'stats',
  CONTACT_CTA: 'contactCta',
  FOOTER_COLUMNS: 'footerColumns',
  FOOTER_DETAILED: 'footerDetailed',
  HERO_SPLIT: 'heroSplit',
  HERO_IMAGE: 'heroImage',
  HERO_TYPE: 'heroType',
  PROJECT_GRID: 'projectGrid',
  STATEMENT: 'statement',
  RECOGNITION: 'recognition',
  MENU: 'menu',
  HOURS: 'hours',
  TRUST: 'trust',
  OFFERING: 'offering',
  APP_BAR: 'appBar',
  KPI_ROW: 'kpiRow',
  CHART_GRID: 'chartGrid',
  DATA_TABLE: 'dataTable',
  ACTIVITY_FEED: 'activityFeed',
  STATUS_GRID: 'statusGrid',
  QUICK_ACTIONS: 'quickActions',
  CUSTOMER_GRID: 'customerGrid',
  REPORT_GRID: 'reportGrid',
  SETTINGS_GROUPS: 'settingsGroups',
  SETTINGS_FORM: 'settingsForm',
})

/**
 * How a section arranges its blocks.
 *
 * `stack` is the original behaviour (one column). The others are pure CSS
 * layouts keyed off the section's `data-layout`: text-ish blocks span the full
 * width while cards and images become grid cells, which is what lets one flat
 * list of blocks read as a grid of cards without nesting.
 */
export const SECTION_LAYOUT = Object.freeze({
  STACK: 'stack',
  GRID: 'grid',
  SPLIT: 'split',
  BENTO: 'bento',
  ROW: 'row',
})

export const SECTION_LAYOUTS = Object.freeze(Object.values(SECTION_LAYOUT))

/** Block primitive names, mirrored here to keep this file free of editor imports. */
const HEADING = 'heading'
const TEXT = 'text'
const BUTTON = 'button'
const IMAGE = 'image'
const SPACER = 'spacer'
const FORM = 'form'
const PANEL = 'panel'
const STAT = 'stat'
const CHART = 'chart'
const TABLE = 'table'
const STATUS_LIST = 'statusList'
const TOOLBAR = 'toolbar'

/** Section-level style defaults, shared shape across the library. */
const band = (patch = {}) => ({
  background: '',
  padding: 56,
  radius: 0,
  maxWidth: 1120,
  align: 'left',
  ...patch,
})

/**
 * An entrance for a designed section.
 *
 * Motion is declared by the preset and never forced on a user's own section, so
 * a band someone added themselves stays static until they choose an effect. A
 * section can also set `stagger`, which moves the entrance from the band onto
 * each block in turn instead — used for grids, where a single fade would hide
 * the fact that the cards arrive one after another.
 */
const entrance = (type, patch = {}) => ({ type, ...patch })

/** Block spec helpers. `copy` maps a content field to a locale key suffix. */
const heading = (copy, style = { fontSize: 34, fontWeight: 700 }) => ({
  type: HEADING,
  copy: { text: copy },
  style,
})
const text = (copy, style = { fontSize: 17 }) => ({
  type: TEXT,
  copy: { text: copy },
  style,
})
const button = (copy, style = { background: 'accent', padding: 14 }) => ({
  type: BUTTON,
  copy: { label: copy },
  style,
})
const image = (copy, style = {}) => ({ type: IMAGE, copy: { alt: copy }, style })
/** A card. `extra` is static (non-translated) content such as an image slot. */
const panel = ({ title, body, eyebrow, action, alt }, extra) => ({
  type: PANEL,
  copy: {
    ...(eyebrow ? { eyebrow } : {}),
    ...(title ? { title } : {}),
    ...(body ? { body } : {}),
    ...(action ? { action } : {}),
    ...(alt ? { alt } : {}),
  },
  ...(extra ? { content: extra } : {}),
})
const card = (n, extra) =>
  panel({ title: `shared.cards.item${n}Title`, body: `shared.cards.item${n}Body` }, extra)
const cardWithImage = (n, alt) =>
  panel(
    { title: `shared.cards.item${n}Title`, body: `shared.cards.item${n}Body`, alt },
    { imageSlot: true },
  )
const stat = (n) => panel({ title: `shared.stats.value${n}`, body: `shared.stats.label${n}` })
/**
 * Phase 2 card helpers.
 *
 * The shared cards above are deliberately generic so several sections can point
 * at one set of words. That does not work once a page carries two card bands —
 * a studio page with both "selected work" and an asymmetric project grid would
 * repeat the same titles. These helpers give the new bands their own words while
 * still producing the same generic `panel` block.
 */
const projectCard = (n, alt) =>
  panel({ title: `projectGrid.item${n}Title`, body: `projectGrid.item${n}Body`, alt }, { imageSlot: true })
const menuCard = (n) =>
  panel({ eyebrow: `menu.item${n}Tag`, title: `menu.item${n}Title`, body: `menu.item${n}Body` })
const recognitionCard = (n) =>
  panel({ eyebrow: `recognition.item${n}Year`, title: `recognition.item${n}Title` })
/**
 * Phase 3 card helpers.
 *
 * `trust` and `offering` are the two new generic bands. They are close to
 * `recognition` and `menu` in shape but carry their own words, because a finance
 * page's security strip and a spa's treatment list say nothing about awards or
 * food and must not borrow that copy.
 */
const trustCard = (n) =>
  panel({ title: `trust.item${n}Title`, body: `trust.item${n}Body` })
const offeringCard = (n) =>
  panel({
    eyebrow: `offering.item${n}Tag`,
    title: `offering.item${n}Title`,
    body: `offering.item${n}Body`,
  })

/**
 * Phase 4 application block helpers.
 *
 * These build the five generic application primitives. Unlike the card helpers
 * above, their content is structured (arrays of columns, rows, items and
 * filters), so they use a `content` factory that receives `t` directly and a
 * `copyKeys` list so the locale gap check can still find their keys. Nothing
 * here is Atlas-specific: any analytics, admin or app template can reuse them.
 */
const statBlock = (n, trend = 'up') => ({
  type: STAT,
  copy: {
    label: `kpiRow.item${n}Label`,
    value: `kpiRow.item${n}Value`,
    delta: `kpiRow.item${n}Delta`,
    caption: `kpiRow.item${n}Caption`,
  },
  content: { trend },
})

const chartBlock = (n, variant = 'bars') => ({
  type: CHART,
  copy: { title: `chartGrid.item${n}Title`, caption: `chartGrid.item${n}Caption` },
  content: { variant },
})

const toolbarBlock = (prefix, filters, action = `${prefix}.action`) => ({
  type: TOOLBAR,
  content: (t) => ({
    search: t(`siteSection.${prefix}.search`),
    filters: filters.map((key) => t(`siteSection.${prefix}.${key}`)),
    action: t(`siteSection.${action}`),
  }),
  copyKeys: [
    `${prefix}.search`,
    ...filters.map((key) => `${prefix}.${key}`),
    action,
  ],
})

const tableBlock = (prefix, columns, rowCount) => {
  const columnKeys = columns.map((_, index) => `col${index + 1}`)
  const rowKeys = Array.from({ length: rowCount }, (_, row) =>
    columnKeys.map((_, column) => `r${row + 1}c${column + 1}`),
  )
  return {
    type: TABLE,
    content: (t) => ({
      caption: t(`siteSection.${prefix}.caption`),
      columns: columnKeys.map((key) => t(`siteSection.${prefix}.${key}`)),
      rows: rowKeys.map((row) => row.map((key) => t(`siteSection.${prefix}.${key}`))),
    }),
    copyKeys: [`${prefix}.caption`, ...columnKeys.map((key) => `${prefix}.${key}`), ...rowKeys.flat().map((key) => `${prefix}.${key}`)],
  }
}

const statusBlock = (prefix, tones = []) => {
  const items = tones.map((tone, index) => ({ tone, index: index + 1 }))
  return {
    type: STATUS_LIST,
    content: (t) => ({
      title: t(`siteSection.${prefix}.title`),
      items: items.map((item) => ({
        label: t(`siteSection.${prefix}.item${item.index}Label`),
        value: t(`siteSection.${prefix}.item${item.index}Value`),
        tone: item.tone,
      })),
    }),
    copyKeys: [
      `${prefix}.title`,
      ...items.flatMap((item) => [`${prefix}.item${item.index}Label`, `${prefix}.item${item.index}Value`]),
    ],
  }
}

/** A settings form built from the existing form primitive, with toggle fields. */
const settingsFormBlock = (prefix) => ({
  type: FORM,
  form: (t) =>
    normalizeSiteForm({
      name: t(`siteSection.${prefix}.formName`),
      submitLabel: t(`siteSection.${prefix}.submit`),
      buttonStyle: 'solid',
      fields: [1, 2, 3].map((index) =>
        createFormField({ type: 'checkbox', label: t(`siteSection.${prefix}.field${index}`) }),
      ),
    }),
  copyKeys: [`${prefix}.formName`, `${prefix}.submit`, `${prefix}.field1`, `${prefix}.field2`, `${prefix}.field3`],
})

export const SITE_SECTIONS = Object.freeze([
  /* ---- Original, restrained marketing sections ---- */
  {
    id: SECTION_TYPE.HERO,
    nameKey: 'siteSection.hero.name',
    descriptionKey: 'siteSection.hero.description',
    layout: SECTION_LAYOUT.STACK,
    style: band({ background: 'surface', padding: 72 }),
    animation: entrance('fade', { duration: 420 }),
    blocks: [
      heading('hero.heading', { fontSize: 44, fontWeight: 800 }),
      text('hero.body', { fontSize: 18 }),
      button('hero.action'),
    ],
  },
  {
    /*
     * The AI hero.
     *
     * A different composition from `hero` on purpose: centred copy over a wide
     * interface image, which is what a product-led page needs and what separates
     * a premium template from a free one. It reuses the same heading, text,
     * button and image blocks every other section is built from.
     */
    id: SECTION_TYPE.AI_HERO,
    nameKey: 'siteSection.aiHero.name',
    descriptionKey: 'siteSection.aiHero.description',
    layout: SECTION_LAYOUT.STACK,
    style: band({ padding: 88, align: 'center' }),
    animation: entrance('slide-up', { duration: 520 }),
    blocks: [
      text('aiHero.eyebrow', { fontSize: 13, fontWeight: 700 }),
      heading('aiHero.heading', { fontSize: 50, fontWeight: 800 }),
      text('aiHero.body', { fontSize: 19 }),
      button('aiHero.action'),
      image('aiHero.alt', { height: 420 }),
    ],
  },
  {
    id: SECTION_TYPE.FEATURES,
    nameKey: 'siteSection.features.name',
    descriptionKey: 'siteSection.features.description',
    layout: SECTION_LAYOUT.STACK,
    style: band({ background: 'surface' }),
    blocks: [
      heading('features.heading', { fontSize: 32, fontWeight: 700 }),
      text('features.intro'),
      heading('features.item1Title', { fontSize: 20, fontWeight: 700 }),
      text('features.item1Body', { fontSize: 16 }),
      heading('features.item2Title', { fontSize: 20, fontWeight: 700 }),
      text('features.item2Body', { fontSize: 16 }),
      heading('features.item3Title', { fontSize: 20, fontWeight: 700 }),
      text('features.item3Body', { fontSize: 16 }),
    ],
  },
  {
    id: SECTION_TYPE.CTA,
    nameKey: 'siteSection.cta.name',
    descriptionKey: 'siteSection.cta.description',
    layout: SECTION_LAYOUT.STACK,
    style: band({ background: 'accent-soft', padding: 48, align: 'center' }),
    blocks: [
      heading('cta.heading', { fontSize: 30, fontWeight: 700 }),
      text('cta.body'),
      button('cta.action'),
    ],
  },
  {
    id: SECTION_TYPE.SPLIT,
    nameKey: 'siteSection.split.name',
    descriptionKey: 'siteSection.split.description',
    layout: SECTION_LAYOUT.SPLIT,
    style: band(),
    blocks: [
      heading('split.heading', { fontSize: 32, fontWeight: 700 }),
      text('split.body'),
      button('split.action'),
      image('split.alt', { height: 320 }),
    ],
  },
  {
    id: SECTION_TYPE.TESTIMONIALS,
    nameKey: 'siteSection.testimonials.name',
    descriptionKey: 'siteSection.testimonials.description',
    layout: SECTION_LAYOUT.GRID,
    style: band({ background: 'surface' }),
    blocks: [
      heading('testimonials.heading', { fontSize: 30, fontWeight: 700 }),
      panel({ body: 'testimonials.item1Quote', title: 'testimonials.item1Name' }),
      panel({ body: 'testimonials.item2Quote', title: 'testimonials.item2Name' }),
      panel({ body: 'testimonials.item3Quote', title: 'testimonials.item3Name' }),
    ],
  },
  {
    id: SECTION_TYPE.CONTACT,
    nameKey: 'siteSection.contact.name',
    descriptionKey: 'siteSection.contact.description',
    layout: SECTION_LAYOUT.STACK,
    style: band(),
    blocks: [
      heading('contact.heading', { fontSize: 30, fontWeight: 700 }),
      text('contact.body'),
      text('contact.address', { fontSize: 16 }),
      text('contact.phone', { fontSize: 16 }),
      text('contact.email', { fontSize: 16 }),
      { type: 'form' },
    ],
  },
  {
    id: SECTION_TYPE.FOOTER,
    nameKey: 'siteSection.footer.name',
    descriptionKey: 'siteSection.footer.description',
    layout: SECTION_LAYOUT.STACK,
    style: band({ background: 'surface', padding: 40 }),
    blocks: [
      text('footer.about', { fontSize: 16 }),
      text('footer.link1', { fontSize: 15 }),
      text('footer.link2', { fontSize: 15 }),
      { type: SPACER, style: { height: 24 } },
      text('footer.finePrint', { fontSize: 14 }),
    ],
  },

  /* ---- Free / SaaS building blocks ---- */
  {
    id: SECTION_TYPE.LOGO_CLOUD,
    nameKey: 'siteSection.logoCloud.name',
    descriptionKey: 'siteSection.logoCloud.description',
    layout: SECTION_LAYOUT.ROW,
    style: band({ background: 'surface', padding: 40, align: 'center' }),
    blocks: [
      heading('shared.logos.heading', { fontSize: 14, fontWeight: 600 }),
      text('shared.logos.item1', { fontSize: 18, fontWeight: 700 }),
      text('shared.logos.item2', { fontSize: 18, fontWeight: 700 }),
      text('shared.logos.item3', { fontSize: 18, fontWeight: 700 }),
      text('shared.logos.item4', { fontSize: 18, fontWeight: 700 }),
      text('shared.logos.item5', { fontSize: 18, fontWeight: 700 }),
    ],
  },
  {
    id: SECTION_TYPE.FEATURE_GRID,
    nameKey: 'siteSection.featureGrid.name',
    descriptionKey: 'siteSection.featureGrid.description',
    layout: SECTION_LAYOUT.GRID,
    style: band({ background: 'surface', padding: 72 }),
    blocks: [
      heading('shared.cards.heading', { fontSize: 36, fontWeight: 800 }),
      text('shared.cards.intro', { fontSize: 18 }),
      card(1),
      card(2),
      card(3),
      card(4),
      card(5),
      card(6),
    ],
  },
  {
    id: SECTION_TYPE.PRODUCT_PREVIEW,
    nameKey: 'siteSection.productPreview.name',
    descriptionKey: 'siteSection.productPreview.description',
    layout: SECTION_LAYOUT.SPLIT,
    style: band({ background: 'surface', padding: 72 }),
    blocks: [
      heading('productPreview.heading', { fontSize: 34, fontWeight: 800 }),
      text('productPreview.body', { fontSize: 18 }),
      button('productPreview.action'),
      image('productPreview.alt', { height: 360 }),
    ],
  },
  {
    id: SECTION_TYPE.PRICING,
    nameKey: 'siteSection.pricing.name',
    descriptionKey: 'siteSection.pricing.description',
    layout: SECTION_LAYOUT.GRID,
    style: band({ padding: 72 }),
    blocks: [
      heading('shared.pricing.heading', { fontSize: 36, fontWeight: 800 }),
      text('shared.pricing.intro', { fontSize: 18 }),
      panel({ eyebrow: 'shared.pricing.plan1Tag', title: 'shared.pricing.plan1Price', body: 'shared.pricing.plan1Body', action: 'shared.pricing.action' }),
      panel({ eyebrow: 'shared.pricing.plan2Tag', title: 'shared.pricing.plan2Price', body: 'shared.pricing.plan2Body', action: 'shared.pricing.action' }),
      panel({ eyebrow: 'shared.pricing.plan3Tag', title: 'shared.pricing.plan3Price', body: 'shared.pricing.plan3Body', action: 'shared.pricing.action' }),
    ],
  },
  {
    id: SECTION_TYPE.FAQ,
    nameKey: 'siteSection.faq.name',
    descriptionKey: 'siteSection.faq.description',
    layout: SECTION_LAYOUT.STACK,
    style: band({ background: 'surface', padding: 64 }),
    blocks: [
      heading('faq.heading', { fontSize: 34, fontWeight: 800 }),
      panel({ title: 'faq.q1', body: 'faq.a1' }),
      panel({ title: 'faq.q2', body: 'faq.a2' }),
      panel({ title: 'faq.q3', body: 'faq.a3' }),
      panel({ title: 'faq.q4', body: 'faq.a4' }),
    ],
  },

  /* ---- Premium / AI building blocks ---- */
  {
    id: SECTION_TYPE.BENTO,
    nameKey: 'siteSection.bento.name',
    descriptionKey: 'siteSection.bento.description',
    layout: SECTION_LAYOUT.BENTO,
    style: band({ background: 'surface', padding: 72 }),
    animation: entrance('scale', { duration: 480 }),
    stagger: 90,
    blocks: [
      heading('bento.heading', { fontSize: 36, fontWeight: 800 }),
      text('bento.intro', { fontSize: 18 }),
      card(1),
      card(2),
      card(3),
      card(4),
    ],
  },
  {
    id: SECTION_TYPE.WORKFLOW,
    nameKey: 'siteSection.workflow.name',
    descriptionKey: 'siteSection.workflow.description',
    layout: SECTION_LAYOUT.GRID,
    style: band({ padding: 72 }),
    blocks: [
      heading('shared.cards.heading', { fontSize: 34, fontWeight: 800 }),
      text('shared.cards.intro', { fontSize: 18 }),
      panel({ eyebrow: 'workflow.step1Tag', title: 'shared.cards.item1Title', body: 'shared.cards.item1Body' }),
      panel({ eyebrow: 'workflow.step2Tag', title: 'shared.cards.item2Title', body: 'shared.cards.item2Body' }),
      panel({ eyebrow: 'workflow.step3Tag', title: 'shared.cards.item3Title', body: 'shared.cards.item3Body' }),
    ],
  },
  {
    id: SECTION_TYPE.INTEGRATIONS,
    nameKey: 'siteSection.integrations.name',
    descriptionKey: 'siteSection.integrations.description',
    layout: SECTION_LAYOUT.GRID,
    style: band({ background: 'surface', padding: 72 }),
    blocks: [
      heading('integrations.heading', { fontSize: 34, fontWeight: 800 }),
      text('integrations.intro', { fontSize: 18 }),
      card(1),
      card(2),
      card(3),
      card(4),
      card(5),
      card(6),
    ],
  },
  {
    id: SECTION_TYPE.METRICS,
    nameKey: 'siteSection.metrics.name',
    descriptionKey: 'siteSection.metrics.description',
    layout: SECTION_LAYOUT.ROW,
    style: band({ padding: 64, align: 'center' }),
    animation: entrance('slide-up', { duration: 420 }),
    stagger: 80,
    blocks: [
      heading('shared.stats.heading', { fontSize: 32, fontWeight: 800 }),
      stat(1),
      stat(2),
      stat(3),
      stat(4),
    ],
  },
  {
    id: SECTION_TYPE.PROJECTS,
    nameKey: 'siteSection.projects.name',
    descriptionKey: 'siteSection.projects.description',
    layout: SECTION_LAYOUT.GRID,
    style: band({ padding: 72 }),
    animation: entrance('scale', { duration: 480 }),
    stagger: 100,
    blocks: [
      heading('projects.heading', { fontSize: 36, fontWeight: 800 }),
      text('projects.intro', { fontSize: 18 }),
      cardWithImage(1, 'projects.alt1'),
      cardWithImage(2, 'projects.alt2'),
      cardWithImage(3, 'projects.alt3'),
    ],
  },

  /* ---- Editorial / luxury sections (Maison) ---- */
  {
    id: SECTION_TYPE.EDITORIAL_HERO,
    nameKey: 'siteSection.editorialHero.name',
    descriptionKey: 'siteSection.editorialHero.description',
    layout: SECTION_LAYOUT.STACK,
    style: band({ padding: 96 }),
    animation: entrance('fade', { duration: 520 }),
    blocks: [
      text('editorialHero.eyebrow', { fontSize: 14, fontWeight: 600 }),
      heading('editorialHero.heading', { fontSize: 56, fontWeight: 700 }),
      text('editorialHero.body', { fontSize: 20 }),
      button('editorialHero.action', { background: 'accent', padding: 14 }),
      image('editorialHero.alt', { height: 420 }),
    ],
  },
  {
    id: SECTION_TYPE.SERVICES,
    nameKey: 'siteSection.services.name',
    descriptionKey: 'siteSection.services.description',
    layout: SECTION_LAYOUT.GRID,
    style: band({ padding: 72 }),
    blocks: [
      heading('services.heading', { fontSize: 34, fontWeight: 700 }),
      text('services.intro', { fontSize: 18 }),
      cardWithImage(1, 'services.alt1'),
      cardWithImage(2, 'services.alt2'),
      cardWithImage(3, 'services.alt3'),
    ],
  },
  {
    id: SECTION_TYPE.ABOUT,
    nameKey: 'siteSection.about.name',
    descriptionKey: 'siteSection.about.description',
    layout: SECTION_LAYOUT.SPLIT,
    style: band({ background: 'surface', padding: 72 }),
    blocks: [
      heading('about.heading', { fontSize: 34, fontWeight: 700 }),
      text('about.body', { fontSize: 18 }),
      image('about.alt', { height: 360 }),
    ],
  },
  {
    id: SECTION_TYPE.STORY,
    nameKey: 'siteSection.story.name',
    descriptionKey: 'siteSection.story.description',
    layout: SECTION_LAYOUT.SPLIT,
    style: band({ padding: 72 }),
    blocks: [
      heading('story.heading', { fontSize: 34, fontWeight: 700 }),
      text('story.body', { fontSize: 18 }),
      image('story.alt', { height: 360 }),
    ],
  },
  {
    id: SECTION_TYPE.STATS,
    nameKey: 'siteSection.stats.name',
    descriptionKey: 'siteSection.stats.description',
    layout: SECTION_LAYOUT.ROW,
    style: band({ background: 'surface', padding: 56 }),
    animation: entrance('fade', { duration: 420 }),
    stagger: 80,
    blocks: [
      heading('stats.heading', { fontSize: 30, fontWeight: 700 }),
      stat(1),
      stat(2),
      stat(3),
      stat(4),
    ],
  },
  {
    id: SECTION_TYPE.CONTACT_CTA,
    nameKey: 'siteSection.contactCta.name',
    descriptionKey: 'siteSection.contactCta.description',
    layout: SECTION_LAYOUT.STACK,
    style: band({ background: 'accent-soft', padding: 64, align: 'center' }),
    blocks: [
      heading('contactCta.heading', { fontSize: 32, fontWeight: 700 }),
      text('contactCta.body', { fontSize: 18 }),
      button('contactCta.action'),
    ],
  },
  {
    id: SECTION_TYPE.FOOTER_COLUMNS,
    nameKey: 'siteSection.footerColumns.name',
    descriptionKey: 'siteSection.footerColumns.description',
    layout: SECTION_LAYOUT.GRID,
    style: band({ background: 'surface', padding: 48 }),
    blocks: [
      text('footerColumns.about', { fontSize: 16 }),
      panel({ title: 'shared.footer.col1Title', body: 'shared.footer.col1Body' }),
      panel({ title: 'shared.footer.col2Title', body: 'shared.footer.col2Body' }),
      panel({ title: 'shared.footer.col3Title', body: 'shared.footer.col3Body' }),
      text('footerColumns.finePrint', { fontSize: 14 }),
    ],
  },
  {
    id: SECTION_TYPE.FOOTER_DETAILED,
    nameKey: 'siteSection.footerDetailed.name',
    descriptionKey: 'siteSection.footerDetailed.description',
    layout: SECTION_LAYOUT.GRID,
    style: band({ background: 'surface', padding: 56 }),
    blocks: [
      text('footerDetailed.about', { fontSize: 16 }),
      panel({ title: 'shared.footer.col1Title', body: 'shared.footer.col1Body' }),
      panel({ title: 'shared.footer.col2Title', body: 'shared.footer.col2Body' }),
      panel({ title: 'shared.footer.col3Title', body: 'shared.footer.col3Body' }),
    ],
  },
  /*
   * ---------------------------------------------------------------------------
   * Phase 2 bands
   *
   * Agency, hospitality, studio and cinematic templates needed openings and
   * bands the first library did not have. Every one below is still built from
   * the same heading / text / button / image / panel blocks and the same five
   * layouts, so nothing here is a bespoke renderer — it is more library data.
   * ---------------------------------------------------------------------------
   */
  {
    /*
     * Split hero.
     *
     * Words hold the left column and one large picture the right. That is the
     * asymmetric opening an agency or studio wants — a statement next to the
     * work rather than centred above it — and it is the plain `split` layout.
     */
    id: SECTION_TYPE.HERO_SPLIT,
    nameKey: 'siteSection.heroSplit.name',
    descriptionKey: 'siteSection.heroSplit.description',
    layout: SECTION_LAYOUT.SPLIT,
    style: band({ background: 'surface', padding: 88, maxWidth: 1200 }),
    animation: entrance('slide-up', { duration: 520 }),
    blocks: [
      text('heroSplit.eyebrow', { fontSize: 13, fontWeight: 700 }),
      heading('heroSplit.heading', { fontSize: 50, fontWeight: 800 }),
      text('heroSplit.body', { fontSize: 18 }),
      button('heroSplit.action'),
      image('heroSplit.alt', { height: 400 }),
    ],
  },
  {
    /*
     * Image hero.
     *
     * The picture leads and the words follow underneath. Ordering image first is
     * what makes the band read as image-led rather than as a headline with a
     * picture beneath it, which is what a restaurant and a cinematic portfolio
     * both need.
     */
    id: SECTION_TYPE.HERO_IMAGE,
    nameKey: 'siteSection.heroImage.name',
    descriptionKey: 'siteSection.heroImage.description',
    layout: SECTION_LAYOUT.STACK,
    style: band({ padding: 56, maxWidth: 1200, align: 'center' }),
    animation: entrance('fade', { duration: 620 }),
    blocks: [
      image('heroImage.alt', { height: 440 }),
      text('heroImage.eyebrow', { fontSize: 13, fontWeight: 700 }),
      heading('heroImage.heading', { fontSize: 46, fontWeight: 800 }),
      text('heroImage.body', { fontSize: 19 }),
      button('heroImage.action'),
    ],
  },
  {
    /*
     * Type hero.
     *
     * No picture at all. A whole opening made of type is the most editorial
     * option in the library, and it gives a design studio a hero that cannot be
     * mistaken for a product page.
     */
    id: SECTION_TYPE.HERO_TYPE,
    nameKey: 'siteSection.heroType.name',
    descriptionKey: 'siteSection.heroType.description',
    layout: SECTION_LAYOUT.STACK,
    style: band({ padding: 120, maxWidth: 1080 }),
    animation: entrance('slide-up', { duration: 640 }),
    stagger: 90,
    blocks: [
      text('heroType.eyebrow', { fontSize: 13, fontWeight: 700 }),
      { ...heading('heroType.heading', { fontSize: 64, fontWeight: 800 }), overrides: { mobile: { fontSize: 36 } } },
      text('heroType.body', { fontSize: 19 }),
      button('heroType.action'),
    ],
  },
  {
    /*
     * Project grid.
     *
     * The asymmetric one: four project cards on the `bento` layout, so the first
     * is large and the last spans the full width. It is the same layout the AI
     * template uses for feature tiles, applied to projects with image slots.
     */
    id: SECTION_TYPE.PROJECT_GRID,
    nameKey: 'siteSection.projectGrid.name',
    descriptionKey: 'siteSection.projectGrid.description',
    layout: SECTION_LAYOUT.BENTO,
    style: band({ background: 'surface', padding: 80 }),
    animation: entrance('reveal', { duration: 520 }),
    stagger: 110,
    blocks: [
      heading('projectGrid.heading', { fontSize: 36, fontWeight: 800 }),
      text('projectGrid.intro', { fontSize: 18 }),
      projectCard(1, 'projectGrid.item1Alt'),
      projectCard(2, 'projectGrid.item2Alt'),
      projectCard(3, 'projectGrid.item3Alt'),
      projectCard(4, 'projectGrid.item4Alt'),
    ],
  },
  {
    /*
     * Statement.
     *
     * Oversized type with room around it and nothing else. It is the band a
     * studio puts between its work to slow the page down, and the same band a
     * portfolio uses as an "about" statement.
     */
    id: SECTION_TYPE.STATEMENT,
    nameKey: 'siteSection.statement.name',
    descriptionKey: 'siteSection.statement.description',
    layout: SECTION_LAYOUT.STACK,
    style: band({ padding: 120, maxWidth: 960, align: 'center' }),
    animation: entrance('fade', { duration: 560 }),
    blocks: [
      heading('statement.heading', { fontSize: 44, fontWeight: 700 }),
      text('statement.body', { fontSize: 19 }),
    ],
  },
  {
    id: SECTION_TYPE.RECOGNITION,
    nameKey: 'siteSection.recognition.name',
    descriptionKey: 'siteSection.recognition.description',
    layout: SECTION_LAYOUT.GRID,
    style: band({ padding: 80 }),
    animation: entrance('fade', { duration: 480 }),
    stagger: 90,
    blocks: [
      heading('recognition.heading', { fontSize: 34, fontWeight: 800 }),
      text('recognition.intro', { fontSize: 18 }),
      recognitionCard(1),
      recognitionCard(2),
      recognitionCard(3),
      recognitionCard(4),
    ],
  },
  {
    id: SECTION_TYPE.MENU,
    nameKey: 'siteSection.menu.name',
    descriptionKey: 'siteSection.menu.description',
    layout: SECTION_LAYOUT.GRID,
    style: band({ background: 'surface', padding: 80 }),
    animation: entrance('slide-up', { duration: 480 }),
    stagger: 90,
    blocks: [
      heading('menu.heading', { fontSize: 38, fontWeight: 800 }),
      text('menu.intro', { fontSize: 18 }),
      menuCard(1),
      menuCard(2),
      menuCard(3),
      menuCard(4),
    ],
  },
  {
    /*
     * Hours.
     *
     * A short row of day / time cards. It reuses the `row` layout the stats band
     * uses, so it collapses to a column on the narrow frames without new CSS.
     */
    id: SECTION_TYPE.HOURS,
    nameKey: 'siteSection.hours.name',
    descriptionKey: 'siteSection.hours.description',
    layout: SECTION_LAYOUT.ROW,
    style: band({ padding: 64, align: 'center' }),
    animation: entrance('slide-up', { duration: 440 }),
    stagger: 80,
    blocks: [
      heading('hours.heading', { fontSize: 30, fontWeight: 700 }),
      panel({ title: 'hours.day1', body: 'hours.time1' }),
      panel({ title: 'hours.day2', body: 'hours.time2' }),
      panel({ title: 'hours.day3', body: 'hours.time3' }),
      panel({ title: 'hours.day4', body: 'hours.time4' }),
    ],
  },
  /*
   * ---------------------------------------------------------------------------
   * Phase 3 bands
   *
   * Business, construction, wellness and finance needed two bands the library
   * still lacked: a trust/quality strip and a catalogue of offerings. Both are
   * built from the same panel primitive and the same grid/row layouts as
   * everything else, and both are written generically enough that a later
   * healthcare, education or hospitality template can reuse them.
   * ---------------------------------------------------------------------------
   */
  {
    /*
     * Trust strip.
     *
     * A row of short, even points about safety, security or quality — the band
     * a construction firm or a finance platform puts directly under its claims.
     * The cards carry no image, so it reads as reassurance rather than as work.
     */
    id: SECTION_TYPE.TRUST,
    nameKey: 'siteSection.trust.name',
    descriptionKey: 'siteSection.trust.description',
    layout: SECTION_LAYOUT.ROW,
    style: band({ background: 'surface', padding: 64, align: 'center' }),
    animation: entrance('fade', { duration: 460 }),
    stagger: 80,
    blocks: [
      heading('trust.heading', { fontSize: 32, fontWeight: 800 }),
      trustCard(1),
      trustCard(2),
      trustCard(3),
      trustCard(4),
    ],
  },
  {
    /*
     * Offering list.
     *
     * A grid of named treatments, services or items, each with a short note. The
     * label block carries the eyebrow, so a spa can print a duration beside each
     * treatment without needing a field the model does not have.
     */
    id: SECTION_TYPE.OFFERING,
    nameKey: 'siteSection.offering.name',
    descriptionKey: 'siteSection.offering.description',
    layout: SECTION_LAYOUT.GRID,
    style: band({ padding: 72 }),
    animation: entrance('slide-up', { duration: 480 }),
    stagger: 90,
    blocks: [
      heading('offering.heading', { fontSize: 32, fontWeight: 700 }),
      text('offering.intro', { fontSize: 18 }),
      offeringCard(1),
      offeringCard(2),
      offeringCard(3),
      offeringCard(4),
    ],
  },
  /* ---- Phase 4: application / dashboard sections ---- */
  {
    /*
     * App bar — the compact header an application screen opens with.
     *
     * A `row` band: the page title spans the width and the status line and the
     * page action sit beside each other under it. It reuses the heading, text and
     * button blocks every other section is built from.
     */
    id: SECTION_TYPE.APP_BAR,
    nameKey: 'siteSection.appBar.name',
    descriptionKey: 'siteSection.appBar.description',
    layout: SECTION_LAYOUT.ROW,
    style: band({ background: 'surface', padding: 28 }),
    animation: entrance('fade', { duration: 360 }),
    blocks: [
      heading('appBar.title', { fontSize: 28, fontWeight: 700 }),
      text('appBar.subtitle', { fontSize: 15 }),
      button('appBar.action', { background: 'accent', padding: 10 }),
    ],
  },
  {
    /*
     * KPI cards — the strip of headline numbers at the top of a dashboard.
     *
     * Four `stat` blocks in a row. Each carries a label, a value and a change;
     * the change's direction is a token the theme colours, not a baked-in colour.
     */
    id: SECTION_TYPE.KPI_ROW,
    nameKey: 'siteSection.kpiRow.name',
    descriptionKey: 'siteSection.kpiRow.description',
    layout: SECTION_LAYOUT.ROW,
    style: band({ padding: 32 }),
    animation: entrance('slide-up', { duration: 460 }),
    stagger: 70,
    blocks: [statBlock(1, 'up'), statBlock(2, 'up'), statBlock(3, 'down'), statBlock(4, 'flat')],
  },
  {
    /*
     * Chart panels — two visualisation placeholders beside each other.
     *
     * The charts are inline SVG placeholders, so a dashboard reads as a dashboard
     * without a charting library or a claim that a backend answered.
     */
    id: SECTION_TYPE.CHART_GRID,
    nameKey: 'siteSection.chartGrid.name',
    descriptionKey: 'siteSection.chartGrid.description',
    layout: SECTION_LAYOUT.GRID,
    style: band({ padding: 48 }),
    animation: entrance('fade', { duration: 420 }),
    stagger: 70,
    blocks: [
      heading('chartGrid.heading', { fontSize: 30, fontWeight: 700 }),
      text('chartGrid.intro', { fontSize: 16 }),
      chartBlock(1, 'bars'),
      chartBlock(2, 'line'),
    ],
  },
  {
    /*
     * Data table — a filter bar above a table of rows.
     *
     * One band holds the filter/action bar and the table, because in an
     * application the controls belong to the list they act on.
     */
    id: SECTION_TYPE.DATA_TABLE,
    nameKey: 'siteSection.dataTable.name',
    descriptionKey: 'siteSection.dataTable.description',
    layout: SECTION_LAYOUT.STACK,
    style: band({ padding: 48 }),
    animation: entrance('fade', { duration: 420 }),
    blocks: [
      heading('dataTable.heading', { fontSize: 30, fontWeight: 700 }),
      text('dataTable.intro', { fontSize: 16 }),
      toolbarBlock('dataTable', ['filter1', 'filter2', 'filter3'], 'dataTable.action'),
      tableBlock('dataTable', [1, 2, 3, 4], 4),
    ],
  },
  {
    /*
     * Activity feed — a stack of timestamped events.
     *
     * Four cards in a column. The timestamp is the card's eyebrow, so the feed
     * keeps the same primitive as every other card.
     */
    id: SECTION_TYPE.ACTIVITY_FEED,
    nameKey: 'siteSection.activityFeed.name',
    descriptionKey: 'siteSection.activityFeed.description',
    layout: SECTION_LAYOUT.STACK,
    style: band({ padding: 48 }),
    animation: entrance('fade', { duration: 420 }),
    stagger: 60,
    blocks: [
      heading('activityFeed.heading', { fontSize: 30, fontWeight: 700 }),
      panel({ eyebrow: 'activityFeed.item1Time', title: 'activityFeed.item1Title', body: 'activityFeed.item1Body' }),
      panel({ eyebrow: 'activityFeed.item2Time', title: 'activityFeed.item2Title', body: 'activityFeed.item2Body' }),
      panel({ eyebrow: 'activityFeed.item3Time', title: 'activityFeed.item3Title', body: 'activityFeed.item3Body' }),
      panel({ eyebrow: 'activityFeed.item4Time', title: 'activityFeed.item4Title', body: 'activityFeed.item4Body' }),
    ],
  },
  {
    /*
     * Status panels — labelled states, e.g. service health or order statuses.
     *
     * Two `statusList` blocks side by side; each row reads as a label and a
     * badge, and the badge's tone is set by the preset and editable after.
     */
    id: SECTION_TYPE.STATUS_GRID,
    nameKey: 'siteSection.statusGrid.name',
    descriptionKey: 'siteSection.statusGrid.description',
    layout: SECTION_LAYOUT.GRID,
    style: band({ padding: 48 }),
    animation: entrance('fade', { duration: 420 }),
    stagger: 80,
    blocks: [
      heading('statusGrid.heading', { fontSize: 30, fontWeight: 700 }),
      text('statusGrid.intro', { fontSize: 16 }),
      statusBlock('statusGrid.panel1', ['positive', 'positive', 'warning']),
      statusBlock('statusGrid.panel2', ['neutral', 'positive', 'critical']),
    ],
  },
  {
    /*
     * Quick actions — a row of shortcuts.
     *
     * The first action is the accent colour and the rest are quiet, so the row
     * reads as "one thing to do, several things you can do".
     */
    id: SECTION_TYPE.QUICK_ACTIONS,
    nameKey: 'siteSection.quickActions.name',
    descriptionKey: 'siteSection.quickActions.description',
    layout: SECTION_LAYOUT.ROW,
    style: band({ background: 'surface', padding: 40 }),
    animation: entrance('fade', { duration: 360 }),
    blocks: [
      heading('quickActions.heading', { fontSize: 26, fontWeight: 700 }),
      button('quickActions.action1', { background: 'accent', padding: 10 }),
      button('quickActions.action2', { background: 'background', padding: 10 }),
      button('quickActions.action3', { background: 'background', padding: 10 }),
      button('quickActions.action4', { background: 'background', padding: 10 }),
    ],
  },
  {
    /*
     * Customer cards — a summary of the people in an application.
     *
     * Name, plan and a short detail per card. Reusable for any CRM or admin
     * screen that lists accounts rather than products.
     */
    id: SECTION_TYPE.CUSTOMER_GRID,
    nameKey: 'siteSection.customerGrid.name',
    descriptionKey: 'siteSection.customerGrid.description',
    layout: SECTION_LAYOUT.GRID,
    style: band({ padding: 48 }),
    animation: entrance('fade', { duration: 420 }),
    stagger: 70,
    blocks: [
      heading('customerGrid.heading', { fontSize: 30, fontWeight: 700 }),
      text('customerGrid.intro', { fontSize: 16 }),
      panel({ eyebrow: 'customerGrid.item1Tag', title: 'customerGrid.item1Title', body: 'customerGrid.item1Body' }),
      panel({ eyebrow: 'customerGrid.item2Tag', title: 'customerGrid.item2Title', body: 'customerGrid.item2Body' }),
      panel({ eyebrow: 'customerGrid.item3Tag', title: 'customerGrid.item3Title', body: 'customerGrid.item3Body' }),
      panel({ eyebrow: 'customerGrid.item4Tag', title: 'customerGrid.item4Title', body: 'customerGrid.item4Body' }),
    ],
  },
  {
    /*
     * Report cards — a small library of reports, each with an action.
     *
     * The action opens the report; it is a label on a card, never a real export,
     * so a template cannot imply a report was generated.
     */
    id: SECTION_TYPE.REPORT_GRID,
    nameKey: 'siteSection.reportGrid.name',
    descriptionKey: 'siteSection.reportGrid.description',
    layout: SECTION_LAYOUT.GRID,
    style: band({ padding: 48 }),
    animation: entrance('fade', { duration: 420 }),
    stagger: 70,
    blocks: [
      heading('reportGrid.heading', { fontSize: 30, fontWeight: 700 }),
      text('reportGrid.intro', { fontSize: 16 }),
      panel({ eyebrow: 'reportGrid.item1Tag', title: 'reportGrid.item1Title', body: 'reportGrid.item1Body', action: 'reportGrid.action' }),
      panel({ eyebrow: 'reportGrid.item2Tag', title: 'reportGrid.item2Title', body: 'reportGrid.item2Body', action: 'reportGrid.action' }),
      panel({ eyebrow: 'reportGrid.item3Tag', title: 'reportGrid.item3Title', body: 'reportGrid.item3Body', action: 'reportGrid.action' }),
      panel({ eyebrow: 'reportGrid.item4Tag', title: 'reportGrid.item4Title', body: 'reportGrid.item4Body', action: 'reportGrid.action' }),
    ],
  },
  {
    /*
     * Settings groups — grouped settings sections on an application settings page.
     */
    id: SECTION_TYPE.SETTINGS_GROUPS,
    nameKey: 'siteSection.settingsGroups.name',
    descriptionKey: 'siteSection.settingsGroups.description',
    layout: SECTION_LAYOUT.GRID,
    style: band({ padding: 48 }),
    animation: entrance('fade', { duration: 420 }),
    stagger: 70,
    blocks: [
      heading('settingsGroups.heading', { fontSize: 30, fontWeight: 700 }),
      text('settingsGroups.intro', { fontSize: 16 }),
      panel({ title: 'settingsGroups.item1Title', body: 'settingsGroups.item1Body' }),
      panel({ title: 'settingsGroups.item2Title', body: 'settingsGroups.item2Body' }),
      panel({ title: 'settingsGroups.item3Title', body: 'settingsGroups.item3Body' }),
    ],
  },
  {
    /*
     * Settings form — a grouped form of toggles.
     *
     * Built from the existing form primitive with checkbox fields, so it opens in
     * the form settings panel as an ordinary editable form rather than a new kind
     * of control. Nothing in it is wired to a backend.
     */
    id: SECTION_TYPE.SETTINGS_FORM,
    nameKey: 'siteSection.settingsForm.name',
    descriptionKey: 'siteSection.settingsForm.description',
    layout: SECTION_LAYOUT.STACK,
    style: band({ padding: 48 }),
    animation: entrance('fade', { duration: 420 }),
    blocks: [
      heading('settingsForm.heading', { fontSize: 30, fontWeight: 700 }),
      text('settingsForm.intro', { fontSize: 16 }),
      settingsFormBlock('settingsForm'),
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

/** Resolves a block's translated content from its `copy` map. */
const resolveBlockContent = (block, t) => {
  if (block.type === FORM) {
    /*
     * A form block owns a whole form. Most sections use the shared starter form,
     * but a section may supply its own factory (e.g. the settings toggles) so it
     * still opens in the ordinary form settings panel.
     */
    return { form: block.form ? block.form(t) : createStarterForm(t) }
  }
  /*
   * Structured content (a table's columns and rows, a status list's items) cannot
   * be expressed as a flat `copy` map, so such a block supplies a `content`
   * factory that receives `t` directly. A plain block keeps its static `content`
   * object. In both cases the `copy` map is layered on top for the flat fields.
   */
  const content = typeof block.content === 'function' ? block.content(t) : { ...(block.content ?? {}) }
  for (const [field, key] of Object.entries(block.copy ?? {})) {
    content[field] = t(`siteSection.${key}`)
  }
  return content
}

/**
 * Resolves a preset into a plain block specification.
 *
 * `t` is the caller's translation function. It is required, because a section
 * must never fall back to a hard-coded string that would ignore the visitor's
 * language. The resolved style travels with each block so a template's designed
 * type scale survives into the editor instead of collapsing to block defaults.
 *
 * A preset either animates as one band (`animation`) or hands its entrance to
 * each block in turn (`animation` plus `stagger`). The second form is what makes
 * a grid of cards arrive rather than appear all at once; the two are never both
 * applied, so a staggered section does not also fade its whole band.
 */
export const buildSectionSpec = (preset, t) => {
  const stagger = Number.isFinite(preset.stagger) ? preset.stagger : null
  return {
    type: preset.id,
    layout: preset.layout,
    style: { ...preset.style },
    animation: preset.animation && !stagger ? { ...preset.animation } : undefined,
    blocks: preset.blocks.map((block, index) => ({
      type: block.type,
      content: resolveBlockContent(block, t),
      style: { ...(block.style ?? {}) },
      overrides: block.overrides,
      animation:
        preset.animation && stagger
          ? { ...preset.animation, delay: index * stagger }
          : undefined,
    })),
  }
}

/** Every copy key a preset needs, so a locale file can be checked for gaps. */
export const listSectionCopyKeys = (preset) =>
  preset.blocks.flatMap((block) => [
    ...Object.values(block.copy ?? {}).map((key) => `siteSection.${key}`),
    /* Structured blocks name their keys explicitly for the same check. */
    ...(block.copyKeys ?? []).map((key) => `siteSection.${key}`),
  ])

export default SITE_SECTIONS
