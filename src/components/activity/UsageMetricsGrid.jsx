import {
  Boxes,
  Cloud,
  Database,
  Gauge,
  Globe,
  HardDrive,
  Users,
  Zap,
} from 'lucide-react'
import useTranslation from '@/hooks/useTranslation'
import {
  USAGE_METRICS,
  USAGE_METRIC_ICONS,
  USAGE_METRIC_LABEL_KEYS,
  USAGE_STATE,
  formatUsageLimit,
  formatUsagePercent,
  formatUsageValue,
  getUsageBarPercent,
  getUsageMetric,
  getUsageState,
} from '@/models/usage'

const METRIC_ICONS = {
  websites: Globe,
  storage: HardDrive,
  databaseRecords: Database,
  members: Users,
  deployments: Cloud,
  bandwidth: Gauge,
  apiRequests: Zap,
}

/**
 * One usage tile.
 *
 * The tile has three shapes and no fourth:
 *
 *   reported     value + plan limit + a bar at the real ratio
 *   over limit   the same, marked as exceeded, with a number above 100%
 *   unavailable  no number, no bar, no "0"
 *
 * The third is the one that takes discipline. `formatUsageValue` and
 * `getUsageBarPercent` both return null for a missing measurement precisely so that
 * this component has nothing to render but the word "unavailable" — there is no
 * branch here that can turn an absent number into a zero.
 */
function UsageMetricTile({ metric, usage, limits }) {
  const { t, locale } = useTranslation()

  const reading = getUsageMetric(usage, metric, limits)
  const Icon = METRIC_ICONS[USAGE_METRIC_ICONS[metric]] ?? Boxes

  const { value, limit, unit } = reading
  const state = getUsageState(value, limit)

  const displayValue = formatUsageValue(value, unit, locale)
  const displayLimit = formatUsageLimit(limit, unit, locale)
  const percent = formatUsagePercent(value, limit, locale)
  const barPercent = getUsageBarPercent(value, limit)

  const isUnavailable = state === USAGE_STATE.UNAVAILABLE
  const isOverLimit = state === USAGE_STATE.OVER_LIMIT

  return (
    <article
      className={[
        'usage-tile',
        isUnavailable ? 'usage-tile--unavailable' : '',
        isOverLimit ? 'usage-tile--over' : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <header className="usage-tile__head">
        <span className="usage-tile__icon" aria-hidden="true">
          <Icon size={16} />
        </span>
        <h3 className="usage-tile__label">{t(USAGE_METRIC_LABEL_KEYS[metric])}</h3>
      </header>

      {isUnavailable ? (
        <>
          <p className="usage-tile__value usage-tile__value--missing" aria-hidden="true">
            —
          </p>
          <p className="usage-tile__state">
            {reading.isPending
              ? t('workspaceActivity.usage.pending')
              : t('workspaceActivity.usage.unavailable')}
          </p>
        </>
      ) : (
        <>
          <p className="usage-tile__value">{displayValue}</p>

          <p className="usage-tile__limit">
            {limit === null ? (
              t('workspaceActivity.usage.noLimit')
            ) : (
              t('workspaceActivity.usage.ofLimit', { limit: displayLimit })
            )}
          </p>

          {/* The bar exists only when both operands are real, so it can never be an
              empty track that reads as "0% used". */}
          {barPercent !== null ? (
            <div
              className="usage-tile__bar"
              role="img"
              aria-label={t('workspaceActivity.usage.percentLabel', {
                percent,
                metric: t(USAGE_METRIC_LABEL_KEYS[metric]),
              })}
            >
              <span
                className="usage-tile__bar-fill"
                style={{ width: `${barPercent}%` }}
              />
            </div>
          ) : null}

          {isOverLimit ? (
            <p className="usage-tile__over">{t('workspaceActivity.usage.overLimit')}</p>
          ) : null}
        </>
      )}
    </article>
  )
}

/**
 * The usage grid.
 *
 * Every declared metric gets a tile, including the two the backend does not report
 * yet: they are shown as unavailable with honest copy rather than hidden, so the
 * shape of what will be measurable is visible without pretending any of it is
 * currently measured.
 */
function UsageMetricsGrid({ usage, limits }) {
  const { t } = useTranslation()

  return (
    <section className="usage" aria-labelledby="workspace-activity-usage-title">
      <div className="usage__head">
        <h2 className="card__title" id="workspace-activity-usage-title">
          {t('workspaceActivity.usage.title')}
        </h2>
        <p className="usage__description">{t('workspaceActivity.usage.description')}</p>
      </div>

      <div className="usage__grid">
        {USAGE_METRICS.map((metric) => (
          <UsageMetricTile key={metric} metric={metric} usage={usage} limits={limits} />
        ))}
      </div>
    </section>
  )
}

export default UsageMetricsGrid
