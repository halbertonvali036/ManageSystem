/**
 * Usage model — what a workspace is consuming, and how much of its plan is left.
 *
 * ── The rule this file exists to enforce ───────────────────────────────────────
 *
 * A usage tile has three honest states, never two:
 *
 *   reported    — the backend sent a real number. It is shown.
 *   over limit  — the backend sent both a number and a limit, and the number is
 *                 above the limit. Shown, and marked.
 *   unavailable — the backend sent nothing for this metric. Nothing is drawn: no
 *                 number, no "0", no 0% bar, no progress ring.
 *
 * The tempting shortcut is to treat a missing value as zero, because zero renders
 * neatly. It is also a lie: a plan that shows "0 websites used" when the API simply
 * has not been asked is stating a fact nobody measured. So a missing value stays
 * `null` all the way to the component, and `getUsageState` is what decides how to
 * draw it. A percentage is only ever computed when *both* operands are real, which
 * is why `getUsageRatio` can return null.
 *
 * ── Reuse ─────────────────────────────────────────────────────────────────────
 *
 * `USAGE_METRIC` is the single metric vocabulary. The workspace page renders it
 * today; a platform-wide admin usage view reads the same model. Adding a metric is
 * a declaration here plus copy in the locales — not a second table.
 *
 * This model is read-only. It never estimates, extrapolates or sums across periods,
 * and it never treats "not provided yet" as "zero".
 */

/* ── Metric vocabulary ───────────────────────────────────────────────────────── */

/**
 * The metrics a workspace's consumption can be measured in.
 *
 * `bandwidth` and `apiRequests` are declared but not expected yet: the backend does
 * not report them, so they render as unavailable until it does. Declaring them now
 * means the tile exists with honest copy rather than being bolted on later.
 */
export const USAGE_METRIC = Object.freeze({
  WEBSITES: 'websites',
  STORAGE: 'storage',
  DATABASE_RECORDS: 'databaseRecords',
  MEMBERS: 'members',
  DEPLOYMENTS: 'deployments',
  BANDWIDTH: 'bandwidth',
  API_REQUESTS: 'apiRequests',
})

/** Every declared metric, in the order they are presented. */
export const USAGE_METRICS = Object.freeze(Object.values(USAGE_METRIC))

const USAGE_METRIC_SET = new Set(USAGE_METRICS)

export const isKnownUsageMetric = (metric) => USAGE_METRIC_SET.has(metric)

/**
 * How a metric is measured, which decides its formatter.
 *
 * `count` is a plain number. `bytes` is a size and gets a human-readable unit.
 * Anything else is refused rather than guessed.
 */
export const USAGE_UNIT = Object.freeze({
  COUNT: 'count',
  BYTES: 'bytes',
})

const USAGE_UNIT_BY_METRIC = Object.freeze({
  [USAGE_METRIC.WEBSITES]: USAGE_UNIT.COUNT,
  [USAGE_METRIC.STORAGE]: USAGE_UNIT.BYTES,
  [USAGE_METRIC.DATABASE_RECORDS]: USAGE_UNIT.COUNT,
  [USAGE_METRIC.MEMBERS]: USAGE_UNIT.COUNT,
  [USAGE_METRIC.DEPLOYMENTS]: USAGE_UNIT.COUNT,
  [USAGE_METRIC.BANDWIDTH]: USAGE_UNIT.BYTES,
  [USAGE_METRIC.API_REQUESTS]: USAGE_UNIT.COUNT,
})

/** Translation key per metric. */
export const USAGE_METRIC_LABEL_KEYS = Object.freeze(
  Object.fromEntries(USAGE_METRICS.map((metric) => [metric, `workspaceActivity.usage.metric.${metric}`])),
)

/** Icon name per metric; the component maps it to a real icon. */
export const USAGE_METRIC_ICONS = Object.freeze(
  Object.fromEntries(USAGE_METRICS.map((metric) => [metric, metric])),
)

/**
 * Metrics the backend does not report yet.
 *
 * Kept in the model rather than in a component so the honest "not provided yet"
 * copy has one source, and so a metric can leave this list the moment the backend
 * starts sending it.
 */
export const USAGE_METRIC_PENDING = Object.freeze([
  USAGE_METRIC.BANDWIDTH,
  USAGE_METRIC.API_REQUESTS,
])

const USAGE_METRIC_PENDING_SET = new Set(USAGE_METRIC_PENDING)

/** True while this metric is not expected from the backend. */
export const isPendingUsageMetric = (metric) => USAGE_METRIC_PENDING_SET.has(metric)

/* ── Value reading ───────────────────────────────────────────────────────────── */

const isBlank = (value) =>
  value === null ||
  value === undefined ||
  (typeof value === 'string' && value.trim() === '')

/**
 * A real, non-negative measurement, or null.
 *
 * Null for: absent, blank, non-numeric, NaN, Infinity and negative. A negative
 * usage figure is not a small usage figure, and coercing it to 0 would hide a
 * backend bug behind a healthy-looking tile. Zero itself is a legitimate reading and
 * is returned as 0 — the difference between "zero" and "not reported" is the whole
 * point of this file.
 */
export const readUsageValue = (value) => {
  if (typeof value === 'number') {
    return Number.isFinite(value) && value >= 0 ? value : null
  }
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value)
    return Number.isFinite(parsed) && parsed >= 0 ? parsed : null
  }
  return null
}

const pickFirst = (...values) => values.find((value) => !isBlank(value))

/**
 * Reads one metric from a payload.
 *
 * Accepts a flat number (`{ websites: 3 }`) or a per-metric object
 * (`{ websites: { value: 3, reportedAt } }`), because both shapes are plausible in a
 * metrics endpoint and neither tells us anything the other cannot.
 *
 * `numberKeys` is the set of names the *caller* considers a measurement. A usage
 * payload says `value`/`used`/`current`/`count`; a limits payload says
 * `limit`/`max`/`maximum`. Keeping the key list with the caller is what stops a
 * limits response from being read as "no limits at all" — the failure mode where
 * every metric quietly becomes `null` and the plan claims to be unlimited.
 */
const readMetricEntry = (raw, numberKeys) => {
  if (raw && typeof raw === 'object' && !Array.isArray(raw)) {
    return {
      value: readUsageValue(pickFirst(...numberKeys.map((key) => raw[key]))),
      reportedAt:
        typeof raw.reportedAt === 'string'
          ? raw.reportedAt
          : typeof raw.reported_at === 'string'
            ? raw.reported_at
            : null,
      updatedAt:
        typeof raw.updatedAt === 'string'
          ? raw.updatedAt
          : typeof raw.updated_at === 'string'
            ? raw.updated_at
            : null,
    }
  }
  return { value: readUsageValue(raw), reportedAt: null, updatedAt: null }
}

/** Names a usage figure may arrive under. */
const USAGE_VALUE_KEYS = Object.freeze(['value', 'used', 'current', 'count'])

/** Names a plan ceiling may arrive under. */
const USAGE_LIMIT_KEYS = Object.freeze(['limit', 'max', 'maximum', 'ceiling', 'allowed'])

/**
 * Accepts a bare object, a `{ data }` envelope, or a `{ metrics|usage|limits: {} }`
 * wrapper.
 *
 * `limits` is listed because a limits endpoint will wrap its body in exactly that
 * key. Omitting it would fall through to the bare object, read every metric as
 * absent, and report a plan with real ceilings as having none.
 */
const readMetricsSource = (payload) => {
  const candidate = payload?.data ?? payload
  if (!candidate || typeof candidate !== 'object' || Array.isArray(candidate)) return null
  return candidate.metrics ?? candidate.usage ?? candidate.limits ?? candidate
}

/**
 * Maps a backend usage payload onto one entry per declared metric.
 *
 * Every declared metric is present in the result. A metric the backend did not send
 * is present with `value: null`, which is what makes "unavailable" representable
 * instead of "absent" — an absent key and a reported zero must not look alike.
 */
export const normalizeUsage = (payload) => {
  const source = readMetricsSource(payload)
  if (!source) return null

  const entries = Object.fromEntries(
    USAGE_METRICS.map((metric) => [metric, readMetricEntry(source[metric], USAGE_VALUE_KEYS)]),
  )

  return Object.freeze({
    ...entries,
    // Retained so a caller can show when the numbers were last refreshed, and
    // nothing more: a usage figure with no timestamp is still real, but a stale one
    // should be visibly stale.
    reportedAt: typeof source.reportedAt === 'string' ? source.reportedAt : null,
  })
}

/**
 * Maps a backend limits payload the same way, into a `limit` per metric.
 *
 * A `null` limit means the plan states no ceiling for that metric. That is different
 * from a limit of zero, and it is shown as "no limit set" rather than as a full bar
 * — an unlimited plan is not a workspace that has used everything.
 */
export const normalizeUsageLimits = (payload) => {
  const source = readMetricsSource(payload)
  if (!source) return null

  const entries = Object.fromEntries(
    USAGE_METRICS.map((metric) => {
      const entry = readMetricEntry(source[metric], USAGE_LIMIT_KEYS)
      return [
        metric,
        { limit: entry.value, reportedAt: entry.reportedAt, updatedAt: entry.updatedAt },
      ]
    }),
  )

  return Object.freeze({
    ...entries,
    planName:
      typeof source.planName === 'string'
        ? source.planName
        : typeof source.plan_name === 'string'
          ? source.plan_name
          : null,
    reportedAt: typeof source.reportedAt === 'string' ? source.reportedAt : null,
  })
}

/* ── State, ratio, formatting ────────────────────────────────────────────────── */

/** The three states a metric can be in. The UI switches on exactly these. */
export const USAGE_STATE = Object.freeze({
  REPORTED: 'reported',
  OVER_LIMIT: 'overLimit',
  UNAVAILABLE: 'unavailable',
  UNLIMITED: 'unlimited',
})

/** One metric's reading, with its limit attached. Nulls stay null. */
export const getUsageMetric = (usage, metric, limits = null) => {
  if (!USAGE_METRIC_SET.has(metric)) return null

  const entry = usage?.[metric] ?? { value: null }
  const limitEntry = limits?.[metric] ?? { limit: null }

  return Object.freeze({
    metric,
    unit: USAGE_UNIT_BY_METRIC[metric] ?? USAGE_UNIT.COUNT,
    value: entry.value ?? null,
    limit: limitEntry.limit ?? null,
    reportedAt: entry.reportedAt ?? usage?.reportedAt ?? null,
    isPending: isPendingUsageMetric(metric),
  })
}

/**
 * How far along a metric is, as a ratio, or null when it cannot be known.
 *
 * Null unless both the usage and the limit are real numbers and the limit is
 * greater than zero. A limit of 0 is deliberately not divided by: it means the plan
 * allows none of this, which is a state to report, not a percentage to render.
 */
export const getUsageRatio = (value, limit) => {
  if (!Number.isFinite(value) || !Number.isFinite(limit)) return null
  if (value === null || limit === null) return null
  if (limit <= 0) return null
  return value / limit
}

/** True when a real usage figure sits above a real limit. */
export const isUsageOverLimit = (value, limit) =>
  Number.isFinite(value) && Number.isFinite(limit) && value !== null && limit !== null && limit > 0 && value > limit

/**
 * The single decision the tiles switch on.
 *
 * `unavailable` when there is no number — the only correct thing to draw then.
 * `unlimited` when there is a number and the plan states no ceiling for it.
 */
export const getUsageState = (value, limit) => {
  if (!Number.isFinite(value) || value === null) return USAGE_STATE.UNAVAILABLE
  if (isUsageOverLimit(value, limit)) return USAGE_STATE.OVER_LIMIT
  if (!Number.isFinite(limit) || limit === null) return USAGE_STATE.UNLIMITED
  return USAGE_STATE.REPORTED
}

const BYTE_UNITS = Object.freeze(['B', 'KB', 'MB', 'GB', 'TB', 'PB'])

/**
 * A measurement, formatted for reading.
 *
 * Returns null when there is no real value, so the caller renders its unavailable
 * state instead of "0 B". Bytes are scaled to a readable unit; counts are localized.
 */
export const formatUsageValue = (value, unit, locale) => {
  if (!Number.isFinite(value) || value === null) return null

  if (unit === USAGE_UNIT.BYTES) {
    let size = value
    let index = 0
    while (size >= 1024 && index < BYTE_UNITS.length - 1) {
      size /= 1024
      index += 1
    }
    const digits = index === 0 ? 0 : size < 10 ? 1 : 0
    return `${size.toLocaleString(locale, {
      minimumFractionDigits: digits,
      maximumFractionDigits: digits,
    })} ${BYTE_UNITS[index]}`
  }

  return value.toLocaleString(locale)
}

/** A plan limit, formatted. Null when the plan states none. */
export const formatUsageLimit = (limit, unit, locale) =>
  limit === null || limit === undefined ? null : formatUsageValue(limit, unit, locale)

/**
 * A whole percentage, or null when one cannot be computed.
 *
 * Never clamps to 100: an over-limit workspace is over its limit, and rounding that
 * down to 100% would hide it. The bar clamps; the number does not.
 */
export const formatUsagePercent = (value, limit, locale) => {
  const ratio = getUsageRatio(value, limit)
  if (ratio === null) return null
  return Math.round(ratio * 100).toLocaleString(locale)
}

/** How full the bar should be drawn, 0–100, or null when unknown. */
export const getUsageBarPercent = (value, limit) => {
  const ratio = getUsageRatio(value, limit)
  if (ratio === null) return null
  return Math.min(100, Math.max(0, Math.round(ratio * 100)))
}

/* ── Summaries ───────────────────────────────────────────────────────────────── */

/**
 * How many metrics were actually reported, and how many are still missing.
 *
 * A "4 of 7" summary is honest in a way "your usage is 57%" is not: it counts
 * measurements, and it does not average real readings against absent ones.
 */
export const summarizeUsage = (usage, limits = null) => {
  let reported = 0
  let unavailable = 0
  let overLimit = 0

  for (const metric of USAGE_METRICS) {
    const reading = getUsageMetric(usage, metric, limits)
    const state = getUsageState(reading?.value ?? null, reading?.limit ?? null)
    if (state === USAGE_STATE.UNAVAILABLE) unavailable += 1
    else reported += 1
    if (state === USAGE_STATE.OVER_LIMIT) overLimit += 1
  }

  return Object.freeze({
    total: USAGE_METRICS.length,
    reported,
    unavailable,
    overLimit,
    planName: limits?.planName ?? null,
  })
}
