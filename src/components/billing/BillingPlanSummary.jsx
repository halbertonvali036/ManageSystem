import useAccountCopy from '@/hooks/useAccountCopy'
import useTranslation from '@/hooks/useTranslation'
import { CalendarClock, CreditCard, RefreshCw, Sparkles } from 'lucide-react'
import BillingNotice from '@/components/billing/BillingNotice'
import BillingSection from '@/components/billing/BillingSection'
import BillingStatusBadge from '@/components/billing/BillingStatusBadge'
import {
  formatBillingAmount,
  formatBillingDate,
  getBillingCycleLabel,
} from '@/models/billing'
import { BILLING_CYCLE_PENDING_LABEL } from '@/config/billing'

const UNAVAILABLE_LABEL = 'Unavailable'

const PlanValue = ({ label, children, unavailableHint }) => {
  const copy = useAccountCopy()
  const isUnavailable = children === null || children === undefined || children === ''

  return (
    <div className="plan-summary__field">
      <dt className="plan-summary__label">{label}</dt>
      <dd className="plan-summary__value">
        {isUnavailable ? (
          <span className="plan-summary__unavailable">{copy(UNAVAILABLE_LABEL)}</span>
        ) : (
          children
        )}
        {isUnavailable && unavailableHint ? (
          <span className="plan-summary__hint">{unavailableHint}</span>
        ) : null}
      </dd>
    </div>
  )
}

/**
 * Premium summary of the signed-in account's current plan.
 * Values render only when the backend reports them; otherwise each field
 * shows an explicit unavailable state and no subscription is implied.
 */
function BillingPlanSummary({
  overview,
  canManageBilling,
  pendingAction,
  actionError,
  onManageSubscription,
}) {
  const copy = useAccountCopy()
  const { t } = useTranslation()
  const planName = overview?.planName ?? null
  const cycle = overview?.cycle ?? null
  const amount = formatBillingAmount(overview?.price, overview?.currency)
  const renewsAt = formatBillingDate(overview?.renewsAt)
  const trialEndsAt = formatBillingDate(overview?.trialEndsAt)

  return (
    <BillingSection
      id="current-plan"
      className="plan-summary"
      eyebrow={t('accountPolish.currentPlan')}
      title={planName ?? copy('No plan details yet')}
      description={
        planName
          ? copy('Your subscription, billing cycle and renewal date for this account.')
          : copy('Your plan, billing cycle and renewal date appear here once the billing backend is connected.')
      }
      icon={<Sparkles size={20} aria-hidden="true" />}
      action={<BillingStatusBadge status={overview?.status ?? null} />}
    >
      <div className="plan-summary__grid">
        <dl className="plan-summary__fields">
          <PlanValue label={t('accountPolish.plan')} unavailableHint={copy("Reported by the backend")}>
            {planName}
          </PlanValue>
          <PlanValue label={t('accountPolish.billingStatus')} unavailableHint={copy("No status reported")}>
            <BillingStatusBadge status={overview?.status ?? null} />
          </PlanValue>
          <PlanValue label={t('accountPolish.billingCycle')} unavailableHint={copy("No cycle reported")}>
            {cycle ? getBillingCycleLabel(cycle) : BILLING_CYCLE_PENDING_LABEL}
          </PlanValue>
          <PlanValue label={t('accountPolish.nextRenewal')} unavailableHint={copy("No renewal date reported")}>
            {renewsAt}
          </PlanValue>
          {overview?.trialEndsAt ? (
            <PlanValue label={t('accountPolish.trialEnds')}>{trialEndsAt}</PlanValue>
          ) : null}
          <PlanValue
            label={t('accountPolish.price')}
            unavailableHint={copy("No amount reported by the backend")}
          >
            {amount}
          </PlanValue>
        </dl>

        <div className="plan-summary__aside">
          <p className="plan-summary__aside-label">{t('accountPolish.planChanges')}</p>
          <ul className="plan-summary__actions">
            <li>
              <a
                className="btn btn--primary btn--icon-left plan-summary__action"
                href="#billing-plans"
              >
                <RefreshCw size={16} aria-hidden="true" />{t('accountPolish.changePlan')}</a>
            </li>
            <li>
              <button
                type="button"
                className="btn btn--icon-left plan-summary__action"
                disabled={!canManageBilling}
                aria-disabled={!canManageBilling}
                onClick={onManageSubscription}
                title={
                  canManageBilling
                    ? copy('Open the secure billing portal')
                    : copy('Available once the billing portal is connected')
                }
              >
                <CreditCard size={16} aria-hidden="true" />
                {pendingAction === 'portal' ? copy('Opening…') : copy('Manage subscription')}
              </button>
            </li>
          </ul>
          <p className="plan-summary__aside-note">
            <CalendarClock size={14} aria-hidden="true" />{t('accountPolish.upgradesDowngradesAndCancellationsAreHandledInTheSecure')}</p>
        </div>
      </div>

      {!canManageBilling ? (
        <BillingNotice tone="pending" title={t('accountPolish.integrationPending')} className="plan-summary__notice">{t('accountPolish.subscriptionManagementBecomesAvailableOnceTheBillingBackendAnd')}</BillingNotice>
      ) : null}

      {actionError ? (
        <div className="alert alert--error plan-summary__notice" role="alert">
          {actionError}
        </div>
      ) : null}
    </BillingSection>
  )
}

export default BillingPlanSummary
