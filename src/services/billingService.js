import config from '@/config'
import httpClient, {
  BackendNotConnectedError,
  isEndpointMissing,
  isEndpointUnavailable,
} from '@/services/httpClient'

/**
 * Billing service foundation.
 *
 * Identity is always inferred by the backend from the authenticated session —
 * no `userId` is ever sent or hardcoded here, and prices always come from the
 * backend rather than from frontend constants.
 *
 * Reads degrade to safe empty values (`null` / `[]`) when an endpoint is not
 * served, so the UI renders real empty and unavailable states instead of demo
 * data.
 *
 * Checkout runs in two steps: `createCheckoutSession` either hands back a URL
 * (same-origin path → in-app checkout, other origin → provider-hosted page) or
 * nothing at all when there is nothing to confirm (e.g. the free tier). The
 * card itself is only ever sent by `confirmCheckout`, straight from the form to
 * this request — it is never logged, cached or attached to an error here.
 */

const BILLING_PATH = '/billing'
const PLANS_PATH = '/billing/plans'
const CHECKOUT_PATH = '/billing/checkout-session'
const PORTAL_PATH = '/billing/portal-session'
const PAYMENT_METHODS_PATH = '/billing/payment-methods'
const INVOICES_PATH = '/billing/invoices'
const SUBSCRIPTION_PATH = '/billing/subscription'

const isBackendConnected = () => Boolean(config.api.baseUrl)

const ensureBackendConnection = () => {
  if (!isBackendConnected()) {
    throw new BackendNotConnectedError()
  }
}

const toList = (response, keys = []) => {
  if (Array.isArray(response)) {
    return response
  }
  for (const key of keys) {
    if (Array.isArray(response?.[key])) {
      return response[key]
    }
  }
  if (Array.isArray(response?.data)) {
    return response.data
  }
  return []
}

/**
 * A read that is not served by this backend. A 404/403/405 from a read is
 * "nothing is served here", so it degrades to the same empty value the service
 * returns when no backend is configured — the page renders its existing
 * unavailable/empty state instead of a load failure. A real failure (400/409/
 * 422/5xx) still propagates.
 */
const readUnavailable = (error, fallback) => {
  if (isEndpointUnavailable(error)) {
    return fallback
  }
  throw error
}

/** The same refusal for writes: an absent endpoint must not look like a charge. */
const writeUnavailable = (error) => {
  if (isEndpointUnavailable(error)) {
    throw new BackendNotConnectedError('Billing integration is unavailable.')
  }
  throw error
}

/**
 * Checkout-specific refusal: only `404`/`405` say "the collection route does
 * not exist". `400`/`403`/`409`/`422` from the backend are real answers with a
 * real message and must reach the caller untouched.
 */
const writeEndpointMissing = (error) => {
  if (isEndpointMissing(error)) {
    throw new BackendNotConnectedError('Billing integration is unavailable.')
  }
  throw error
}

/** The pricing table only offers the two published cycles. */
const toCheckoutCycle = (cycle) => (cycle === 'annual' ? 'annual' : 'monthly')

/* ── Reads ────────────────────────────────────────────────── */

/** Current subscription summary for the signed-in account, or `null`. */
const getBillingOverview = async () => {
  if (!isBackendConnected()) {
    return null
  }
  try {
    const response = await httpClient.get(BILLING_PATH)
    return response?.data ?? response ?? null
  } catch (error) {
    return readUnavailable(error, null)
  }
}

/** Published plan catalogue for the signed-in account, or `[]`. */
const getPlans = async () => {
  if (!isBackendConnected()) {
    return []
  }
  try {
    const response = await httpClient.get(PLANS_PATH)
    return toList(response, ['plans'])
  } catch (error) {
    return readUnavailable(error, [])
  }
}

/**
 * Published plan catalogue for public surfaces (the landing page), or `[]`.
 *
 * Sent without a token (`anonymous`), because the catalogue is served to
 * anyone: a missing or expired session must never fail this read and never
 * triggers the session-expired redirect on a page guests can reach. A real
 * failure still propagates so the caller can render its unavailable state.
 */
const getPublicPlans = async () => {
  if (!isBackendConnected()) {
    return []
  }
  try {
    const response = await httpClient.get(PLANS_PATH, { anonymous: true })
    return toList(response, ['plans'])
  } catch (error) {
    return readUnavailable(error, [])
  }
}

/** Stored payment-method metadata (brand / last4 / expiry), or `[]`. */
const getPaymentMethods = async () => {
  if (!isBackendConnected()) {
    return []
  }
  try {
    const response = await httpClient.get(PAYMENT_METHODS_PATH)
    return toList(response, ['paymentMethods', 'payment_methods'])
  } catch (error) {
    return readUnavailable(error, [])
  }
}

/** Invoice history for the signed-in account, or `[]`. */
const getInvoices = async () => {
  if (!isBackendConnected()) {
    return []
  }
  try {
    const response = await httpClient.get(INVOICES_PATH)
    return toList(response, ['invoices'])
  } catch (error) {
    return readUnavailable(error, [])
  }
}

/* ── Mutations (require backend + provider integration) ───── */

/**
 * Creates a checkout session for a plan.
 *
 * The backend owns plan pricing, taxes and the provider call. The chosen cycle
 * is forwarded as an explicit `monthly` | `annual` intent; the backend still
 * decides what that combination actually costs and never receives a price from
 * this client.
 *
 * The result may carry a `checkoutUrl` (or `url`): same-origin it is where the
 * in-app checkout lives, cross-origin it is the provider's hosted page. No URL
 * at all means there is nothing to confirm — e.g. the free tier activates
 * directly and the caller just refreshes the billing state.
 */
const createCheckoutSession = async (planId, cycle) => {
  ensureBackendConnection()
  try {
    const response = await httpClient.post(CHECKOUT_PATH, {
      planId,
      cycle: toCheckoutCycle(cycle),
    })
    return response?.data ?? response ?? null
  } catch (error) {
    return writeEndpointMissing(error)
  }
}

/**
 * Reads one checkout session by its id.
 *
 * Every error propagates as is — a `404` here means the session does not exist
 * or has expired, which the checkout page renders as its own dedicated state,
 * never as "billing is not connected".
 */
const getCheckoutSession = async (sessionId) => {
  ensureBackendConnection()
  const response = await httpClient.get(
    `${CHECKOUT_PATH}/${encodeURIComponent(sessionId)}`,
  )
  return response?.data ?? response ?? null
}

/**
 * Confirms a checkout session with card details.
 *
 * The card payload travels from the caller straight into this request and back
 * out as a plain success/failure: it is never logged, never cached, and never
 * attached to the error that is thrown. Backend answers (`400`/`403`/`409`/
 * `422` included) propagate with the backend's own message for the page to
 * display after stripping anything card-like from it.
 */
const confirmCheckout = async (sessionId, card) => {
  ensureBackendConnection()
  const response = await httpClient.post(
    `${CHECKOUT_PATH}/${encodeURIComponent(sessionId)}/confirm`,
    {
      cardNumber: card.cardNumber,
      expMonth: card.expMonth,
      expYear: card.expYear,
      cvc: card.cvc,
      cardholderName: card.cardholderName,
    },
  )
  return response?.data ?? response ?? null
}

/** Creates a provider-hosted billing portal session for self-service. */
const openBillingPortal = async () => {
  ensureBackendConnection()
  try {
    const response = await httpClient.post(PORTAL_PATH, {})
    return response?.data ?? response ?? null
  } catch (error) {
    return writeUnavailable(error)
  }
}

/**
 * Cancels the current subscription at the end of the paid period.
 *
 * The frontend never cancels anything itself: the backend owns the schedule,
 * any prorated credit and the provider call. `cancelAtPeriodEnd` is sent as an
 * explicit intent rather than an immediate cancellation so the UI cannot
 * accidentally end access before the period is paid for.
 */
const cancelSubscription = async ({ atPeriodEnd = true } = {}) => {
  ensureBackendConnection()
  try {
    const response = await httpClient.post(SUBSCRIPTION_PATH, {
      cancelAtPeriodEnd: atPeriodEnd,
    })
    return response?.data ?? response ?? null
  } catch (error) {
    return writeUnavailable(error)
  }
}

/** Un-cancels a subscription that is set to end at the close of its period. */
const resumeSubscription = async () => {
  ensureBackendConnection()
  try {
    const response = await httpClient.post(`${SUBSCRIPTION_PATH}/resume`, {})
    return response?.data ?? response ?? null
  } catch (error) {
    return writeUnavailable(error)
  }
}

/** Card details are collected by the provider's secure component only. */
const addPaymentMethod = async () => {
  ensureBackendConnection()
  try {
    const response = await httpClient.post(PAYMENT_METHODS_PATH, {})
    return response?.data ?? response ?? null
  } catch (error) {
    return writeUnavailable(error)
  }
}

const setDefaultPaymentMethod = async (paymentMethodId) => {
  ensureBackendConnection()
  try {
    const response = await httpClient.post(
      `${PAYMENT_METHODS_PATH}/${paymentMethodId}/default`,
      {},
    )
    return response?.data ?? response ?? null
  } catch (error) {
    return writeUnavailable(error)
  }
}

const removePaymentMethod = async (paymentMethodId) => {
  ensureBackendConnection()
  try {
    await httpClient.delete(`${PAYMENT_METHODS_PATH}/${paymentMethodId}`)
  } catch (error) {
    return writeUnavailable(error)
  }
}

const downloadInvoice = async (invoiceId) => {
  ensureBackendConnection()
  try {
    const response = await httpClient.get(`${INVOICES_PATH}/${invoiceId}/receipt`)
    return response?.data ?? response ?? null
  } catch (error) {
    return readUnavailable(error, null)
  }
}

const billingService = {
  isBackendConnected,
  getBillingOverview,
  getPlans,
  getPublicPlans,
  getPaymentMethods,
  getInvoices,
  createCheckoutSession,
  getCheckoutSession,
  confirmCheckout,
  cancelSubscription,
  resumeSubscription,
  openBillingPortal,
  addPaymentMethod,
  setDefaultPaymentMethod,
  removePaymentMethod,
  downloadInvoice,
}

export default billingService
