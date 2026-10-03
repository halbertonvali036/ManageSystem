/**
 * Billing domain model.
 *
 * Holds the status vocabulary the Plan & Billing page can display, the
 * formatters used to render backend values, and defensive normalizers that
 * map raw API records onto the shapes the UI expects.
 *
 * Rules enforced here:
 * - A status is only ever returned when the backend actually sent a known one.
 * - Missing values format to `null` so the UI can show an honest
 *   "unavailable" state instead of inventing data.
 */

/* ── Subscription status ──────────────────────────────────── */

export const BILLING_STATUS = Object.freeze({
  FREE: 'free',
  ACTIVE: 'active',
  TRIAL: 'trial',
  PAST_DUE: 'past_due',
  CANCELED: 'canceled',
  INCOMPLETE: 'incomplete',
})

export const BILLING_STATUSES = Object.freeze(Object.values(BILLING_STATUS))

export const BILLING_STATUS_LABELS = Object.freeze({
  [BILLING_STATUS.FREE]: 'Free',
  [BILLING_STATUS.ACTIVE]: 'Active',
  [BILLING_STATUS.TRIAL]: 'Trial',
  [BILLING_STATUS.PAST_DUE]: 'Past due',
  [BILLING_STATUS.CANCELED]: 'Canceled',
  [BILLING_STATUS.INCOMPLETE]: 'Incomplete',
})

/** Maps a real status onto an existing shared status-badge variant. */
export const BILLING_STATUS_VARIANTS = Object.freeze({
  [BILLING_STATUS.FREE]: 'free',
  [BILLING_STATUS.ACTIVE]: 'active',
  [BILLING_STATUS.TRIAL]: 'trial',
  [BILLING_STATUS.PAST_DUE]: 'past-due',
  [BILLING_STATUS.CANCELED]: 'canceled',
  [BILLING_STATUS.INCOMPLETE]: 'incomplete',
})

/** Shown whenever the backend has not reported a status at all. */
export const BILLING_STATUS_UNAVAILABLE_LABEL = 'Status unavailable'

/* ── Billing cycle ────────────────────────────────────────── */

export const BILLING_CYCLE = Object.freeze({
  MONTHLY: 'monthly',
  ANNUAL: 'annual',
  QUARTERLY: 'quarterly',
  ONE_TIME: 'one_time',
  CUSTOM: 'custom',
})

export const BILLING_CYCLE_LABELS = Object.freeze({
  [BILLING_CYCLE.MONTHLY]: 'Monthly',
  [BILLING_CYCLE.ANNUAL]: 'Annual',
  [BILLING_CYCLE.QUARTERLY]: 'Quarterly',
  [BILLING_CYCLE.ONE_TIME]: 'One-time',
  [BILLING_CYCLE.CUSTOM]: 'Custom',
})

/**
 * The cycles a customer may switch between on the pricing table.
 * Ordered cheapest-commitment last, matching the visual order of the toggle.
 */
export const BILLING_CYCLE_TOGGLE = Object.freeze([
  BILLING_CYCLE.MONTHLY,
  BILLING_CYCLE.ANNUAL,
])

/** Short period suffix rendered next to a price, e.g. `/month`, `/year`. */
export const BILLING_CYCLE_PERIODS = Object.freeze({
  [BILLING_CYCLE.MONTHLY]: '/month',
  [BILLING_CYCLE.ANNUAL]: '/year',
  [BILLING_CYCLE.QUARTERLY]: '/quarter',
})

/* ── Invoice status ───────────────────────────────────────── */

export const INVOICE_STATUS = Object.freeze({
  PAID: 'paid',
  OPEN: 'open',
  PAST_DUE: 'past_due',
  VOID: 'void',
  REFUNDED: 'refunded',
})

export const INVOICE_STATUS_LABELS = Object.freeze({
  [INVOICE_STATUS.PAID]: 'Paid',
  [INVOICE_STATUS.OPEN]: 'Open',
  [INVOICE_STATUS.PAST_DUE]: 'Past due',
  [INVOICE_STATUS.VOID]: 'Void',
  [INVOICE_STATUS.REFUNDED]: 'Refunded',
})

export const INVOICE_STATUS_VARIANTS = Object.freeze({
  [INVOICE_STATUS.PAID]: 'invoice-paid',
  [INVOICE_STATUS.OPEN]: 'invoice-open',
  [INVOICE_STATUS.PAST_DUE]: 'past-due',
  [INVOICE_STATUS.VOID]: 'canceled',
  [INVOICE_STATUS.REFUNDED]: 'canceled',
})

/* ── Payment method ───────────────────────────────────────── */

export const PAYMENT_METHOD_TYPE = Object.freeze({
  CARD: 'card',
  BANK_ACCOUNT: 'bank_account',
})

export const PAYMENT_METHOD_TYPE_LABELS = Object.freeze({
  [PAYMENT_METHOD_TYPE.CARD]: 'Card',
  [PAYMENT_METHOD_TYPE.BANK_ACCOUNT]: 'Bank account',
})

/* ── Value helpers ────────────────────────────────────────── */

const isBlank = (value) =>
  value === null || value === undefined || (typeof value === 'string' && value.trim() === '')

const asNumber = (value) => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value
  }
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : null
  }
  return null
}

/** Only ever returns a status the backend actually provided. */
export const getBillingStatus = (value) =>
  BILLING_STATUSES.includes(value) ? value : null

export const getBillingStatusLabel = (value) =>
  BILLING_STATUS_LABELS[getBillingStatus(value)] ?? BILLING_STATUS_UNAVAILABLE_LABEL

export const getBillingStatusVariant = (value) =>
  BILLING_STATUS_VARIANTS[getBillingStatus(value)] ?? 'unknown'

export const getInvoiceStatus = (value) =>
  Object.hasOwn(INVOICE_STATUS_LABELS, value) ? value : null

export const getInvoiceStatusLabel = (value) => INVOICE_STATUS_LABELS[value] ?? 'Unknown'

export const getInvoiceStatusVariant = (value) =>
  INVOICE_STATUS_VARIANTS[value] ?? 'unknown'

export const getBillingCycleLabel = (value) =>
  BILLING_CYCLE_LABELS[value] ?? BILLING_CYCLE_UNKNOWN_LABEL

const BILLING_CYCLE_UNKNOWN_LABEL = 'Not set'

/** Normalizes a cycle to one the pricing toggle can actually offer. */
export const getToggleableCycle = (value) =>
  BILLING_CYCLE_TOGGLE.includes(value) ? value : BILLING_CYCLE.MONTHLY

/** Period suffix for a price, or `null` for cycles with no repeating period. */
export const getBillingCyclePeriod = (value) =>
  BILLING_CYCLE_PERIODS[value] ?? null

/* ── Plan comparison ──────────────────────────────────────── */

/**
 * How a candidate plan relates to the plan the backend reports as current.
 * Purely structural — never used to imply that a change has been made.
 */
export const PLAN_RELATION = Object.freeze({
  CURRENT: 'current',
  UPGRADE: 'upgrade',
  DOWNGRADE: 'downgrade',
  SELECT: 'select',
})

export const PLAN_RELATION_LABELS = Object.freeze({
  [PLAN_RELATION.CURRENT]: 'Current plan',
  [PLAN_RELATION.UPGRADE]: 'Upgrade',
  [PLAN_RELATION.DOWNGRADE]: 'Downgrade',
  [PLAN_RELATION.SELECT]: 'Select plan',
})

/**
 * Compares a plan against the current one.
 *
 * Uses the plan's own rank when the backend publishes one, because catalogue
 * order is a display concern and must not decide whether something is an
 * upgrade. Falls back to catalogue position only when no rank exists.
 * Returns `select` whenever there is no real current plan to compare against.
 */
export const getPlanRelation = (plan, currentPlan, index = -1, currentIndex = -1) => {
  if (!plan || !currentPlan?.id) {
    return PLAN_RELATION.SELECT
  }
  if (plan.id === currentPlan.id) {
    return PLAN_RELATION.CURRENT
  }
  const planRank = asNumber(plan.rank)
  const currentRank = asNumber(currentPlan.rank)
  if (planRank !== null && currentRank !== null) {
    if (planRank === currentRank) {
      return PLAN_RELATION.SELECT
    }
    return planRank > currentRank ? PLAN_RELATION.UPGRADE : PLAN_RELATION.DOWNGRADE
  }
  if (index < 0 || currentIndex < 0) {
    return PLAN_RELATION.SELECT
  }
  return index > currentIndex ? PLAN_RELATION.UPGRADE : PLAN_RELATION.DOWNGRADE
}

export const getPlanRelationLabel = (relation) =>
  PLAN_RELATION_LABELS[relation] ?? PLAN_RELATION_LABELS[PLAN_RELATION.SELECT]

/**
 * The price for one cycle, preferring a dedicated per-cycle price and falling
 * back to the plan's single published price. `null` means "not published".
 */
export const getPlanPriceForCycle = (plan, cycle) => {
  if (!plan) {
    return null
  }
  const cycleKey = getToggleableCycle(cycle)
  const perCycle = plan.prices?.[cycleKey] ?? null
  if (perCycle && typeof perCycle === 'object') {
    return {
      amount: asNumber(perCycle.amount ?? perCycle.price),
      currency: perCycle.currency ?? plan.currency ?? null,
      cycle: cycleKey,
    }
  }
  const direct = asNumber(perCycle)
  if (direct !== null) {
    return { amount: direct, currency: plan.currency ?? null, cycle: cycleKey }
  }
  const fallback = asNumber(plan.price)
  if (fallback === null) {
    return null
  }
  return { amount: fallback, currency: plan.currency ?? null, cycle: plan.cycle ?? cycleKey }
}

/** Yearly price expressed per month, or `null` when nothing is published. */
export const getMonthlyEquivalent = (plan) => {
  const yearly = getPlanPriceForCycle(plan, BILLING_CYCLE.ANNUAL)
  if (!yearly) {
    return null
  }
  return { amount: yearly.amount / 12, currency: yearly.currency, cycle: BILLING_CYCLE.MONTHLY }
}

/** Share saved by paying yearly instead of monthly, as a whole percent. */
export const getAnnualSavingPercent = (plan) => {
  const monthly = getPlanPriceForCycle(plan, BILLING_CYCLE.MONTHLY)
  const yearly = getPlanPriceForCycle(plan, BILLING_CYCLE.ANNUAL)
  if (!monthly?.amount || !yearly?.amount || monthly.amount <= 0) {
    return null
  }
  const monthlyYearly = monthly.amount * 12
  if (monthlyYearly <= 0) {
    return null
  }
  const saved = ((monthlyYearly - yearly.amount) / monthlyYearly) * 100
  if (!Number.isFinite(saved) || saved <= 0) {
    return null
  }
  return Math.floor(saved)
}

/* ── Subscription actions ─────────────────────────────────── */

/**
 * Statuses on which cancelling makes sense, and statuses on which a previously
 * cancelled subscription can be resumed. Anything else yields neither action.
 */
const CANCELLABLE_STATUSES = Object.freeze([
  BILLING_STATUS.ACTIVE,
  BILLING_STATUS.TRIAL,
  BILLING_STATUS.PAST_DUE,
])

const RESUMABLE_STATUSES = Object.freeze([BILLING_STATUS.CANCELED])

/** True when the backend reported a subscription that is scheduled to end. */
export const isCancellationScheduled = (overview) =>
  Boolean(overview?.cancelAtPeriodEnd) || Boolean(overview?.canceledAt)

/**
 * Which actions the current subscription state supports.
 * `available` describes the plan, not the connection: whether a control is
 * enabled still depends on the billing backend being reachable.
 */
export const getSubscriptionActions = (overview) => {
  const status = getBillingStatus(overview?.status)
  const hasSubscription = Boolean(overview)
  return {
    hasSubscription,
    status,
    canChangePlan: hasSubscription && status !== BILLING_STATUS.CANCELED,
    canCancel:
      hasSubscription && CANCELLABLE_STATUSES.includes(status) && !isCancellationScheduled(overview),
    canResume: hasSubscription && RESUMABLE_STATUSES.includes(status),
    canManage: hasSubscription,
    isFree: status === BILLING_STATUS.FREE,
  }
}

/** ISO string → readable date, or `null` when nothing real was provided. */
export const formatBillingDate = (value) => {
  if (isBlank(value)) {
    return null
  }
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return String(value)
  }
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

/** Amount → localized currency string, or `null` when nothing real exists. */
export const formatBillingAmount = (amount, currency, options = {}) => {
  const raw = asNumber(amount)
  if (raw === null) {
    return null
  }
  const value = options.minorUnits ? raw / 100 : raw
  if (isBlank(currency)) {
    return value.toLocaleString(undefined, {
      minimumFractionDigits: options.minorUnits ? 2 : undefined,
      maximumFractionDigits: options.minorUnits ? 2 : undefined,
    })
  }
  try {
    return value.toLocaleString(undefined, {
      style: 'currency',
      currency: String(currency).toUpperCase(),
    })
  } catch {
    return `${String(currency).toUpperCase()} ${value}`
  }
}

/**
 * Card expiry from a provider value (`'2027-04'`, `4/2027`, `4/27`).
 * Only month/year is ever rendered — never a full card number.
 */
export const formatCardExpiry = (value) => {
  if (value === null || value === undefined || value === '') {
    return null
  }
  if (typeof value === 'object') {
    const month = asNumber(value.month)
    const year = asNumber(value.year)
    if (month === null || year === null) {
      return null
    }
    return `${String(month).padStart(2, '0')}/${String(year).slice(-2)}`
  }
  const raw = String(value).trim()
  const parts = raw.split(/[\s/-]+/).filter(Boolean)
  if (parts.length < 2) {
    return null
  }
  const month = asNumber(parts[0])
  const year = asNumber(parts[1])
  if (month === null || year === null) {
    return null
  }
  return `${String(month).padStart(2, '0')}/${String(year).slice(-2)}`
}

/** Brand + masked last four, e.g. "Visa •••• 4242". */
export const formatPaymentMethodLabel = (method) => {
  if (!method) {
    return null
  }
  const brand = isBlank(method.brand) ? null : String(method.brand).trim()
  const last4 = isBlank(method.last4) ? null : String(method.last4).trim()
  if (brand && last4) {
    return `${brand} •••• ${last4}`
  }
  if (last4) {
    return `•••• ${last4}`
  }
  return brand ?? null
}

export const getPaymentMethodTypeLabel = (method) => {
  const type = method?.type
  if (type === PAYMENT_METHOD_TYPE.BANK_ACCOUNT) {
    return PAYMENT_METHOD_TYPE_LABELS[PAYMENT_METHOD_TYPE.BANK_ACCOUNT]
  }
  if (type === PAYMENT_METHOD_TYPE.CARD) {
    return PAYMENT_METHOD_TYPE_LABELS[PAYMENT_METHOD_TYPE.CARD]
  }
  return null
}

/* ── Normalizers (backend payload → UI shape) ─────────────── */

const pickFirstDefined = (...values) => values.find((value) => !isBlank(value))

/**
 * @typedef {Object} BillingOverview
 * @property {string|null} planId
 * @property {string|null} planName
 * @property {string|null} status - Only a known `BILLING_STATUS` value.
 * @property {string|null} cycle
 * @property {number|null} price
 * @property {string|null} currency
 * @property {string|null} renewsAt
 * @property {string|null} trialEndsAt
 * @property {string|null} canceledAt
 * @property {boolean} cancelAtPeriodEnd
 * @property {string|null} paymentMethodId
 */

/** Maps a backend subscription payload. Returns `null` when nothing exists. */
export const toBillingOverview = (data) => {
  if (!data || typeof data !== 'object') {
    return null
  }
  const source = data.subscription ?? data
  return {
    planId: pickFirstDefined(source.planId, source.plan_id) ?? null,
    planName: pickFirstDefined(source.planName, source.plan_name, source.name) ?? null,
    status: getBillingStatus(source.status),
    cycle: pickFirstDefined(source.billingCycle, source.billing_cycle, source.cycle) ?? null,
    price: asNumber(pickFirstDefined(source.price, source.amount)),
    currency: pickFirstDefined(source.currency) ?? null,
    renewsAt:
      pickFirstDefined(source.renewsAt, source.renews_at, source.nextRenewalAt) ?? null,
    trialEndsAt:
      pickFirstDefined(source.trialEndsAt, source.trial_ends_at, source.trialEndsOn) ?? null,
    canceledAt: pickFirstDefined(source.canceledAt, source.canceled_at) ?? null,
    cancelAtPeriodEnd:
      source.cancelAtPeriodEnd === true ||
      source.cancel_at_period_end === true ||
      source.endedAt !== undefined ||
      source.ended_at !== undefined,
    paymentMethodId:
      pickFirstDefined(source.paymentMethodId, source.payment_method_id) ?? null,
  }
}

/**
 * @typedef {Object} BillingPlanOption
 * @property {string} id
 * @property {string} name
 * @property {string|null} eyebrow
 * @property {string|null} tagline
 * @property {string|null} description
 * @property {number|null} price
 * @property {string|null} currency
 * @property {string|null} cycle
 * @property {number|null} rank - Optional ordering used to tell upgrades from downgrades.
 * @property {Object|null} prices - Optional per-cycle prices, e.g. `{ monthly, annual }`.
 * @property {boolean} purchasable
 * @property {boolean} recommended
 * @property {Array<{ label: string, included: boolean }>} features
 */

/**
 * Per-cycle price map. Accepts `{ monthly, annual }`, `{ prices: {...} }` and
 * `{ monthlyPrice, annualPrice }` shapes. Missing or unparseable cycles are
 * omitted rather than defaulted, so an unpublished cycle stays unpublished.
 */
const toCyclePrices = (record) => {
  const source = record.prices ?? record.pricing ?? null
  const prices = {}
  BILLING_CYCLE_TOGGLE.forEach((cycle) => {
    const camelKey = `${cycle}Price`
    const candidate =
      source?.[cycle] ?? record[camelKey] ?? (cycle === BILLING_CYCLE.ANNUAL ? record.yearlyPrice : null)
    if (candidate === null || candidate === undefined) {
      return
    }
    if (candidate && typeof candidate === 'object') {
      const amount = asNumber(candidate.amount ?? candidate.price)
      prices[cycle] = {
        amount,
        currency: pickFirstDefined(candidate.currency, record.currency) ?? null,
      }
      return
    }
    prices[cycle] = { amount: asNumber(candidate), currency: record.currency ?? null }
  })
  return Object.keys(prices).length > 0 ? prices : null
}

/** Maps backend plan records onto the plan-card shape. */
export const toPlanList = (records) => {
  if (!Array.isArray(records)) {
    return []
  }
  return records
    .filter((record) => record && typeof record === 'object')
    .map((record) => {
      const rawFeatures = Array.isArray(record.features) ? record.features : []
      return {
        id: String(pickFirstDefined(record.id, record.planId, record.code) ?? ''),
        name: String(pickFirstDefined(record.name, record.title) ?? 'Plan'),
        eyebrow: pickFirstDefined(record.eyebrow, record.category) ?? null,
        tagline: pickFirstDefined(record.tagline, record.summary) ?? null,
        description: pickFirstDefined(record.description) ?? null,
        price: asNumber(pickFirstDefined(record.price, record.amount)),
        currency: pickFirstDefined(record.currency) ?? null,
        cycle: pickFirstDefined(record.cycle, record.billingCycle) ?? null,
        rank: asNumber(pickFirstDefined(record.rank, record.level, record.tier)),
        prices: toCyclePrices(record),
        purchasable: record.purchasable === true,
        recommended: record.recommended === true,
        features: rawFeatures
          .filter((feature) => feature && typeof feature === 'object')
          .map((feature) => ({
            label: String(pickFirstDefined(feature.label, feature.name) ?? ''),
            included: feature.included !== false,
          }))
          .filter((feature) => feature.label !== ''),
      }
    })
    .filter((plan) => plan.id !== '')
}

/**
 * @typedef {Object} BillingPaymentMethod
 * @property {string} id
 * @property {string|null} type
 * @property {string|null} brand
 * @property {string|null} last4
 * @property {string} expiry - `MM/YY` or `null`.
 * @property {boolean} isDefault
 * @property {string|null} holder
 */

/** Maps a stored payment method. Only masked metadata is ever kept. */
export const toPaymentMethod = (record) => {
  if (!record || typeof record !== 'object') {
    return null
  }
  const card = record.card ?? record
  const bank = record.bankAccount ?? record
  const source = record.type === PAYMENT_METHOD_TYPE.BANK_ACCOUNT ? bank : card
  const id = pickFirstDefined(record.id, record.paymentMethodId)
  if (isBlank(id)) {
    return null
  }
  return {
    id: String(id),
    type: Object.hasOwn(PAYMENT_METHOD_TYPE_LABELS, record.type) ? record.type : null,
    brand: pickFirstDefined(source.brand, record.brand) ?? null,
    last4: pickFirstDefined(source.last4, record.last4) ?? null,
    expiry: formatCardExpiry(pickFirstDefined(source.expiry, source.expMonth, record.expiry)),
    isDefault: record.isDefault === true || record.default === true,
    holder: pickFirstDefined(source.holder, record.holder) ?? null,
  }
}

/**
 * @typedef {Object} BillingInvoice
 * @property {string} id
 * @property {string|null} number
 * @property {string|null} issuedAt
 * @property {number|null} amount
 * @property {string|null} currency
 * @property {string|null} status - Only a known `INVOICE_STATUS` value.
 * @property {string|null} planName
 * @property {string|null} receiptUrl
 */

/** Maps an invoice record. */
export const toInvoice = (record) => {
  if (!record || typeof record !== 'object') {
    return null
  }
  const id = pickFirstDefined(record.id, record.invoiceId, record.number)
  if (isBlank(id)) {
    return null
  }
  return {
    id: String(id),
    number: pickFirstDefined(record.number, record.invoiceNumber) ?? null,
    issuedAt: pickFirstDefined(record.issuedAt, record.issued_at, record.date, record.createdAt) ?? null,
    amount: asNumber(pickFirstDefined(record.amount, record.amountPaid, record.total)),
    currency: pickFirstDefined(record.currency) ?? null,
    status: getInvoiceStatus(record.status),
    planName: pickFirstDefined(record.planName, record.plan_name, record.description) ?? null,
    receiptUrl: pickFirstDefined(record.receiptUrl, record.receipt_url, record.hostedInvoiceUrl) ?? null,
  }
}
