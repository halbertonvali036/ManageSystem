/**
 * Localised copy for backend plan records.
 *
 * The plan catalogue is served in English (`GET /billing/plans`), but the UI is
 * bilingual. This module resolves the locale copy for a plan by its code, so
 * `STARTER`, `Starter` and `starter` all read the same entry, and matches each
 * feature by the exact label the backend sent.
 *
 * Every lookup falls back to the text the caller already has: a plan the
 * locales do not know yet, or a newly added feature label, still renders the
 * backend's own wording instead of a raw translation key.
 */

const planCodeKey = (plan) =>
  String(plan?.code ?? plan?.name ?? plan?.id ?? '').trim().toLowerCase()

const resolveCopy = (t, key, fallback) => {
  if (!key) {
    return fallback
  }
  const value = t(key)
  return value === key ? fallback : value
}

const planCopyKey = (plan, segment) => {
  const code = planCodeKey(plan)
  return code ? `pricing.plans.${code}.${segment}` : null
}

/** Localised plan name, or the backend name when the plan is unknown. */
export const getPlanName = (t, plan) =>
  resolveCopy(t, planCopyKey(plan, 'name'), plan?.name ?? null)

/** Localised plan tagline, or the backend tagline when the plan is unknown. */
export const getPlanTagline = (t, plan) =>
  resolveCopy(t, planCopyKey(plan, 'tagline'), plan?.tagline ?? null)

/** Localised plan description, or the backend description when unknown. */
export const getPlanDescription = (t, plan) =>
  resolveCopy(t, planCopyKey(plan, 'description'), plan?.description ?? null)

/** Localised feature label, matched by the exact backend string. */
export const getPlanFeatureLabel = (t, plan, label) =>
  resolveCopy(t, planCopyKey(plan, `features.${label}`), label)
