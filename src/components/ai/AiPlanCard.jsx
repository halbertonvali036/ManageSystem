import { ArrowUpRight, Gem, TimerReset } from 'lucide-react'
import { Link } from 'react-router-dom'
import useTranslation from '@/hooks/useTranslation'
import {
  AI_PLAN_RESET_PERIOD_LABEL_KEYS,
  AI_PLAN_TIER_LABEL_KEYS,
  getAiPlan,
  getAiPlanBarPercent,
  isAiPlanDemo,
  isAiPlanLimitReached,
} from '@/models/aiPlan'
import { BILLING_PATH } from '@/utils/constants'

/**
 * Plan and usage.
 *
 * ── Where the numbers come from ────────────────────────────────────────────────
 *
 * There is no plan endpoint yet, so the card renders the declared placeholder from the
 * model and says so: a "demo" badge sits next to the figures and a line underneath says
 * they are illustrative. The alternative — a bar of green that looks measured — would
 * be the most quotable lie on the page, because a usage bar reads as an inventory check
 * and nobody re-reads the fine print under one.
 *
 * ── What the card can and cannot do ────────────────────────────────────────────
 *
 * It reports. It does not enforce: `isAiPlanLimitReached` runs on whatever numbers were
 * supplied, and with the placeholder that is never true, so the composer is never locked
 * by a figure nobody measured. The upgrade link goes to billing, which is where an
 * entitlement would actually be changed — a plan card that pretended to upgrade someone
 * would be a second, fictional billing system.
 *
 * ── A bar with no numbers draws no bar ─────────────────────────────────────────
 *
 * `used` or `limit` missing means the state is unknown, and an unknown state is written
 * in words. A bar reading 0% would assert that nothing has been used, which is a
 * different and much rarer claim than "we do not know".
 */
function AiPlanCard({ payload = null }) {
  const { t } = useTranslation()

  const plan = getAiPlan(payload)
  const isDemo = isAiPlanDemo(plan)
  const isLimitReached = isAiPlanLimitReached(plan)
  const percent = getAiPlanBarPercent(plan)
  const hasUsage = typeof plan.used === 'number' && typeof plan.limit === 'number'

  const tierKey = AI_PLAN_TIER_LABEL_KEYS[plan.tier]
  const resetKey = plan.resetPeriod ? AI_PLAN_RESET_PERIOD_LABEL_KEYS[plan.resetPeriod] : null

  return (
    <section className="ai-plan" aria-labelledby="ai-plan-title">
      <header className="ai-plan__head">
        <span className="ai-plan__icon" aria-hidden="true">
          <Gem size={15} />
        </span>

        <div className="ai-plan__titles">
          <h2 className="ai-plan__title" id="ai-plan-title">
            {t('aiAssistant.plan.title')}
          </h2>
          <p className="ai-plan__tier">{tierKey ? t(tierKey) : plan.tier}</p>
        </div>

        {isDemo ? <span className="ai-plan__demo">{t('aiAssistant.plan.demoBadge')}</span> : null}
      </header>

      <div className="ai-plan__usage">
        <div className="ai-plan__usage-row">
          <span className="ai-plan__usage-label">{t('aiAssistant.plan.usageLabel')}</span>

          {hasUsage ? (
            <span className="ai-plan__usage-count">
              {t('aiAssistant.plan.usage', { used: plan.used, limit: plan.limit })}
            </span>
          ) : (
            <span className="ai-plan__usage-count ai-plan__usage-count--unknown">
              {t('aiAssistant.plan.noUsage')}
            </span>
          )}
        </div>

        {/* A measured bar only when both numbers exist. Unknown draws words, not a bar
            sitting at zero — "no usage" and "usage unknown" are different facts. */}
        {percent !== null ? (
          <div
            className={[
              'ai-plan__bar',
              isLimitReached ? 'ai-plan__bar--full' : '',
            ]
              .filter(Boolean)
              .join(' ')}
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={plan.limit}
            aria-valuenow={plan.used}
            aria-label={t('aiAssistant.plan.usageLabel')}
          >
            <span className="ai-plan__bar-fill" style={{ width: `${percent}%` }} />
          </div>
        ) : null}

        {resetKey ? (
          <p className="ai-plan__reset">
            <TimerReset size={12} aria-hidden="true" />
            {t('aiAssistant.plan.resets', { period: t(resetKey) })}
          </p>
        ) : null}
      </div>

      {isLimitReached ? (
        <p className="ai-plan__limit" role="status">
          {t('aiAssistant.plan.limitReached')}
        </p>
      ) : null}

      <Link className="btn btn--outline ai-plan__upgrade" to={BILLING_PATH}>
        {t('aiAssistant.plan.upgrade')}
        <ArrowUpRight size={14} aria-hidden="true" />
      </Link>

      {isDemo ? <p className="ai-plan__note">{t('aiAssistant.plan.demoNote')}</p> : null}
    </section>
  )
}

export default AiPlanCard
