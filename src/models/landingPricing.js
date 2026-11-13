/**
 * Public pricing + availability configuration.
 *
 * Prices and plan texts come from the published backend catalogue
 * (`GET /billing/plans`); nothing here states a price or a discount. This
 * module only holds the presentation wiring: which availability claims are
 * safe to make, the footnote keys, and the call to action each visitor gets.
 */

export const PRICING_AVAILABILITY_TITLE_KEY = 'pricing.availabilityTitle'
export const PRICING_FOOTNOTE_AUTHENTICATED_KEY = 'pricing.footnoteAuthenticated'
export const PRICING_FOOTNOTE_GUEST_KEY = 'pricing.footnoteGuest'
export const PRICING_CTA_LABEL_KEYS = Object.freeze({
  authenticated: 'common.viewPlanAndBilling',
  guest: 'nav.createAccount',
})

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
