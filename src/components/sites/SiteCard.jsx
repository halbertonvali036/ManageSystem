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
import useTranslation from '@/hooks/useTranslation'
import { formatSiteDate, getSiteAddress, getSiteAddressLabel } from '@/models/site'
import { SITE_DETAILS_PATH } from '@/utils/constants'

/**
 * Future project actions.
 *
 * The action set is declared now so the card can present the real vocabulary of
 * a website workspace, but every entry except Open is disabled and the menu
 * states once that they are not connected. None of them mutate local state, so a
 * click can never look like it renamed, duplicated, archived, deleted or
 * published anything.
 */
const ACTIONS = [
  { key: 'open', icon: Pencil, to: true },
  { key: 'preview', icon: ExternalLink },
  { key: 'rename', icon: Pencil },
  { key: 'duplicate', icon: Copy },
  { key: 'archive', icon: Archive },
  { key: 'publish', icon: Send },
  { key: 'delete', icon: Trash2, destructive: true },
]

function SiteThumbnail({ src, name }) {
  /*
   * The failed URL is remembered rather than a boolean, so a project that
   * receives a new thumbnail retries on its own instead of staying blank until
   * the page is reloaded. No effect is needed to reset the state.
   */
  const [failedSrc, setFailedSrc] = useState(null)
  const hasFailed = src !== null && failedSrc === src

  if (!src || hasFailed) {
    return (
      <div className="site-card__thumb site-card__thumb--placeholder" aria-hidden="true">
        <span className="site-card__thumb-initial">
          {(name?.trim()?.[0] ?? '?').toUpperCase()}
        </span>
      </div>
    )
  }

  return (
    <img
      className="site-card__thumb"
      src={src}
      alt=""
      loading="lazy"
      decoding="async"
      onError={() => setFailedSrc(src)}
    />
  )
}

/**
 * Project card.
 *
 * A single `<article>` per project. The whole card is not a link, because it
 * also hosts an actions menu; the name is the primary link and the actions are
 * real buttons, so keyboard and screen-reader users reach every control without
 * the card swallowing clicks.
 */
function SiteCard({ site }) {
  const { t, locale } = useTranslation()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const menuId = useId()
  const noteId = useId()
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
        <SiteThumbnail src={site.thumbnailUrl} name={site.name} />
        <span className="site-card__status">
          <SiteStatusBadge status={site.status} />
        </span>
      </div>

      <div className="site-card__body">
        <h3 className="site-card__name">
          {projectHref ? (
            <Link to={projectHref} className="site-card__link">
              {site.name}
            </Link>
          ) : (
            site.name
          )}
        </h3>

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
              <p className="visually-hidden" id={noteId}>
                {t('sites.actionPending')}
              </p>
              <div
                id={menuId}
                className="site-card__menu-list"
                role="menu"
                aria-label={t('sites.projectActions')}
                aria-describedby={noteId}
              >
                {ACTIONS.map(({ key, icon: Icon, to, destructive }) => {
                  const label = t(`sites.action.${key}`)
                  if (to && projectHref) {
                    return (
                      <Link
                        key={key}
                        to={projectHref}
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
                      className={`site-card__menu-item site-card__menu-item--disabled${
                        destructive ? ' site-card__menu-item--destructive' : ''
                      }`}
                      disabled
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
    </article>
  )
}

export default SiteCard
