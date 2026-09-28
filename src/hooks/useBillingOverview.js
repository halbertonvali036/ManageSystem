import { useCallback, useEffect, useRef, useState } from 'react'
import { BILLING_PLANS } from '@/config/billing'
import {
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

  const refetch = useCallback(() => {
    setIsLoading(true)
    setLoadError(null)
    fetchBillingData()
  }, [fetchBillingData])

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
    (planId) => runAction('checkout', () => billingService.createCheckoutSession(planId)),
    [runAction],
  )

  const openBillingPortal = useCallback(
    () => runAction('portal', () => billingService.openBillingPortal()),
    [runAction],
  )

  const hasBackendPlans = backendPlans.length > 0
  const plans = hasBackendPlans ? backendPlans : BILLING_PLANS
  const isPlaceholderCatalogue = !hasBackendPlans
  const hasSubscription = Boolean(overview)
  const canManageBilling = hasSubscription && !backendUnavailable

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
  }
}

export default useBillingOverview
