import config from '@/config'
import httpClient, { BackendNotConnectedError } from '@/services/httpClient'

/**
 * Billing service foundation.
 *
 * Identity is always inferred by the backend from the authenticated session —
 * no `userId` is ever sent or hardcoded here.
 *
 * While the billing backend does not exist:
 * - reads resolve with safe empty values (`null` / `[]`), matching the
 *   convention used by the other services in this project, so the UI renders
 *   real empty and unavailable states instead of demo data;
 * - mutations throw `BackendNotConnectedError`. Nothing here simulates a
 *   successful charge, subscription, payment method or receipt.
 *
 * No payment provider SDK is included. Checkout and the billing portal must be
 * created server-side and handed to the provider's hosted page.
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

/* ── Reads ────────────────────────────────────────────────── */

/** Current subscription summary for the signed-in account, or `null`. */
const getBillingOverview = async () => {
  if (!isBackendConnected()) {
    return null
  }
  const response = await httpClient.get(BILLING_PATH)
  return response?.data ?? response ?? null
}

/** Published plan catalogue for the signed-in account, or `[]`. */
const getPlans = async () => {
  if (!isBackendConnected()) {
    return []
  }
  const response = await httpClient.get(PLANS_PATH)
  return toList(response, ['plans'])
}

/** Stored payment-method metadata (brand / last4 / expiry), or `[]`. */
const getPaymentMethods = async () => {
  if (!isBackendConnected()) {
    return []
  }
  const response = await httpClient.get(PAYMENT_METHODS_PATH)
  return toList(response, ['paymentMethods', 'payment_methods'])
}

/** Invoice history for the signed-in account, or `[]`. */
const getInvoices = async () => {
  if (!isBackendConnected()) {
    return []
  }
  const response = await httpClient.get(INVOICES_PATH)
  return toList(response, ['invoices'])
}

/* ── Mutations (require backend + provider integration) ───── */

/**
 * Creates a provider-hosted checkout session for a plan.
 *
 * The backend must own plan pricing, taxes and the provider call. The chosen
 * cycle is forwarded as an explicit intent; the backend still decides what that
 * combination actually costs.
 */
const createCheckoutSession = async (planId, cycle) => {
  ensureBackendConnection()
  const response = await httpClient.post(CHECKOUT_PATH, { planId, cycle: cycle ?? null })
  return response?.data ?? response ?? null
}

/** Creates a provider-hosted billing portal session for self-service. */
const openBillingPortal = async () => {
  ensureBackendConnection()
  const response = await httpClient.post(PORTAL_PATH, {})
  return response?.data ?? response ?? null
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
  const response = await httpClient.post(SUBSCRIPTION_PATH, {
    cancelAtPeriodEnd: atPeriodEnd,
  })
  return response?.data ?? response ?? null
}

/** Un-cancels a subscription that is set to end at the close of its period. */
const resumeSubscription = async () => {
  ensureBackendConnection()
  const response = await httpClient.post(`${SUBSCRIPTION_PATH}/resume`, {})
  return response?.data ?? response ?? null
}

/** Card details are collected by the provider's secure component only. */
const addPaymentMethod = async () => {
  ensureBackendConnection()
  const response = await httpClient.post(PAYMENT_METHODS_PATH, {})
  return response?.data ?? response ?? null
}

const setDefaultPaymentMethod = async (paymentMethodId) => {
  ensureBackendConnection()
  const response = await httpClient.post(
    `${PAYMENT_METHODS_PATH}/${paymentMethodId}/default`,
    {},
  )
  return response?.data ?? response ?? null
}

const removePaymentMethod = async (paymentMethodId) => {
  ensureBackendConnection()
  await httpClient.delete(`${PAYMENT_METHODS_PATH}/${paymentMethodId}`)
}

const downloadInvoice = async (invoiceId) => {
  ensureBackendConnection()
  const response = await httpClient.get(`${INVOICES_PATH}/${invoiceId}/receipt`)
  return response?.data ?? response ?? null
}

const billingService = {
  isBackendConnected,
  getBillingOverview,
  getPlans,
  getPaymentMethods,
  getInvoices,
  createCheckoutSession,
  cancelSubscription,
  resumeSubscription,
  openBillingPortal,
  addPaymentMethod,
  setDefaultPaymentMethod,
  removePaymentMethod,
  downloadInvoice,
}

export default billingService
