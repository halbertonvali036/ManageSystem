import useTranslation from '@/hooks/useTranslation'
import {
  USAGE_METRICS,
  USAGE_METRIC_LABEL_KEYS,
  USAGE_STATE,
  formatUsageLimit,
  formatUsagePercent,
  formatUsageValue,
  getUsageBarPercent,
  getUsageMetric,
  getUsageState,
} from '@/models/usage'

/**
 * Usage against the plan's limits.
 *
 * This is the screen where a shortcut would do real damage: a plan panel wants a
 * row per metric with a bar and a percentage in it, and the fastest way to get there
 * is to treat a missing limit as "unlimited" and a missing usage as zero. That
 * produces a confident, entirely fictional plan summary.
 *
 * So each row is derived from `getUsageState`, and the only things this panel can
 * say are: the real figure against the real limit, or the real figure with no limit
 * set. A percentage exists only when both numbers are real. When nothing was measured
 * at all there are no rows, and the panel says the plan figures are unavailable
 * rather than drawing seven empty bars.
 *
 * A plan with no name and no limits is not shown as a plan at all — the panel states
 * that the plan is unavailable, which is what a null `limits` actually means.
 */
function UsageLimitsPanel({ usage, limits }) {
  const { t, locale } = useTranslation()

  const hasLimits = limits !== null
  const rows = USAGE_METRICS.map((metric) => {
    const reading = getUsageMetric(usage, metric, limits)
    const state = getUsageState(reading?.value ?? null, reading?.limit ?? null)
    return { metric, reading, state }
  })

  // Only metrics with a real measurement are listed. A row whose every number is
  // unknown would carry no information here, and the per-metric unavailable state is
  // already drawn in the usage grid above — repeating it seven times would bury the
  // one metric that does have a number.
  const measuredRows = rows.filter(
    ({ reading }) => reading?.value !== null && reading?.value !== undefined,
  )

  return (
    <section className="limits" aria-labelledby="workspace-activity-limits-title">
      <div className="limits__head">
        <h2 className="card__title" id="workspace-activity-limits-title">
          {t('workspaceActivity.limits.title')}
        </h2>
        <p className="limits__description">{t('workspaceActivity.limits.description')}</p>
      </div>

      {hasLimits && limits.planName ? (
        <p className="limits__plan">
          {t('workspaceActivity.limits.planLabel', { plan: limits.planName })}
        </p>
      ) : null}

      {!hasLimits && measuredRows.length === 0 ? (
        <div className="limits__unavailable">
          <p className="limits__unavailable-title">
            {t('workspaceActivity.limits.unavailableTitle')}
          </p>
          <p className="limits__unavailable-text">
            {t('workspaceActivity.limits.unavailableText')}
          </p>
        </div>
      ) : (
        <ul className="limits__list">
          {measuredRows.map(({ metric, reading, state }) => {
            const { value, limit, unit } = reading
            // Every row here has a real measurement, so the only remaining states are
            // "within the plan" and "over it".
            const isOverLimit = state === USAGE_STATE.OVER_LIMIT
            const percent = formatUsagePercent(value, limit, locale)
            const barPercent = getUsageBarPercent(value, limit)

            return (
              <li
                key={metric}
                className={`limits__row${isOverLimit ? ' limits__row--over' : ''}`}
              >
                <div className="limits__row-head">
                  <span className="limits__row-label">
                    {t(USAGE_METRIC_LABEL_KEYS[metric])}
                  </span>

                  <span className="limits__row-values">
                    <span className="limits__row-used">
                      {formatUsageValue(value, unit, locale)}
                    </span>
                    <span className="limits__row-separator" aria-hidden="true">
                      /
                    </span>
                    {limit === null ? (
                      <span className="limits__row-limit">
                        {t('workspaceActivity.limits.unlimited')}
                      </span>
                    ) : (
                      <span className="limits__row-limit">
                        {formatUsageLimit(limit, unit, locale)}
                      </span>
                    )}
                  </span>
                </div>

                {barPercent !== null ? (
                  <div
                    className="limits__bar"
                    role="img"
                    aria-label={t('workspaceActivity.usage.percentLabel', {
                      percent,
                      metric: t(USAGE_METRIC_LABEL_KEYS[metric]),
                    })}
                  >
                    <span className="limits__bar-fill" style={{ width: `${barPercent}%` }} />
                  </div>
                ) : null}

                {isOverLimit ? (
                  <p className="limits__row-over">{t('workspaceActivity.usage.overLimit')}</p>
                ) : null}
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}

export default UsageLimitsPanel
