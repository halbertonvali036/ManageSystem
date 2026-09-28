import useTranslation from '@/hooks/useTranslation'

/**
 * In-page navigation for the settings sections.
 *
 * A plain list of links to ids that exist further down the page. The links are real
 * anchors rather than click handlers that scroll by hand, so they work with
 * keyboard, middle-click and the browser's own jump behaviour for free.
 *
 * `activeId` comes from the page, which tracks it with an observer. Doing it here
 * would be tidier, but the page is the only place that knows where the sections
 * are and when they mount.
 */
function SettingsSectionNav({ sections, activeId }) {
  const { t } = useTranslation()

  return (
    <nav className="settings-nav" aria-label={t('siteSettings.nav.label')}>
      <ul className="settings-nav__list">
        {sections.map(({ id, labelKey }) => (
          <li key={id}>
            <a
              className={`settings-nav__link${activeId === id ? ' is-active' : ''}`}
              href={`#${id}`}
              aria-current={activeId === id ? 'true' : undefined}
            >
              {t(labelKey)}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}

export default SettingsSectionNav
