import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BILLING_PLANS } from '@/config/billing'
import {
  FREE_PLAN_CODE,
  getPlanPriceForCycle,
  getSubscriptionActions,
  getToggleableCycle,
  isCancellationScheduled,
  matchesPlanIdentifier,
  toBillingOverview,
  toInvoice,
  toPaymentMethod,
  toPlanList,
} from '@/models/billing'
import billingService from '@/services/billingService'
import { BackendNotConnectedError } from '@/services/httpClient'
import { BILLING_CHECKOUT_PATH, CHECKOUT_SESSION_PATH } from '@/utils/constants'

const NOT_CONNECTED_MESSAGE =
  'Billing is not connected yet. No plan changes or payments can be made from this page.'

const getActionErrorMessage = (error) => {
  if (error instanceof BackendNotConnectedError) {
    return NOT_CONNECTED_MESSAGE
  }
  return error?.message ?? 'Billing action is unavailable right now.'
}

/** The session hand-off URL, accepted as `checkoutUrl` or `url`. */
const getCheckoutUrl = (session) => {
  const value = session?.checkoutUrl ?? session?.url ?? null
  return typeof value === 'string' && value.trim() !== '' ? value.trim() : null
}

/** The session id the backend created, when it is not handed over as a URL. */
const getCheckoutSessionId = (session) => {
  const value = session?.sessionId ?? session?.session_id ?? session?.id ?? null
  if (value === null || value === undefined || String(value).trim() === '') {
    return null
  }
  return String(value).trim()
}

/**
 * Decides how to follow a checkout URL: an app-relative path (or an absolute
 * URL on this origin) stays inside the router, anything else is a hosted page
 * on another origin and needs a full page load.
 *
 * The backend builds `checkoutUrl` from its own `FRONTEND_URL`, which in
 * deployments defaults to `http://localhost:3000`. When that URL still points
 * at this app's own checkout route it is followed in-app instead of loading
 * the foreign origin — the session id is the same either way.
 */
const resolveCheckoutTarget = (value) => {
  try {
    const url = new URL(value, window.location.origin)
    const isOwnCheckoutRoute = url.pathname.startsWith(`${BILLING_CHECKOUT_PATH}/`)
    if (url.origin !== window.location.origin && !isOwnCheckoutRoute) {
      return { external: url.href }
    }
    return { path: `${url.pathname}${url.search}${url.hash}` }
  } catch {
    return null
  }
}

const normalizePaymentMethods = (records) =>
  records.map(toPaymentMethod).filter(Boolean)

const normalizeInvoices = (records) => records.map(toInvoice).filter(Boolean)

/**
 * Reads the signed-in account's billing state.
 *
 * The backend owns every value shown: plans, prices, subscription state and
 * checkout sessions all come from the API, and actions surface the backend's
 * own answers. `canManageBilling` is about *plan selection* — it only needs the
 * backend's plan catalogue, never a pre-existing subscription — while cancel,
 * resume and the billing portal stay gated on `hasSubscription`.
 */
function useBillingOverview() {
  const navigate = useNavigate()
  const [overview, setOverview] = useState(null)
  const [backendPlans, setBackendPlans] = useState([])
  const [paymentMethods, setPaymentMethods] = useState([])
  const [invoices, setInvoices] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState(null)
  const [backendUnavailable, setBackendUnavailable] = useState(false)
  const [actionError, setActionError] = useState(null)
  const [actionNotice, setActionNotice] = useState(null)
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
    setActionNotice(null)
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

  /**
   * Starts checkout for `planId` on the selected cycle.
   *
   * Where checkout happens is the backend's decision:
   * - a same-origin URL (or the `/billing/checkout/:sessionId` path) is opened
   *   with the router, so the account chrome stays;
   * - a URL on another origin is the provider's hosted page → full navigation;
   * - no URL at all means there was nothing to confirm (the free tier just
   *   activated), so the billing state is re-read silently and a success notice
   *   is shown next to the plan cards.
   * Backend refusals (403/422/…) land in `actionError` with the backend's own
   * message.
   */
  const startCheckout = useCallback(
    (planId, checkoutCycle) =>
      runAction('checkout', async () => {
        const session = await billingService.createCheckoutSession(planId, checkoutCycle)
        const checkoutUrl = getCheckoutUrl(session)
        if (checkoutUrl) {
          const target = resolveCheckoutTarget(checkoutUrl)
          if (target?.external) {
            window.location.assign(target.external)
          } else if (target?.path) {
            navigate(target.path)
          }
          return session
        }
        const sessionId = getCheckoutSessionId(session)
        if (sessionId) {
          navigate(CHECKOUT_SESSION_PATH(sessionId))
          return session
        }
        // Nothing to confirm — the change is already live (e.g. free STARTER).
        await refetch({ silent: true })
        if (mountedRef.current) {
          setActionNotice('accountPolish.checkoutNotRequiredPlanActivated')
        }
        return session
      }),
    [navigate, refetch, runAction],
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
    setActionNotice(null)
  }, [])

  const hasBackendPlans = backendPlans.length > 0
  const plans = hasBackendPlans ? backendPlans : BILLING_PLANS
  const isPlaceholderCatalogue = !hasBackendPlans
  const hasSubscription = Boolean(overview)
  /**
   * Selecting a plan only needs the backend's own catalogue — a subscription
   * must not be a precondition for buying one. When no catalogue is served
   * (backend down or nothing published) the cards are the frontend placeholder
   * and stay unselectable.
   */
  const canManageBilling = !backendUnavailable && hasBackendPlans
  /** Cancel, resume and the portal still require a real subscription to manage. */
  const canManageSubscription = hasSubscription && !backendUnavailable

  // The toggle starts on whatever the backend says the account is billed on,
  // and the customer's choice wins afterwards.
  const cycle = requestedCycle ?? getToggleableCycle(overview?.cycle)
  const currentPlan = useMemo(() => {
    if (overview?.planId) {
      // `planId` may be a numeric id or a code (`STARTER`/`PRO`/`AGENCY`).
      return plans.find((plan) => matchesPlanIdentifier(plan, overview.planId)) ?? null
    }
    if (!overview && hasBackendPlans) {
      // No subscription reported: the account sits on the free tier — display
      // only, so the badge and plan relations have something real to compare
      // against while `hasSubscription` and every action stay untouched.
      return plans.find((plan) => matchesPlanIdentifier(plan, FREE_PLAN_CODE)) ?? null
    }
    return null
  }, [overview, hasBackendPlans, plans])
  const actions = useMemo(() => getSubscriptionActions(overview), [overview])

  return {
    overview,
    plans,
    isPlaceholderCatalogue,
    paymentMethods,
    invoices,
    hasSubscription,
    hasBackendPlans,
    canManageBilling,
    canManageSubscription,
    isLoading,
    loadError,
    backendUnavailable,
    actionError,
    actionNotice,
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
