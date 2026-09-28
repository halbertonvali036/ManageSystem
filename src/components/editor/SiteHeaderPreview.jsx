import { Menu, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import useTranslation from '@/hooks/useTranslation'
import { getHomePage, getMenuItemTarget, getMenuItemText, getVisibleMenuItems } from '@/models/siteEditor'
import { MENU_ITEM_TYPE } from '@/models/siteNavigation'

/**
 * The site header, drawn from the draft menu.
 *
 * This is a preview, not a page. There is no router in this project, so a menu
 * item is drawn as a link with the address it will eventually have, and clicking
 * one moves the canvas to that page instead of navigating. An external link is
 * inert: sending a visitor away from a preview to an address that may not exist
 * yet would be the preview pretending the site is live.
 *
 * The mobile menu is a disclosure with `aria-expanded` and `aria-controls`, and it
 * closes on Escape. It resets when the device or the preview mode changes, because
 * an open menu carried into a desktop preview would be a menu that covers the page
 * the user just asked to see.
 *
 * The prop is `siteDocument` and not `document` on purpose: a prop called
 * `document` shadows the global of the same name, and the Escape handler below
 * needs the real one.
 */
function SiteHeaderPreview({ siteDocument, device, isPreview, onNavigatePage }) {
  const { t } = useTranslation()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const isNarrow = device !== 'desktop'
  const items = getVisibleMenuItems(siteDocument)
  const home = getHomePage(siteDocument)

  // Adjusting state during render rather than in an effect: the open menu belongs
  // to one device view, and a device change is the event that ends it.
  const [lastView, setLastView] = useState(`${device}:${isPreview ? 'preview' : 'edit'}`)
  const view = `${device}:${isPreview ? 'preview' : 'edit'}`
  if (view !== lastView) {
    setLastView(view)
    setIsMenuOpen(false)
  }

  useEffect(() => {
    if (!isMenuOpen) {
      return undefined
    }
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsMenuOpen(false)
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isMenuOpen])

  const handleClick = (event, item) => {
    // A preview is not a page, so the link is real but its default is not taken.
    event.preventDefault()
    if (item.type === MENU_ITEM_TYPE.PAGE) {
      setIsMenuOpen(false)
      onNavigatePage(item.pageId)
    }
  }

  /**
   * The text a link shows.
   *
   * A page item borrows its page name from the model. An external item has no
   * page to borrow from, so an empty label would render a link with no words in
   * it; the address it points at is the honest thing to show in that case.
   */
  const textFor = (item) => {
    const label = getMenuItemText(siteDocument, item)
    return label || item.url || t('editor.nav.unlabelled')
  }

  return (
    <header className="editor-site-header" data-device={device}>
      <div className="editor-site-header__bar">
        <p className="editor-site-header__name">{home?.name ?? ''}</p>

        {isNarrow ? (
          <button
            type="button"
            className="editor-icon-button editor-site-header__toggle"
            aria-expanded={isMenuOpen}
            aria-controls="editor-site-menu"
            aria-label={t(isMenuOpen ? 'editor.nav.closeMenu' : 'editor.nav.openMenu')}
            onClick={() => setIsMenuOpen((current) => !current)}
          >
            {isMenuOpen ? <X size={16} aria-hidden="true" /> : <Menu size={16} aria-hidden="true" />}
          </button>
        ) : (
          <nav className="editor-site-header__nav" aria-label={t('editor.nav.title')}>
            {items.map((item) => (
              <a
                key={item.id}
                className="editor-site-header__link"
                href={getMenuItemTarget(siteDocument, item) ?? '#'}
                aria-current={item.pageId === siteDocument.activePageId ? 'page' : undefined}
                onClick={(event) => handleClick(event, item)}
              >
                {textFor(item)}
              </a>
            ))}
          </nav>
        )}
      </div>

      {isNarrow && isMenuOpen ? (
        <nav
          className="editor-site-header__drawer"
          id="editor-site-menu"
          aria-label={t('editor.nav.title')}
        >
          {items.length ? (
            items.map((item) => (
              <a
                key={item.id}
                className="editor-site-header__link"
                href={getMenuItemTarget(siteDocument, item) ?? '#'}
                aria-current={item.pageId === siteDocument.activePageId ? 'page' : undefined}
                onClick={(event) => handleClick(event, item)}
              >
                {textFor(item)}
              </a>
            ))
          ) : (
            <p className="editor-site-header__empty">{t('editor.nav.empty')}</p>
          )}
        </nav>
      ) : null}

      {!items.length ? (
        <p className="editor-site-header__note">{t('editor.nav.previewEmpty')}</p>
      ) : null}
    </header>
  )
}

export default SiteHeaderPreview
