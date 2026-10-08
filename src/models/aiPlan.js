/**
 * AI plan & usage — what the assistant's plan card is allowed to say.
 *
 * ── Why this file is small ─────────────────────────────────────────────────────
 *
 * Entitlements are the backend's decision. Nothing here decides who may use the
 * assistant, who has run out, or what a paid tier includes: it reads a payload when
 * one exists, and it falls back to a *declared* placeholder when one does not. The
 * placeholder is the same kind of scaffolding as the billing catalogue — a shape to
 * render, marked `source: 'frontend-fallback'`, so the card can be built and reviewed
 * before an endpoint exists. The UI labels it as a demo figure; it is never presented
 * as a measured number.
 *
 * `used >= limit` is the only "limit reached" test in the product, and it runs on
 * whatever numbers were actually supplied. A missing number is missing: `used: null`
 * draws no bar and no percentage, because a usage figure nobody measured must not be
 * rendered as zero.
 */

/** Tiers the card can name. A tier outside this list is shown as its raw value. */
export const AI_PLAN_TIER = Object.freeze({
  FREE: 'free',
  PRO: 'pro',
})

export const AI_PLAN_TIER_LABEL_KEYS = Object.freeze({
  [AI_PLAN_TIER.FREE]: 'aiAssistant.plan.tier.free',
  [AI_PLAN_TIER.PRO]: 'aiAssistant.plan.tier.pro',
})

/** How a period is described. Only periods the backend can actually report. */
export const AI_PLAN_RESET_PERIOD_LABEL_KEYS = Object.freeze({
  monthly: 'aiAssistant.plan.reset.monthly',
  weekly: 'aiAssistant.plan.reset.weekly',
  yearly: 'aiAssistant.plan.reset.yearly',
})

/**
 * The declared placeholder.
 *
 * `used` and `limit` are illustrative so the card's real layout — badge, bar, counts,
 * reset line — can be reviewed end to end. They are not a quota, they are not enforced
 * anywhere, and the card says "demo" next to them. When a backend payload arrives it
 * replaces this object outright.
 */
export const AI_PLAN_FALLBACK = Object.freeze({
  source: import.meta.env.VITE_ENABLE_DEMO_AUTH === 'true' ? 'frontend-fallback' : 'unavailable',
  tier: import.meta.env.VITE_ENABLE_DEMO_AUTH === 'true' ? AI_PLAN_TIER.FREE : null,
  used: import.meta.env.VITE_ENABLE_DEMO_AUTH === 'true' ? 12 : null,
  limit: import.meta.env.VITE_ENABLE_DEMO_AUTH === 'true' ? 50 : null,
  resetPeriod: import.meta.env.VITE_ENABLE_DEMO_AUTH === 'true' ? 'monthly' : null,
})

const readCount = (value) =>
  typeof value === 'number' && Number.isFinite(value) && value >= 0 ? value : null

const readTier = (value) =>
  value === AI_PLAN_TIER.PRO || value === AI_PLAN_TIER.FREE ? value : AI_PLAN_TIER.FREE

/**
 * A plan payload, normalized — or null when there is nothing to read.
 *
 * Null means "no plan reported", and the caller uses `AI_PLAN_FALLBACK` and labels it
 * as a demo. It never means "free plan with no usage": an absent payload and a real
 * zero are different facts.
 */
export const normalizeAiPlan = (payload) => {
  const source = payload?.data ?? payload
  if (!source || typeof source !== 'object' || Array.isArray(source)) return null

  const used = readCount(source.used ?? source.consumed ?? source.current)
  const limit = readCount(source.limit ?? source.max ?? source.quota)
  const resetPeriod =
    typeof source.resetPeriod === 'string' && source.resetPeriod in AI_PLAN_RESET_PERIOD_LABEL_KEYS
      ? source.resetPeriod
      : typeof source.reset_period === 'string' && source.reset_period in AI_PLAN_RESET_PERIOD_LABEL_KEYS
        ? source.reset_period
        : null

  return Object.freeze({
    source: 'backend',
    tier: readTier(source.tier ?? source.plan ?? source.planId),
    used,
    limit,
    resetPeriod,
  })
}

/** The plan to render: a reported one, or the declared placeholder. */
export const getAiPlan = (payload) => normalizeAiPlan(payload) ?? AI_PLAN_FALLBACK

/** True only when the card is showing the declared placeholder rather than data. */
export const isAiPlanDemo = (plan) => plan?.source === 'frontend-fallback'

/**
 * How full the bar is drawn, 0–100 — or null when it cannot be known.
 *
 * Null with no usage, no limit, or a limit of zero. A limit of zero is a state to
 * report, not a bar to fill.
 */
export const getAiPlanBarPercent = (plan) => {
  const used = readCount(plan?.used)
  const limit = readCount(plan?.limit)
  if (used === null || limit === null || limit <= 0) return null
  return Math.min(100, Math.round((used / limit) * 100))
}

/**
 * Whether the assistant has used its allowance.
 *
 * Only ever true from reported numbers. With the placeholder in place it is false, so
 * the composer is never locked by a figure nobody measured.
 */
export const isAiPlanLimitReached = (plan) => {
  const used = readCount(plan?.used)
  const limit = readCount(plan?.limit)
  if (plan?.source !== 'backend' || used === null || limit === null) return false
  return used >= limit
}
