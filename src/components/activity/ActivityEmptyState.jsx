import { History } from 'lucide-react'
import useTranslation from '@/hooks/useTranslation'

/**
 * Shown when a scope has no events to display.
 *
 * There is deliberately no sample trail. A demo entry — "Ali published the homepage"
 * at a plausible timestamp — would be indistinguishable from a real one once it is
 * on screen, and an activity log's entire value is that every line in it happened.
 * So the list is empty, and the page says which of the two empty states it is:
 * nothing has been recorded, or the filters exclude everything that was.
 *
 * `isUnavailable` separates the case where there is no backend to read from, which
 * is not the same claim as "nothing happened".
 */
function ActivityEmptyState({ isFiltered = false, isUnavailable = false }) {
  const { t } = useTranslation()

  const titleKey = isUnavailable
    ? 'workspaceActivity.empty.unavailableTitle'
    : isFiltered
      ? 'workspaceActivity.empty.filteredTitle'
      : 'workspaceActivity.empty.title'

  const textKey = isUnavailable
    ? 'workspaceActivity.empty.unavailableText'
    : isFiltered
      ? 'workspaceActivity.empty.filteredText'
      : 'workspaceActivity.empty.text'

  return (
    <div className="act-empty">
      <span className="act-empty__icon" aria-hidden="true">
        <History size={20} />
      </span>

      <h3 className="act-empty__title">{t(titleKey)}</h3>
      <p className="act-empty__text">{t(textKey)}</p>
    </div>
  )
}

export default ActivityEmptyState
