/**
 * Admin plan control model (frontend preparation only).
 * Mirrors the product's two account tiers. Prices, quotas and limits are
 * placeholders until the billing backend defines them.
 */
export const ADMIN_PLAN = Object.freeze({ FREE: 'free', PRO: 'pro' })

export const ADMIN_PLANS = Object.freeze([
  {
    id: ADMIN_PLAN.FREE,
    rank: 1,
    nameKey: 'admin.plans.free.name',
    descriptionKey: 'admin.plans.free.description',
    limits: Object.freeze({ sites: null }),
  },
  {
    id: ADMIN_PLAN.PRO,
    rank: 2,
    nameKey: 'admin.plans.pro.name',   // "Pro / Premium"
    descriptionKey: 'admin.plans.pro.description',
    limits: Object.freeze({ sites: null }),
  },
])

export const ADMIN_PLAN_IDS = Object.freeze(ADMIN_PLANS.map((p) => p.id))
export const ADMIN_PLAN_LABELS = Object.freeze(
  Object.fromEntries(ADMIN_PLANS.map((p) => [p.id, p.nameKey])),
)
export const isAdminPlan = (value) => ADMIN_PLAN_IDS.includes(value)

/** Normalises a server plan value onto a tier; unknown values are not guessed. */
export const normalizeAdminPlan = (value) => (isAdminPlan(value) ? value : null)
