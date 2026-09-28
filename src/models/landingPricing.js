/**
 * Public pricing + availability configuration.
 *
 * Commercial terms are not final, so nothing here states a price, a discount or
 * a guaranteed entitlement. Plans are placeholders kept in one place so the
 * landing page can be updated the moment real pricing is decided, and every
 * plan card renders the disclosure below.
 */

export const PLAN_STATUS = Object.freeze({
  PROVISIONAL: 'provisional',
})

export const PRICING_DISCLOSURE_KEY = 'pricing.disclosure'
export const PRICING_PRICE_PLACEHOLDER_KEY = 'pricing.pricePlaceholder'
export const PRICING_BADGE_KEY = 'pricing.mostComplete'
export const PRICING_PROVISIONAL_KEY = 'pricing.notFinal'
export const PRICING_AVAILABILITY_TITLE_KEY = 'pricing.availabilityTitle'
export const PRICING_FOOTNOTE_AUTHENTICATED_KEY = 'pricing.footnoteAuthenticated'
export const PRICING_FOOTNOTE_GUEST_KEY = 'pricing.footnoteGuest'
export const PRICING_CTA_LABEL_KEYS = Object.freeze({
  authenticated: 'common.viewPlanAndBilling',
  guest: 'nav.createAccount',
})

/**
 * Plan structure only. Names, audiences and highlights are translation keys so
 * the pricing cards render in the active language; no commercial claim is made.
 */
export const LANDING_PLANS = Object.freeze([
  {
    id: 'starter',
    status: PLAN_STATUS.PROVISIONAL,
    copyKey: 'starter',
    isFeatured: false,
  },
  {
    id: 'pro',
    status: PLAN_STATUS.PROVISIONAL,
    copyKey: 'pro',
    isFeatured: true,
  },
  {
    id: 'agency',
    status: PLAN_STATUS.PROVISIONAL,
    copyKey: 'agency',
    isFeatured: false,
  },
])

export const CAPABILITY_STATUS = Object.freeze({
  AVAILABLE: 'available',
  COMING_SOON: 'coming-soon',
})

export const CAPABILITY_STATUS_LABEL_KEYS = Object.freeze({
  [CAPABILITY_STATUS.AVAILABLE]: 'pricing.availability.available',
  [CAPABILITY_STATUS.COMING_SOON]: 'pricing.availability.comingSoon',
})

/**
 * Website-builder capabilities. Nothing is marked available before it actually
 * works, so the landing page cannot promise an editor that is not built yet.
 * Labels are translation keys.
 */
export const CAPABILITY_AVAILABILITY = Object.freeze([
  { labelKey: 'capabilities.projects.title', status: CAPABILITY_STATUS.AVAILABLE },
  { labelKey: 'capabilities.pages.title', status: CAPABILITY_STATUS.AVAILABLE },
  { labelKey: 'capabilities.templates.title', status: CAPABILITY_STATUS.AVAILABLE },
  { labelKey: 'capabilities.preview.title', status: CAPABILITY_STATUS.AVAILABLE },
  { labelKey: 'capabilities.security.title', status: CAPABILITY_STATUS.AVAILABLE },
  { labelKey: 'capabilities.notifications.title', status: CAPABILITY_STATUS.AVAILABLE },
  { labelKey: 'capabilities.editor.title', status: CAPABILITY_STATUS.COMING_SOON },
  { labelKey: 'capabilities.publishing.title', status: CAPABILITY_STATUS.COMING_SOON },
  { labelKey: 'capabilities.mobile.title', status: CAPABILITY_STATUS.COMING_SOON },
])

/**
 * Pricing never simulates a purchase. Signed-in visitors are sent to the real
 * plan page; everyone else is sent to registration or sign-in first.
 */
export const getPricingCta = (isAuthenticated) =>
  isAuthenticated
    ? {
        to: '/billing',
        labelKey: PRICING_CTA_LABEL_KEYS.authenticated,
        isPrimary: true,
      }
    : { to: '/register', labelKey: PRICING_CTA_LABEL_KEYS.guest, isPrimary: true }
