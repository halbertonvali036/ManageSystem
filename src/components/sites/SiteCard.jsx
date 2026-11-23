import { useEffect, useId, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Archive,
  Copy,
  ExternalLink,
  MoreVertical,
  Pencil,
  Send,
  Trash2,
} from 'lucide-react'
import SiteStatusBadge from '@/components/sites/SiteStatusBadge'
import SiteActionDialog from '@/components/sites/SiteActionDialog'
import SiteThumbnail from '@/components/sites/SiteThumbnail'
import useTranslation from '@/hooks/useTranslation'
import { formatSiteDate, getSiteAddress, getSiteAddressLabel } from '@/models/site'
import { SITE_DETAILS_PATH, SITE_EDITOR_PATH } from '@/utils/constants'

/** Navigation and persisted project actions. */
const ACTIONS = [
  { key: 'open', icon: Pencil, to: true },
  { key: 'preview', icon: ExternalLink },
  { key: 'rename', icon: Pencil },
  { key: 'duplicate', icon: Copy },
  { key: 'archive', icon: Archive },
  { key: 'publish', icon: Send },
  { key: 'delete', icon: Trash2, destructive: true },
]

/**
 * Project card.
 *
 * A single `<article>` per project. The whole card is not a link, because it
 * also hosts an actions menu; the name is the primary link and the actions are
 * real buttons, so keyboard and screen-reader users reach every control without
 * the card swallowing clicks.
 */
function SiteCard({ site, onChanged }) {
  const { t, locale } = useTranslation()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const menuId = useId()
  const [action, setAction] = useState(null)
  const menuRef = useRef(null)
  const triggerRef = useRef(null)

  const projectHref = site.id ? SITE_DETAILS_PATH(site.id) : null
  const address = getSiteAddress(site)
  const addressLabel = getSiteAddressLabel(site)
  const updatedLabel = formatSiteDate(site.updatedAt, locale)

  const closeMenu = ({ restoreFocus = false } = {}) => {
    setIsMenuOpen(false)
    if (restoreFocus) {
      triggerRef.current?.focus()
    }
  }

  useEffect(() => {
    if (!isMenuOpen) {
      return undefined
    }

    const items = () =>
      Array.from(
        menuRef.current?.querySelectorAll('[role="menuitem"]:not([disabled])') ?? [],
      )

    // Opening the menu moves focus into it, so keyboard users are not left
    // behind on the trigger.
    items()[0]?.focus()

    const handlePointerDown = (event) => {
      if (!menuRef.current?.contains(event.target)) {
        setIsMenuOpen(false)
      }
    }

    const handleKeyDown = (event) => {
      const current = items()
      const index = current.indexOf(document.activeElement)

      if (event.key === 'Escape') {
        event.stopPropagation()
        setIsMenuOpen(false)
        triggerRef.current?.focus()
        return
      }

      if (current.length === 0) {
        return
      }

      if (event.key === 'ArrowDown') {
        event.preventDefault()
        current[(index + 1) % current.length]?.focus()
      } else if (event.key === 'ArrowUp') {
        event.preventDefault()
        current[(index - 1 + current.length) % current.length]?.focus()
      } else if (event.key === 'Home') {
        event.preventDefault()
        current[0]?.focus()
      } else if (event.key === 'End') {
        event.preventDefault()
        current[current.length - 1]?.focus()
      }
    }

    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isMenuOpen])

  return (
    <article className="site-card" data-status={site.status}>
      <div className="site-card__media">
        <SiteThumbnail key={`${site.id}:${site.updatedAt}`} site={site} />
      </div>

      <div className="site-card__body">
        <div className="site-card__heading">
          <h3 className="site-card__name">
            {projectHref ? (
              <Link to={projectHref} className="site-card__link">
                {site.name}
              </Link>
            ) : (
              site.name
            )}
          </h3>
          <SiteStatusBadge status={site.status} />
        </div>

        <p className="site-card__address">
          {address ? (
            <a
              href={address}
              target="_blank"
              rel="noreferrer noopener"
              className="site-card__address-link"
            >
              {addressLabel}
              <ExternalLink size={12} aria-hidden="true" />
            </a>
          ) : (
            <span className="site-card__address-draft">{addressLabel}</span>
          )}
        </p>

        <p className="site-card__meta">
          {t('sites.updatedLabel')}
          <span className="site-card__meta-value">
            {updatedLabel ?? t('sites.notYet')}
          </span>
        </p>
      </div>

      <div className="site-card__footer">
        {projectHref ? (
          <Link to={projectHref} className="btn btn--ghost site-card__open">
            {t('sites.openSite')}
          </Link>
        ) : null}

        <div className="site-card__menu" ref={menuRef}>
          <button
            type="button"
            ref={triggerRef}
            className="btn btn--icon site-card__menu-trigger"
            aria-label={t('sites.actionsFor', { name: site.name })}
            aria-haspopup="menu"
            aria-expanded={isMenuOpen}
            aria-controls={isMenuOpen ? menuId : undefined}
            onClick={() => setIsMenuOpen((open) => !open)}
          >
            <MoreVertical size={17} aria-hidden="true" />
          </button>

          {isMenuOpen ? (
            <>
              <div
                id={menuId}
                className="site-card__menu-list"
                role="menu"
                aria-label={t('sites.projectActions')}
              >
                {ACTIONS.map(({ key, icon: Icon, to, destructive }) => {
                  const label = t(`sites.action.${key}`)
                  if ((to || key === 'preview') && projectHref) {
                    return (
                      <Link
                        key={key}
                        to={key === 'preview' ? `${SITE_EDITOR_PATH(site.id)}?preview=1` : projectHref}
                        role="menuitem"
                        className="site-card__menu-item"
                        onClick={closeMenu}
                      >
                        <Icon size={15} aria-hidden="true" />
                        {label}
                      </Link>
                    )
                  }
                  return (
                    <button
                      key={key}
                      type="button"
                      role="menuitem"
                      className={`site-card__menu-item${
                        destructive ? ' site-card__menu-item--destructive' : ''
                      }`}
                      disabled={!site.id}
                      onClick={() => {
                        closeMenu({ restoreFocus: true })
                        setAction(key)
                      }}
                    >
                      <Icon size={15} aria-hidden="true" />
                      {label}
                    </button>
                  )
                })}
              </div>
            </>
          ) : null}
        </div>
      </div>
      {action && <SiteActionDialog site={site} action={action} onChanged={onChanged} onClose={() => setAction(null)} />}
    </article>
  )
}

export default SiteCard
