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
 *   slug           stable machine name (also a future marketplace key)
 *   category       used by the /templates filter
 *   tier           free or pro; the gallery shows this, nothing enforces it yet
 *   layout         a short hint for the structural preview
 *   tags           short localised chips (localisation keys)
 *   features       localised bullet list of what the template includes
 *   thumbnail      preview descriptor, not an image file
 *   pages          page skeletons, each a list of section ids
 *   themePreset    initial site theme id
 *
 * `thumbnail` is a descriptor rather than a URL on purpose. There is no image
 * hosting yet, so a real screenshot would have to be a fake asset. The
 * templates page draws the structure preview from `pages` instead, which means
 * the preview cannot disagree with what the template actually creates.
 *
 * `tier` is presentation only. There is no billing gate here: the flag exists so
 * the gallery can label a template honestly instead of inferring value from a
 * badge. The value of a pro template is its composition, pages and detail.
 */

import { SECTION_TYPE, isValidSectionId } from '@/models/siteSection'
import { DEFAULT_SITE_THEME_ID, isValidSiteThemeId } from '@/models/siteTheme'

export const TEMPLATE_CATEGORY = Object.freeze({
  SAAS: 'saas',
  PORTFOLIO: 'portfolio',
  AI: 'ai',
  REAL_ESTATE: 'realEstate',
  AGENCY: 'agency',
  RESTAURANT: 'restaurant',
  STUDIO: 'studio',
  BUSINESS: 'business',
  CONSTRUCTION: 'construction',
  WELLNESS: 'wellness',
  FINANCE: 'finance',
  DASHBOARD: 'dashboard',
})

/**
 * Filter order for the templates page.
 *
 * The order is the gallery taxonomy, not the order the templates are defined in:
 * the category ids are stable and never change, only where their chip sits and
 * what it is called.
 */
export const TEMPLATE_CATEGORIES = Object.freeze([
  { id: 'all', labelKey: 'templates.filterAll' },
  { id: TEMPLATE_CATEGORY.SAAS, labelKey: 'templates.categorySaas' },
  { id: TEMPLATE_CATEGORY.PORTFOLIO, labelKey: 'templates.categoryPortfolio' },
  { id: TEMPLATE_CATEGORY.AGENCY, labelKey: 'templates.categoryAgency' },
  { id: TEMPLATE_CATEGORY.RESTAURANT, labelKey: 'templates.categoryRestaurant' },
  { id: TEMPLATE_CATEGORY.BUSINESS, labelKey: 'templates.categoryBusiness' },
  { id: TEMPLATE_CATEGORY.AI, labelKey: 'templates.categoryAi' },
  { id: TEMPLATE_CATEGORY.REAL_ESTATE, labelKey: 'templates.categoryRealEstate' },
  { id: TEMPLATE_CATEGORY.STUDIO, labelKey: 'templates.categoryStudio' },
  { id: TEMPLATE_CATEGORY.CONSTRUCTION, labelKey: 'templates.categoryConstruction' },
  { id: TEMPLATE_CATEGORY.WELLNESS, labelKey: 'templates.categoryWellness' },
  { id: TEMPLATE_CATEGORY.FINANCE, labelKey: 'templates.categoryFinance' },
  { id: TEMPLATE_CATEGORY.DASHBOARD, labelKey: 'templates.categoryDashboard' },
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

export const TEMPLATE_TIER = Object.freeze({
  FREE: 'free',
  PRO: 'pro',
})

export const TEMPLATE_TIER_LABELS = Object.freeze({
  [TEMPLATE_TIER.FREE]: 'templates.tierFree',
  [TEMPLATE_TIER.PRO]: 'templates.tierPro',
})

/** The "any tier" filter value, separate from a real tier so the two cannot mix. */
export const ALL_TEMPLATE_TIERS = 'all'

/** Tier filter order for the templates page. */
export const TEMPLATE_TIERS = Object.freeze([
  { id: ALL_TEMPLATE_TIERS, labelKey: 'templates.filterAllTiers' },
  { id: TEMPLATE_TIER.FREE, labelKey: 'templates.tierFree' },
  { id: TEMPLATE_TIER.PRO, labelKey: 'templates.tierPro' },
])

export const ALL_TEMPLATE_CATEGORIES = 'all'

const page = (id, nameKey, sections) => ({ id, nameKey, sections: Object.freeze(sections) })

/** Page name keys are shared across templates, so a page reads the same anywhere. */
const PAGE = Object.freeze({
  HOME: 'siteTemplate.pageHome',
  WORK: 'siteTemplate.pageWork',
  ABOUT: 'siteTemplate.pageAbout',
  CONTACT: 'siteTemplate.pageContact',
  PRICING: 'siteTemplate.pagePricing',
  FEATURES: 'siteTemplate.pageFeatures',
  SOLUTIONS: 'siteTemplate.pageSolutions',
  PROJECTS: 'siteTemplate.pageProjects',
  SERVICES: 'siteTemplate.pageServices',
  STUDIO: 'siteTemplate.pageStudio',
  MENU: 'siteTemplate.pageMenu',
  PROJECT: 'siteTemplate.pageProject',
  TREATMENTS: 'siteTemplate.pageTreatments',
  BOOKING: 'siteTemplate.pageBooking',
  PRODUCT: 'siteTemplate.pageProduct',
  SECURITY: 'siteTemplate.pageSecurity',
  DASHBOARD: 'siteTemplate.pageDashboard',
  ANALYTICS: 'siteTemplate.pageAnalytics',
  CUSTOMERS: 'siteTemplate.pageCustomers',
  TRANSACTIONS: 'siteTemplate.pageTransactions',
  REPORTS: 'siteTemplate.pageReports',
  SETTINGS: 'siteTemplate.pageSettings',
})

const S = SECTION_TYPE

/**
 * The blank starting point.
 *
 * It is the default a project begins on, but it is not a designed template and
 * is deliberately kept out of the gallery: an empty page is a starting state, not
 * something to browse. It stays in the id lookup so `getSiteTemplate('blank')`
 * and a project created without a template both keep working.
 */
const BLANK_TEMPLATE = Object.freeze({
  id: 'blank',
  slug: 'blank',
  category: TEMPLATE_CATEGORY.SAAS,
  tier: TEMPLATE_TIER.FREE,
  layout: 'blank',
  nameKey: 'siteTemplate.blank.name',
  descriptionKey: 'siteTemplate.blank.description',
  thumbnail: Object.freeze({ kind: 'blank' }),
  themePreset: 'aurora',
  tags: Object.freeze([]),
  features: Object.freeze([]),
  pages: Object.freeze([page('home', PAGE.HOME, [])]),
})

/**
 * The designed templates.
 *
 * They share one section library and one editor, but differ in theme, in the set
 * of pages they start with, and in the sections they compose. Nothing here is a
 * rendered component: every one is a skeleton of library sections, so every
 * template opens as an ordinary editable draft.
 */
export const SITE_TEMPLATES = Object.freeze([
  {
    id: 'saas-starter',
    slug: 'saas-starter',
    category: TEMPLATE_CATEGORY.SAAS,
    tier: TEMPLATE_TIER.FREE,
    layout: 'landing',
    nameKey: 'siteTemplate.saasStarter.name',
    descriptionKey: 'siteTemplate.saasStarter.description',
    thumbnail: Object.freeze({ kind: 'structure', pageCount: 3 }),
    themePreset: 'saas',
    tags: Object.freeze(['templates.tagSaaS', 'templates.tagClean', 'templates.tagResponsive']),
    features: Object.freeze(['templates.featurePages3', 'templates.featureCleanHero', 'templates.featurePricing']),
    pages: Object.freeze([
      page('home', PAGE.HOME, [
        S.HERO,
        S.LOGO_CLOUD,
        S.FEATURE_GRID,
        S.PRODUCT_PREVIEW,
        S.PRICING,
        S.TESTIMONIALS,
        S.FAQ,
        S.CTA,
        S.FOOTER,
      ]),
      page('pricing', PAGE.PRICING, [S.HERO, S.PRICING, S.FAQ, S.FOOTER]),
      page('contact', PAGE.CONTACT, [S.CONTACT, S.FOOTER]),
    ]),
  },
  {
    id: 'portfolio-minimal',
    slug: 'portfolio-minimal',
    category: TEMPLATE_CATEGORY.PORTFOLIO,
    tier: TEMPLATE_TIER.FREE,
    layout: 'split',
    nameKey: 'siteTemplate.portfolioMinimal.name',
    descriptionKey: 'siteTemplate.portfolioMinimal.description',
    thumbnail: Object.freeze({ kind: 'structure', pageCount: 4 }),
    themePreset: 'atelier',
    tags: Object.freeze(['templates.tagPortfolio', 'templates.tagMinimal', 'templates.tagEditorial']),
    features: Object.freeze(['templates.featureEditorialHero', 'templates.featureProjects', 'templates.featureContact']),
    pages: Object.freeze([
      page('home', PAGE.HOME, [
        S.EDITORIAL_HERO,
        S.PROJECTS,
        S.SERVICES,
        S.ABOUT,
        S.TESTIMONIALS,
        S.CONTACT_CTA,
        S.FOOTER_COLUMNS,
      ]),
      page('work', PAGE.WORK, [S.EDITORIAL_HERO, S.PROJECTS, S.SERVICES, S.FOOTER_COLUMNS]),
      page('about', PAGE.ABOUT, [S.ABOUT, S.SERVICES, S.TESTIMONIALS, S.FOOTER_COLUMNS]),
      page('contact', PAGE.CONTACT, [S.CONTACT_CTA, S.CONTACT, S.FOOTER_COLUMNS]),
    ]),
  },
  {
    id: 'nova-ai',
    slug: 'nova-ai',
    category: TEMPLATE_CATEGORY.AI,
    tier: TEMPLATE_TIER.PRO,
    layout: 'landing',
    nameKey: 'siteTemplate.novaAi.name',
    descriptionKey: 'siteTemplate.novaAi.description',
    thumbnail: Object.freeze({ kind: 'structure', pageCount: 6 }),
    themePreset: 'nova',
    tags: Object.freeze(['templates.tagAi', 'templates.tagSaaS', 'templates.tagPremium']),
    features: Object.freeze(['templates.featureBento', 'templates.featureMetrics', 'templates.featureDetailedFooter', 'templates.featureSixPages']),
    pages: Object.freeze([
      page('home', PAGE.HOME, [
        S.AI_HERO,
        S.LOGO_CLOUD,
        S.BENTO,
        S.PRODUCT_PREVIEW,
        S.WORKFLOW,
        S.INTEGRATIONS,
        S.METRICS,
        S.PRICING,
        S.TESTIMONIALS,
        S.FAQ,
        S.CTA,
        S.FOOTER_DETAILED,
      ]),
      page('features', PAGE.FEATURES, [S.HERO, S.BENTO, S.FEATURE_GRID, S.WORKFLOW, S.INTEGRATIONS, S.CTA, S.FOOTER_DETAILED]),
      page('solutions', PAGE.SOLUTIONS, [S.HERO, S.METRICS, S.BENTO, S.WORKFLOW, S.CTA, S.FOOTER_DETAILED]),
      page('pricing', PAGE.PRICING, [S.HERO, S.PRICING, S.METRICS, S.FAQ, S.CTA, S.FOOTER_DETAILED]),
      page('about', PAGE.ABOUT, [S.EDITORIAL_HERO, S.METRICS, S.WORKFLOW, S.TESTIMONIALS, S.FOOTER_DETAILED]),
      page('contact', PAGE.CONTACT, [S.CONTACT_CTA, S.CONTACT, S.FOOTER_DETAILED]),
    ]),
  },
  {
    id: 'maison',
    slug: 'maison',
    category: TEMPLATE_CATEGORY.REAL_ESTATE,
    tier: TEMPLATE_TIER.PRO,
    layout: 'editorial',
    nameKey: 'siteTemplate.maison.name',
    descriptionKey: 'siteTemplate.maison.description',
    thumbnail: Object.freeze({ kind: 'structure', pageCount: 5 }),
    themePreset: 'maison',
    tags: Object.freeze(['templates.tagLuxury', 'templates.tagArchitecture', 'templates.tagPremium']),
    features: Object.freeze(['templates.featureSplitHero', 'templates.featureProjects', 'templates.featureStats', 'templates.featureFivePages']),
    pages: Object.freeze([
      page('home', PAGE.HOME, [
        S.HERO_SPLIT,
        S.STATS,
        S.PROJECTS,
        S.STORY,
        S.SERVICES,
        S.TESTIMONIALS,
        S.CONTACT_CTA,
        S.FOOTER_COLUMNS,
      ]),
      page('projects', PAGE.PROJECTS, [S.EDITORIAL_HERO, S.PROJECTS, S.STORY, S.FOOTER_COLUMNS]),
      page('services', PAGE.SERVICES, [S.EDITORIAL_HERO, S.SERVICES, S.STATS, S.CONTACT_CTA, S.FOOTER_COLUMNS]),
      page('about', PAGE.ABOUT, [S.EDITORIAL_HERO, S.STORY, S.STATS, S.TESTIMONIALS, S.FOOTER_COLUMNS]),
      page('contact', PAGE.CONTACT, [S.CONTACT_CTA, S.CONTACT, S.FOOTER_COLUMNS]),
    ]),
  },
  /**
   * Agency Clean — free.
   *
   * A digital/creative agency: an asymmetric split opening, a logo strip, a
   * services grid, featured work and a numbered process. It shares the generic
   * card bands with the other templates but composes them around the split hero,
   * so it never reads as the SaaS landing page.
   */
  {
    id: 'agency-clean',
    slug: 'agency-clean',
    category: TEMPLATE_CATEGORY.AGENCY,
    tier: TEMPLATE_TIER.FREE,
    layout: 'split',
    nameKey: 'siteTemplate.agencyClean.name',
    descriptionKey: 'siteTemplate.agencyClean.description',
    thumbnail: Object.freeze({ kind: 'structure', pageCount: 4 }),
    themePreset: 'agency',
    tags: Object.freeze(['templates.tagAgency', 'templates.tagClean', 'templates.tagResponsive']),
    features: Object.freeze(['templates.featurePages4', 'templates.featureSplitHero', 'templates.featureProcess']),
    pages: Object.freeze([
      page('home', PAGE.HOME, [
        S.HERO_SPLIT,
        S.LOGO_CLOUD,
        S.SERVICES,
        S.PROJECTS,
        S.WORKFLOW,
        S.TESTIMONIALS,
        S.CTA,
        S.FOOTER,
      ]),
      page('services', PAGE.SERVICES, [S.HERO_SPLIT, S.SERVICES, S.WORKFLOW, S.CTA, S.FOOTER]),
      page('work', PAGE.WORK, [S.HERO_SPLIT, S.PROJECTS, S.TESTIMONIALS, S.FOOTER]),
      page('contact', PAGE.CONTACT, [S.CONTACT_CTA, S.CONTACT, S.FOOTER]),
    ]),
  },
  /**
   * Restaurant Simple — free.
   *
   * Warm and hospitality-led rather than software-led: the photograph opens the
   * page, a short story follows, then a menu of categories, a chef highlight, the
   * opening hours and a reservation call to action.
   */
  {
    id: 'restaurant-simple',
    slug: 'restaurant-simple',
    category: TEMPLATE_CATEGORY.RESTAURANT,
    tier: TEMPLATE_TIER.FREE,
    layout: 'editorial',
    nameKey: 'siteTemplate.restaurantSimple.name',
    descriptionKey: 'siteTemplate.restaurantSimple.description',
    thumbnail: Object.freeze({ kind: 'structure', pageCount: 4 }),
    themePreset: 'bistro',
    tags: Object.freeze(['templates.tagRestaurant', 'templates.tagWarm', 'templates.tagResponsive']),
    features: Object.freeze(['templates.featurePages4', 'templates.featureImageHero', 'templates.featureMenuSection']),
    pages: Object.freeze([
      page('home', PAGE.HOME, [
        S.HERO_IMAGE,
        S.ABOUT,
        S.MENU,
        S.STORY,
        S.HOURS,
        S.TESTIMONIALS,
        S.CONTACT_CTA,
        S.FOOTER,
      ]),
      page('menu', PAGE.MENU, [S.HERO, S.MENU, S.HOURS, S.CONTACT_CTA, S.FOOTER]),
      page('about', PAGE.ABOUT, [S.HERO, S.STORY, S.HOURS, S.TESTIMONIALS, S.FOOTER]),
      page('contact', PAGE.CONTACT, [S.CONTACT_CTA, S.CONTACT, S.FOOTER]),
    ]),
  },
  /**
   * Vertex Studio — pro.
   *
   * The premium editorial template: a type-only opening, a selected-work grid
   * and an asymmetric project grid, capabilities, an oversized statement band and
   * a recognition list, across six pages. The extra pages and the extra bands are
   * the premium difference, not the theme alone.
   */
  {
    id: 'vertex-studio',
    slug: 'vertex-studio',
    category: TEMPLATE_CATEGORY.STUDIO,
    tier: TEMPLATE_TIER.PRO,
    layout: 'editorial',
    nameKey: 'siteTemplate.vertexStudio.name',
    descriptionKey: 'siteTemplate.vertexStudio.description',
    thumbnail: Object.freeze({ kind: 'structure', pageCount: 6 }),
    themePreset: 'vertex',
    tags: Object.freeze(['templates.tagStudio', 'templates.tagEditorial', 'templates.tagPremium']),
    features: Object.freeze(['templates.featureSixPages', 'templates.featureAsymmetricGrid', 'templates.featureEditorialType', 'templates.featureAwards']),
    pages: Object.freeze([
      page('home', PAGE.HOME, [
        S.HERO_TYPE,
        S.PROJECTS,
        S.PROJECT_GRID,
        S.SERVICES,
        S.STATEMENT,
        S.RECOGNITION,
        S.STORY,
        S.TESTIMONIALS,
        S.CONTACT_CTA,
        S.FOOTER_COLUMNS,
      ]),
      page('work', PAGE.WORK, [S.HERO_SPLIT, S.PROJECTS, S.PROJECT_GRID, S.FOOTER_COLUMNS]),
      page('services', PAGE.SERVICES, [S.HERO_SPLIT, S.SERVICES, S.WORKFLOW, S.RECOGNITION, S.CONTACT_CTA, S.FOOTER_COLUMNS]),
      page('studio', PAGE.STUDIO, [S.HERO_SPLIT, S.STATEMENT, S.STORY, S.RECOGNITION, S.FOOTER_COLUMNS]),
      page('about', PAGE.ABOUT, [S.HERO_SPLIT, S.STORY, S.STATS, S.TESTIMONIALS, S.FOOTER_COLUMNS]),
      page('contact', PAGE.CONTACT, [S.CONTACT_CTA, S.CONTACT, S.FOOTER_COLUMNS]),
    ]),
  },
  /**
   * Noir Portfolio — pro.
   *
   * A dark, cinematic portfolio. It shares the image hero and the asymmetric
   * project grid with the other new templates, but the composition is project
   * led: a case study, a client list and an oversized statement, closed by a
   * minimal footer.
   */
  {
    id: 'noir-portfolio',
    slug: 'noir-portfolio',
    category: TEMPLATE_CATEGORY.PORTFOLIO,
    tier: TEMPLATE_TIER.PRO,
    layout: 'editorial',
    nameKey: 'siteTemplate.noirPortfolio.name',
    descriptionKey: 'siteTemplate.noirPortfolio.description',
    thumbnail: Object.freeze({ kind: 'structure', pageCount: 5 }),
    themePreset: 'noir',
    tags: Object.freeze(['templates.tagCinematic', 'templates.tagPortfolio', 'templates.tagPremium']),
    features: Object.freeze(['templates.featureFivePages', 'templates.featureCinematicHero', 'templates.featureCaseStudy', 'templates.featureAsymmetricGrid']),
    pages: Object.freeze([
      page('home', PAGE.HOME, [
        S.HERO_IMAGE,
        S.PROJECTS,
        S.PROJECT_GRID,
        S.STORY,
        S.SERVICES,
        S.LOGO_CLOUD,
        S.STATEMENT,
        S.CONTACT_CTA,
        S.FOOTER,
      ]),
      page('projects', PAGE.PROJECTS, [S.HERO_IMAGE, S.PROJECTS, S.PROJECT_GRID, S.FOOTER]),
      page('project', PAGE.PROJECT, [S.HERO_IMAGE, S.STORY, S.PROJECTS, S.FOOTER]),
      page('about', PAGE.ABOUT, [S.HERO_IMAGE, S.STATEMENT, S.ABOUT, S.TESTIMONIALS, S.FOOTER]),
      page('contact', PAGE.CONTACT, [S.CONTACT_CTA, S.CONTACT, S.FOOTER]),
    ]),
  },
  /**
   * Business Starter — free.
   *
   * A modern company or consultancy site rather than a product site: a split
   * opening, a client strip, a services grid, a numbered process, the numbers and
   * a closing call to action. It shares the split hero with the agency template
   * but the composition, the corporate theme and the restrained motion are what
   * keep it from reading as a SaaS landing page.
   */
  {
    id: 'business-starter',
    slug: 'business-starter',
    category: TEMPLATE_CATEGORY.BUSINESS,
    tier: TEMPLATE_TIER.FREE,
    layout: 'landing',
    nameKey: 'siteTemplate.businessStarter.name',
    descriptionKey: 'siteTemplate.businessStarter.description',
    thumbnail: Object.freeze({ kind: 'structure', pageCount: 4 }),
    themePreset: 'corporate',
    tags: Object.freeze(['templates.tagBusiness', 'templates.tagConsulting', 'templates.tagResponsive']),
    features: Object.freeze(['templates.featurePages4', 'templates.featureSplitHero', 'templates.featureProcess', 'templates.featureStats']),
    pages: Object.freeze([
      page('home', PAGE.HOME, [
        S.HERO_SPLIT,
        S.LOGO_CLOUD,
        S.SERVICES,
        S.WORKFLOW,
        S.STATS,
        S.TESTIMONIALS,
        S.CONTACT_CTA,
        S.FOOTER,
      ]),
      page('services', PAGE.SERVICES, [S.HERO_SPLIT, S.SERVICES, S.WORKFLOW, S.STATS, S.CONTACT_CTA, S.FOOTER]),
      page('about', PAGE.ABOUT, [S.HERO, S.STATS, S.STORY, S.TESTIMONIALS, S.FOOTER]),
      page('contact', PAGE.CONTACT, [S.CONTACT_CTA, S.CONTACT, S.FOOTER]),
    ]),
  },
  /**
   * Forge Construction — pro.
   *
   * Industrial and structural: an image-led opening, a client strip, featured
   * projects, capabilities, the numbers, a numbered process, a safety and quality
   * strip, testimonials and a detailed footer, across five pages. The sharp
   * theme, the structured grids and the staggered metric entrances carry the
   * premium weight rather than any single flashy band.
   */
  {
    id: 'forge-construction',
    slug: 'forge-construction',
    category: TEMPLATE_CATEGORY.CONSTRUCTION,
    tier: TEMPLATE_TIER.PRO,
    layout: 'editorial',
    nameKey: 'siteTemplate.forgeConstruction.name',
    descriptionKey: 'siteTemplate.forgeConstruction.description',
    thumbnail: Object.freeze({ kind: 'structure', pageCount: 5 }),
    themePreset: 'forge',
    tags: Object.freeze(['templates.tagConstruction', 'templates.tagIndustrial', 'templates.tagPremium']),
    features: Object.freeze(['templates.featureFivePages', 'templates.featureImageHero', 'templates.featureProjects', 'templates.featureProcess']),
    pages: Object.freeze([
      page('home', PAGE.HOME, [
        S.HERO_IMAGE,
        S.LOGO_CLOUD,
        S.PROJECTS,
        S.SERVICES,
        S.STATS,
        S.WORKFLOW,
        S.TRUST,
        S.TESTIMONIALS,
        S.CONTACT_CTA,
        S.FOOTER_COLUMNS,
      ]),
      page('projects', PAGE.PROJECTS, [S.HERO_SPLIT, S.PROJECTS, S.PROJECT_GRID, S.STATS, S.CONTACT_CTA, S.FOOTER_COLUMNS]),
      page('services', PAGE.SERVICES, [S.HERO_SPLIT, S.SERVICES, S.WORKFLOW, S.TRUST, S.CONTACT_CTA, S.FOOTER_COLUMNS]),
      page('about', PAGE.ABOUT, [S.HERO_SPLIT, S.STORY, S.STATS, S.TESTIMONIALS, S.FOOTER_COLUMNS]),
      page('contact', PAGE.CONTACT, [S.CONTACT_CTA, S.CONTACT, S.FOOTER_COLUMNS]),
    ]),
  },
  /**
   * Aurelia Wellness — pro.
   *
   * A calm, image-led spa site: an oversized editorial opening, a philosophy
   * story, a treatment list, signature services, a visual gallery, testimonials,
   * opening hours and a booking call to action, across five pages. The warm clay
   * palette, the serif headings and the wide spacing are deliberately distinct
   * from Maison's ivory-and-brass formality.
   */
  {
    id: 'aurelia-wellness',
    slug: 'aurelia-wellness',
    category: TEMPLATE_CATEGORY.WELLNESS,
    tier: TEMPLATE_TIER.PRO,
    layout: 'editorial',
    nameKey: 'siteTemplate.aureliaWellness.name',
    descriptionKey: 'siteTemplate.aureliaWellness.description',
    thumbnail: Object.freeze({ kind: 'structure', pageCount: 5 }),
    themePreset: 'aurelia',
    tags: Object.freeze(['templates.tagWellness', 'templates.tagSpa', 'templates.tagPremium']),
    features: Object.freeze(['templates.featureFivePages', 'templates.featureEditorialHero', 'templates.featureTreatments', 'templates.featureStats']),
    pages: Object.freeze([
      page('home', PAGE.HOME, [
        S.EDITORIAL_HERO,
        S.STORY,
        S.OFFERING,
        S.SERVICES,
        S.PROJECTS,
        S.TESTIMONIALS,
        S.HOURS,
        S.CONTACT_CTA,
        S.FOOTER_COLUMNS,
      ]),
      page('treatments', PAGE.TREATMENTS, [S.HERO, S.OFFERING, S.SERVICES, S.FAQ, S.CONTACT_CTA, S.FOOTER_COLUMNS]),
      page('about', PAGE.ABOUT, [S.HERO, S.STORY, S.STATS, S.TESTIMONIALS, S.FOOTER_COLUMNS]),
      page('booking', PAGE.BOOKING, [S.HERO, S.HOURS, S.CONTACT, S.FOOTER_COLUMNS]),
      page('contact', PAGE.CONTACT, [S.CONTACT_CTA, S.CONTACT, S.FOOTER_COLUMNS]),
    ]),
  },
  /**
   * Pulse Finance — pro.
   *
   * A product-led finance platform: a split opener with a product preview, a
   * metrics band, a feature grid, a security and trust strip, integrations,
   * pricing, testimonials, an FAQ and a structured footer, across six pages and
   * more bands than any earlier template. It is deliberately a light, cyan-accent
   * world with a deep-ink counterpoint, so it cannot be mistaken for Nova's dark
   * violet product site.
   */
  {
    id: 'pulse-finance',
    slug: 'pulse-finance',
    category: TEMPLATE_CATEGORY.FINANCE,
    tier: TEMPLATE_TIER.PRO,
    layout: 'landing',
    nameKey: 'siteTemplate.pulseFinance.name',
    descriptionKey: 'siteTemplate.pulseFinance.description',
    thumbnail: Object.freeze({ kind: 'structure', pageCount: 6 }),
    themePreset: 'ledger',
    tags: Object.freeze(['templates.tagFinance', 'templates.tagFintech', 'templates.tagSecure']),
    features: Object.freeze(['templates.featureSixPages', 'templates.featureMetrics', 'templates.featureTrust', 'templates.featureDataCards', 'templates.featurePricing']),
    pages: Object.freeze([
      page('home', PAGE.HOME, [
        S.HERO_SPLIT,
        S.LOGO_CLOUD,
        S.PRODUCT_PREVIEW,
        S.METRICS,
        S.FEATURE_GRID,
        S.TRUST,
        S.INTEGRATIONS,
        S.PRICING,
        S.TESTIMONIALS,
        S.FAQ,
        S.CONTACT_CTA,
        S.FOOTER_DETAILED,
      ]),
      page('product', PAGE.PRODUCT, [S.HERO, S.PRODUCT_PREVIEW, S.FEATURE_GRID, S.METRICS, S.TRUST, S.CONTACT_CTA, S.FOOTER_DETAILED]),
      page('solutions', PAGE.SOLUTIONS, [S.HERO, S.FEATURE_GRID, S.INTEGRATIONS, S.METRICS, S.TESTIMONIALS, S.CONTACT_CTA, S.FOOTER_DETAILED]),
      page('pricing', PAGE.PRICING, [S.HERO, S.PRICING, S.METRICS, S.FAQ, S.CONTACT_CTA, S.FOOTER_DETAILED]),
      page('security', PAGE.SECURITY, [S.HERO, S.TRUST, S.FEATURE_GRID, S.METRICS, S.FAQ, S.CONTACT_CTA, S.FOOTER_DETAILED]),
      page('contact', PAGE.CONTACT, [S.CONTACT_CTA, S.CONTACT, S.FOOTER_DETAILED]),
    ]),
  },
  /**
   * Atlas Dashboard — pro.
   *
   * A product-grade application template: a compact app bar, KPI cards, chart
   * panels, data tables with a filter bar, an activity feed, status panels,
   * customer and report cards and a settings area, across six pages. Every band
   * is a library section built from the same blocks the editor edits, so it opens
   * as an ordinary draft — the difference from the marketing templates is the
   * composition and the screen-like sections, not a second renderer.
   */
  {
    id: 'atlas-dashboard',
    slug: 'atlas-dashboard',
    category: TEMPLATE_CATEGORY.DASHBOARD,
    tier: TEMPLATE_TIER.PRO,
    layout: 'app',
    nameKey: 'siteTemplate.atlasDashboard.name',
    descriptionKey: 'siteTemplate.atlasDashboard.description',
    thumbnail: Object.freeze({ kind: 'structure', pageCount: 6 }),
    themePreset: 'atlas',
    tags: Object.freeze(['templates.tagDashboard', 'templates.tagApp', 'templates.tagPremium']),
    features: Object.freeze(['templates.featureSixPages', 'templates.featureDashboard', 'templates.featureDataCards', 'templates.featureCharts', 'templates.featureSettings']),
    pages: Object.freeze([
      page('dashboard', PAGE.DASHBOARD, [
        S.APP_BAR,
        S.KPI_ROW,
        S.CHART_GRID,
        S.DATA_TABLE,
        S.ACTIVITY_FEED,
        S.CUSTOMER_GRID,
        S.STATUS_GRID,
        S.QUICK_ACTIONS,
        S.FOOTER,
      ]),
      page('analytics', PAGE.ANALYTICS, [
        S.APP_BAR,
        S.KPI_ROW,
        S.CHART_GRID,
        S.DATA_TABLE,
        S.STATUS_GRID,
        S.QUICK_ACTIONS,
        S.FOOTER,
      ]),
      page('customers', PAGE.CUSTOMERS, [S.APP_BAR, S.KPI_ROW, S.DATA_TABLE, S.CUSTOMER_GRID, S.FOOTER]),
      page('transactions', PAGE.TRANSACTIONS, [S.APP_BAR, S.KPI_ROW, S.DATA_TABLE, S.STATUS_GRID, S.FOOTER]),
      page('reports', PAGE.REPORTS, [S.APP_BAR, S.KPI_ROW, S.CHART_GRID, S.REPORT_GRID, S.QUICK_ACTIONS, S.FOOTER]),
      page('settings', PAGE.SETTINGS, [S.APP_BAR, S.SETTINGS_GROUPS, S.SETTINGS_FORM, S.FOOTER]),
    ]),
  },
])

/** Blank plus the designed templates, for id lookup only. */
const ALL_TEMPLATES = Object.freeze([BLANK_TEMPLATE, ...SITE_TEMPLATES])

export const SITE_TEMPLATE_IDS = Object.freeze(ALL_TEMPLATES.map((t) => t.id))

export const SITE_TEMPLATE_BY_ID = Object.freeze(
  Object.fromEntries(ALL_TEMPLATES.map((t) => [t.id, t])),
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
  filterTemplates({ category })

/**
 * Everything a search query is matched against, as one lower-case string.
 *
 * Built from the same localised strings a card shows, so "restaurant" finds a
 * category, "charts" finds a feature and a name matches in either language. The
 * id and slug are appended untranslated so a query never has to be translated to
 * work. `t` is passed in rather than imported: this model stays locale-agnostic.
 */
export const templateSearchText = (template, t = (key) => key) =>
  [
    t(template.nameKey),
    t(template.descriptionKey),
    t(TEMPLATE_CATEGORY_LABELS[template.category] ?? 'templates.categoryBasic'),
    ...(template.tags ?? []).map((tag) => t(tag)),
    ...(template.features ?? []).map((feature) => t(feature)),
    template.id,
    template.slug,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()

/**
 * The combined gallery filter.
 *
 * Category, tier and free-text search are applied together, so the count on the
 * page is always the number of cards actually shown. An empty query is not a
 * filter: it matches everything that passed the other two.
 */
export const filterTemplates = ({
  category = ALL_TEMPLATE_CATEGORIES,
  tier = ALL_TEMPLATE_TIERS,
  query = '',
  t,
} = {}) => {
  const needle = typeof query === 'string' ? query.trim().toLowerCase() : ''

  return SITE_TEMPLATES.filter((template) => {
    if (category !== ALL_TEMPLATE_CATEGORIES && template.category !== category) {
      return false
    }
    if (tier !== ALL_TEMPLATE_TIERS && template.tier !== tier) {
      return false
    }
    if (!needle) {
      return true
    }
    return templateSearchText(template, t).includes(needle)
  })
}

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
