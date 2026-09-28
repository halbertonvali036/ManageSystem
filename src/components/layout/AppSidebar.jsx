import { Fragment, useEffect, useRef } from 'react'
import { PanelLeftClose, PanelLeftOpen, X } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import BrandLogo from '@/components/common/BrandLogo'
import useAuth from '@/hooks/useAuth'
import useMediaQuery from '@/hooks/useMediaQuery'
import useTranslation from '@/hooks/useTranslation'
import { ROLES } from '@/utils/roles'
import {
  APP_NAME,
  LEGACY_ACADEMIC_NAV_ITEMS,
  WORKSPACE_NAV_ITEMS,
} from '@/utils/constants'

/**
 * Primary navigation for the website-builder workspace.
 *
 * The default experience is the website builder. The legacy academic group is
 * rendered only for the internal admin role, and it is clearly separated from
 * the product navigation so it is never mistaken for the main product.
 */
function AppSidebar({ collapsed, mobileOpen, onToggleCollapsed, onCloseMobile }) {
  const isDesktop = useMediaQuery('(min-width: 1024px)')
  const sidebarRef = useRef(null)
  const { t } = useTranslation()
  const { user } = useAuth()

  const isAdmin = user?.role === ROLES.ADMIN
  useEffect(() => {
    if (isDesktop || !mobileOpen) return undefined
    const previousFocus = document.activeElement
    const panel = sidebarRef.current
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    panel.querySelector('button')?.focus()
    const onKey = (event) => {
      if (event.key === 'Escape') { event.preventDefault(); onCloseMobile() }
      if (event.key !== 'Tab') return
      const controls = [...panel.querySelectorAll('a[href], button:not(:disabled)')]
      const first = controls[0]
      const last = controls.at(-1)
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus() }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus() }
    }
    panel.addEventListener('keydown', onKey)
    return () => {
      panel.removeEventListener('keydown', onKey)
      document.body.style.overflow = overflow
      previousFocus?.focus()
    }
  }, [isDesktop, mobileOpen, onCloseMobile])

  const sidebarClassName = [
    'app-sidebar',
    collapsed ? 'app-sidebar--collapsed' : '',
    mobileOpen ? 'app-sidebar--open' : '',
  ]
    .filter(Boolean)
    .join(' ')

  const handleNavClick = () => {
    onCloseMobile()
  }

  const renderGroup = (items, isLegacy = false) =>
    items.map((item, index) => {
      const Icon = item.icon
      const section = item.section
      const previousSection = index === 0 ? null : items[index - 1].section
      const showSectionLabel = section && section !== previousSection
      const label = isLegacy ? item.label : t(item.labelKey)

      return (
        <Fragment key={item.key}>
          {showSectionLabel ? (
            <span className="sidebar__section-label">
              {isLegacy ? section : t(section)}
            </span>
          ) : null}
          <NavLink
            to={item.path}
            end={item.end === true}
            title={label}
            onClick={handleNavClick}
            className={({ isActive }) =>
              isActive
                ? 'sidebar__link sidebar__link--active'
                : 'sidebar__link'
            }
          >
            <Icon className="sidebar__icon" size={20} aria-hidden="true" />
            <span className="sidebar__label">{label}</span>
          </NavLink>
        </Fragment>
      )
    })

  return (
    <>
      <aside ref={sidebarRef} className={sidebarClassName} inert={!isDesktop && !mobileOpen}
        role={!isDesktop && mobileOpen ? 'dialog' : undefined}
        aria-modal={!isDesktop && mobileOpen ? true : undefined}
        aria-label={t('appShell.primaryNav')}>
        <div className="sidebar__top">
          <span className="sidebar__brand" title={APP_NAME}>
            <BrandLogo size={30} className="sidebar__brand-logo" />
            <span className="sidebar__brand-id">
              <span className="sidebar__brand-name">{APP_NAME}</span>
              <span className="sidebar__brand-role">
                {isAdmin ? t('workspace.nav.section.account') : t('common.tagline')}
              </span>
            </span>
          </span>
          {isDesktop ? (
            <button
              type="button"
              className="sidebar__collapse"
              onClick={onToggleCollapsed}
              aria-label={collapsed ? t('appShell.expandSidebar') : t('appShell.collapseSidebar')}
            >
              {collapsed ? (
                <PanelLeftOpen size={18} aria-hidden="true" />
              ) : (
                <PanelLeftClose size={18} aria-hidden="true" />
              )}
            </button>
          ) : (
            <button
              type="button"
              className="sidebar__collapse"
              onClick={onCloseMobile}
              aria-label={t('appShell.closeMenu')}
            >
              <X size={18} aria-hidden="true" />
            </button>
          )}
        </div>

        <nav className="sidebar__nav">
          {renderGroup(WORKSPACE_NAV_ITEMS)}

          {isAdmin ? (
            <>
              <span className="sidebar__section-label sidebar__section-label--legacy">
                {t('audit.internalTools')}
              </span>
              {renderGroup(LEGACY_ACADEMIC_NAV_ITEMS, true)}
            </>
          ) : null}
        </nav>
      </aside>
      {mobileOpen ? (
        <div
          className="sidebar-backdrop"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      ) : null}
    </>
  )
}

export default AppSidebar
