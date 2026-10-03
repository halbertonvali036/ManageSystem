import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { BILLING_PLANS } from '@/config/billing'
import {
  getPlanPriceForCycle,
  getSubscriptionActions,
  getToggleableCycle,
  isCancellationScheduled,
  toBillingOverview,
  toInvoice,
  toPaymentMethod,
  toPlanList,
} from '@/models/billing'
import billingService from '@/services/billingService'
import { BackendNotConnectedError } from '@/services/httpClient'

const NOT_CONNECTED_MESSAGE =
  'Billing is not connected yet. No plan changes or payments can be made from this page.'

const getActionErrorMessage = (error) => {
  if (error instanceof BackendNotConnectedError) {
    return NOT_CONNECTED_MESSAGE
  }
  return error?.message ?? 'Billing action is unavailable right now.'
}

const normalizePaymentMethods = (records) =>
  records.map(toPaymentMethod).filter(Boolean)

const normalizeInvoices = (records) => records.map(toInvoice).filter(Boolean)

/**
 * Reads the signed-in account's billing state.
 *
 * Until a billing backend exists the service resolves safe empty values, so
 * this hook reports `backendUnavailable` and the page renders honest
 * unavailable / empty states. Actions are exposed for the future integration
 * but never simulate a successful payment.
 */
function useBillingOverview() {
  const [overview, setOverview] = useState(null)
  const [backendPlans, setBackendPlans] = useState([])
  const [paymentMethods, setPaymentMethods] = useState([])
  const [invoices, setInvoices] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState(null)
  const [backendUnavailable, setBackendUnavailable] = useState(false)
  const [actionError, setActionError] = useState(null)
  const [pendingAction, setPendingAction] = useState(null)
  const [requestedCycle, setRequestedCycle] = useState(null)
  const mountedRef = useRef(true)

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
    }
  }, [])

  const fetchBillingData = useCallback(() =>
    Promise.all([
      billingService.getBillingOverview(),
      billingService.getPlans(),
      billingService.getPaymentMethods(),
      billingService.getInvoices(),
    ])
      .then(([overviewData, planData, paymentMethodData, invoiceData]) => {
        if (!mountedRef.current) {
          return
        }
        setOverview(toBillingOverview(overviewData))
        setBackendPlans(toPlanList(planData))
        setPaymentMethods(normalizePaymentMethods(paymentMethodData))
        setInvoices(normalizeInvoices(invoiceData))
        setBackendUnavailable(false)
      })
      .catch((error) => {
        if (!mountedRef.current) {
          return
        }
        setOverview(null)
        setBackendPlans([])
        setPaymentMethods([])
        setInvoices([])
        if (error instanceof BackendNotConnectedError) {
          setBackendUnavailable(true)
          return
        }
        setLoadError(error?.message ?? 'Could not load billing information.')
      })
      .finally(() => {
        if (mountedRef.current) {
          setIsLoading(false)
        }
      }), [])

  useEffect(() => {
    fetchBillingData()
  }, [fetchBillingData])

  /**
   * `silent` re-reads without flipping the page back to its loading skeleton —
   * used after a mutation so the refreshed state replaces the old one in place.
   */
  const refetch = useCallback(
    ({ silent = false } = {}) => {
      if (!silent) {
        setIsLoading(true)
        setLoadError(null)
      }
      return fetchBillingData()
    },
    [fetchBillingData],
  )

  const runAction = useCallback(async (name, action) => {
    setPendingAction(name)
    setActionError(null)
    try {
      await action()
      return true
    } catch (error) {
      if (mountedRef.current) {
        setActionError(getActionErrorMessage(error))
      }
      return false
    } finally {
      if (mountedRef.current) {
        setPendingAction(null)
      }
    }
  }, [])

  const startCheckout = useCallback(
    (planId, checkoutCycle) =>
      runAction('checkout', () => billingService.createCheckoutSession(planId, checkoutCycle)),
    [runAction],
  )

  const openBillingPortal = useCallback(
    () => runAction('portal', () => billingService.openBillingPortal()),
    [runAction],
  )

  const cancelSubscription = useCallback(
    () =>
      runAction('cancel', async () => {
        const result = await billingService.cancelSubscription({ atPeriodEnd: true })
        await refetch({ silent: true })
        return result
      }),
    [refetch, runAction],
  )

  const resumeSubscription = useCallback(
    () =>
      runAction('resume', async () => {
        const result = await billingService.resumeSubscription()
        await refetch({ silent: true })
        return result
      }),
    [refetch, runAction],
  )

  const selectCycle = useCallback((cycle) => {
    setRequestedCycle(getToggleableCycle(cycle))
    setActionError(null)
  }, [])

  const hasBackendPlans = backendPlans.length > 0
  const plans = hasBackendPlans ? backendPlans : BILLING_PLANS
  const isPlaceholderCatalogue = !hasBackendPlans
  const hasSubscription = Boolean(overview)
  const canManageBilling = hasSubscription && !backendUnavailable

  // The toggle starts on whatever the backend says the account is billed on,
  // and the customer's choice wins afterwards.
  const cycle = requestedCycle ?? getToggleableCycle(overview?.cycle)
  const currentPlan = useMemo(
    () => plans.find((plan) => plan.id === overview?.planId) ?? null,
    [overview?.planId, plans],
  )
  const actions = useMemo(() => getSubscriptionActions(overview), [overview])

  return {
    overview,
    plans,
    isPlaceholderCatalogue,
    paymentMethods,
    invoices,
    hasSubscription,
    canManageBilling,
    isLoading,
    loadError,
    backendUnavailable,
    actionError,
    pendingAction,
    refetch,
    startCheckout,
    openBillingPortal,
    cancelSubscription,
    resumeSubscription,
    cycle,
    selectCycle,
    currentPlan,
    currentPlanPrice: getPlanPriceForCycle(currentPlan, cycle),
    subscriptionActions: actions,
    cancellationScheduled: isCancellationScheduled(overview),
  }
}

export default useBillingOverview
