import useTranslation from '@/hooks/useTranslation'
import { findPageTitleKey } from '@/models/navigation'

/**
 * The current page's name, for the topbar.
 *
 * Naming the route in the topbar is what lets the in-page heading be a real
 * heading: a page can then say what it is *about* in its own words, and the
 * place you are stays visible while the page says the specific thing. The
 * resolution lives in `models/navigation` so this can never disagree with the
 * sidebar label for the same route.
 */
function PageTitle({ pathname }) {
  const { t } = useTranslation()
  const titleKey = findPageTitleKey(pathname)

  if (!titleKey) {
    return null
  }

  return (
    <span className="app-header__title">{t(titleKey)}</span>
  )
}

export default PageTitle
