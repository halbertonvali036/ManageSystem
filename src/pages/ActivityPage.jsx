import { Activity, ShieldCheck } from 'lucide-react'
import useTranslation from '@/hooks/useTranslation'
import useActivity from '@/hooks/useActivity'
import { ACTIVITY_SCOPE } from '@/models/activity'
import Card from '@/components/common/Card'
import ActivityRow from '@/components/activity/ActivityRow'
import ActivityFilters from '@/components/activity/ActivityFilters'
import ActivityEmptyState from '@/components/activity/ActivityEmptyState'
import UsageMetricsGrid from '@/components/activity/UsageMetricsGrid'
import UsageLimitsPanel from '@/components/activity/UsageLimitsPanel'

/**
 * Activity — `Fəaliyyət`.
 *
 * Three things, in the order an operator asks for them: what happened
 * (`Hadisələr`), how much is being consumed (`İstifadə`), and how much of the plan is
 * left (`Limitlər`).
 *
 * This page is read-only, and that is a property of the data rather than of the
 * layout. There is no action that writes an event, and none that would let a browser
 * record one: an activity trail the client can extend is not a record of what
 * happened, it is a note-taking box next to one.
 *
 * The one thing this page refuses to do is fill a gap. With no backend the trail is
 * empty and every usage tile reads "unavailable". There is no sample event, no
 * estimated figure and no 0% — an activity page that cannot be trusted about what
 * happened is worse than no activity page, because it is trusted anyway.
 */
function ActivityPage() {
  const { t } = useTranslation()

  const {
    visibleEvents,
    actors,
    usage,
    limits,
    isLoading,
    error,
    isUnavailable,
    type,
    setType,
    actorId,
    setActorId,
    query,
    setQuery,
    from,
    setFrom,
    to,
    setTo,
    isFiltered,
    clearFilters,
    refetch,
  } = useActivity(null, { scope: ACTIVITY_SCOPE.PLATFORM })

  const filters = { type, actorId, query, from, to }

  /**
   * One handler for every filter, so the controls stay dumb and the filter state
   * lives in exactly one place. Filters narrow what is loaded; none of them refetches.
   */
  const handleFilterChange = (key, value) => {
    if (key === 'type') setType(value)
    else if (key === 'actorId') setActorId(value)
    else if (key === 'query') setQuery(value)
    else if (key === 'from') setFrom(value)
    else if (key === 'to') setTo(value)
  }

  return (
    <div className="sites-page act-page">
      <header className="sites-page__head">
        <div className="sites-page__headline">
          <h1 className="sites-page__title">
            <Activity size={22} aria-hidden="true" />
            {t('workspaceActivity.pageTitle')}
          </h1>
          <p className="page-description">{t('workspaceActivity.pageDescription')}</p>
        </div>
      </header>

      <p className="act-page__notice">
        <ShieldCheck size={14} aria-hidden="true" />
        {t('workspaceActivity.notice')}
      </p>

      <Card>
        <UsageMetricsGrid usage={usage} limits={limits} />
      </Card>

      <Card>
        <UsageLimitsPanel usage={usage} limits={limits} />
      </Card>

      <section className="act-events" aria-labelledby="workspace-activity-events-title">
        <div className="act-events__head">
          <h2 className="card__title" id="workspace-activity-events-title">
            {t('workspaceActivity.events.title')}
          </h2>
          <p className="act-events__description">{t('workspaceActivity.events.description')}</p>
        </div>

        {error ? (
          <Card>
            <div className="table-state table-state--error">
              <h3 className="table-state__title">{t('workspaceActivity.loadFailed')}</h3>
              <p className="table-state__text">{t('workspaceActivity.loadFailedText')}</p>
              <button type="button" className="btn btn--primary" onClick={refetch}>
                {t('common.retry')}
              </button>
            </div>
          </Card>
        ) : isLoading ? (
          <Card>
            <div className="page-status">
              <span className="spinner" aria-hidden="true" />
              {t('workspaceActivity.loading')}
            </div>
          </Card>
        ) : (
          <>
            <ActivityFilters
              actors={actors}
              filters={filters}
              isFiltered={isFiltered}
              onFilterChange={handleFilterChange}
              onClear={clearFilters}
            />

            {visibleEvents.length === 0 ? (
              <Card>
                <ActivityEmptyState isFiltered={isFiltered} isUnavailable={isUnavailable} />
              </Card>
            ) : (
              <ul className="act-list">
                {visibleEvents.map((event) => (
                  <ActivityRow key={event.id} event={event} />
                ))}
              </ul>
            )}
          </>
        )}
      </section>
    </div>
  )
}

export default ActivityPage
