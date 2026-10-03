/**
 * Billing frontend configuration (presentation only).
 *
 * The plan catalogue below is scaffolding for the Plan & Billing page until
 * commercial pricing, a billing backend and a payment provider are decided.
 * It describes structure and copy only:
 * - `price`, `currency` and `cycle` stay `null` — no price is published.
 * - `prices` carries a `null` amount per cycle so the monthly/yearly toggle
 *   can render a real period without inventing a number for either.
 * - `purchasable` stays `false` — checkout cannot be started from the UI.
 * - `recommended` stays `false` — no plan is promoted as the current one.
 *
 * `rank` is structural only: it is what lets the page tell an upgrade from a
 * downgrade without relying on the order the cards happen to be rendered in.
 *
 * Real plans returned by `billingService.getPlans()` replace this list at
 * runtime. To change the catalogue before then, edit this file only.
 */

export const BILLING_CATALOGUE_SOURCE = Object.freeze({
  FRONTEND_CONFIG: 'frontend-configuration',
  BACKEND: 'backend',
})

export const BILLING_PRICE_PENDING_LABEL = 'Pricing not published'

export const BILLING_CYCLE_PENDING_LABEL = 'Billing cycle not set'

export const BILLING_PURCHASE_PENDING_LABEL = 'Checkout not available yet'

/** No price exists for either cycle yet — both render as pending. */
const pendingCyclePrices = Object.freeze({ monthly: null, annual: null })

const planFeature = (label, included = true) => ({ label, included })

export const BILLING_PLANS = Object.freeze([
  {
    id: 'starter',
    name: 'Starter',
    rank: 1,
    eyebrow: 'First site',
    tagline: 'Publish your first website.',
    description:
      'One website with a template and core pages for a single project.',
    price: null,
    prices: pendingCyclePrices,
    currency: null,
    cycle: null,
    purchasable: false,
    recommended: false,
    features: [
      planFeature('1 published website'),
      planFeature('Starter template library'),
      planFeature('Core pages and contact form'),
      planFeature('Custom domain', false),
      planFeature('Remove SiteBuilder branding', false),
      planFeature('Billing portal and invoices', false),
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    rank: 2,
    eyebrow: 'Growing project',
    tagline: 'More control for a serious site.',
    description:
      'Everything in Starter, plus a custom domain, extra templates and page-level styling controls.',
    price: null,
    prices: pendingCyclePrices,
    currency: null,
    cycle: null,
    purchasable: false,
    recommended: false,
    features: [
      planFeature('Everything in Starter'),
      planFeature('Custom domain and SSL'),
      planFeature('Full template library'),
      planFeature('Per-page style controls'),
      planFeature('Remove SiteBuilder branding'),
      planFeature('Team seats', false),
    ],
  },
  {
    id: 'agency',
    name: 'Agency',
    rank: 3,
    eyebrow: 'Client work',
    tagline: 'Ship and manage many sites.',
    description:
      'Everything in Pro, plus unlimited sites, client workspaces and consolidated reporting.',
    price: null,
    prices: pendingCyclePrices,
    currency: null,
    cycle: null,
    purchasable: false,
    recommended: false,
    features: [
      planFeature('Everything in Pro'),
      planFeature('Unlimited websites'),
      planFeature('Client workspaces'),
      planFeature('Site performance reporting'),
      planFeature('Role-based team access'),
      planFeature('Dedicated onboarding'),
    ],
  },
])
