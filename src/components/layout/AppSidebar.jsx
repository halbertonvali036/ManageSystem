import { useEffect, useRef } from 'react'
import { LogOut, PanelLeftClose, PanelLeftOpen, X } from 'lucide-react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import BrandLogo from '@/components/common/BrandLogo'
import SidebarAmbientMesh from '@/components/common/SidebarAmbientMesh'
import useAuth from '@/hooks/useAuth'
import useMediaQuery from '@/hooks/useMediaQuery'
import useTranslation from '@/hooks/useTranslation'
import { ROLES, getRoleProfilePath } from '@/utils/roles'
import {
  ADMIN_SIDEBAR_GROUPS,
  APP_NAME,
  getUserSidebarGroups,
} from '@/utils/constants'
import {
  persistActiveWorkspaceId,
  readActiveWorkspaceId,
  readWorkspaceIdFromPath,
} from '@/utils/activeWorkspace'

/** Initials for the sidebar identity block. Falls back to a neutral glyph. */
const getInitials = (name) =>
  (name ?? '')
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase()

/**
 * The single navigation surface for the signed-in application.
 *
 * Two groups, in a fixed order: what the person came here to do, then who they
 * are. The pinned footer closes the rail with the two things that belong to the
 * person rather than to the product: their own profile, and the one action that
 * ends the session. Nothing account-related is duplicated in the topbar, so every
 * destination — profile included — has exactly one home.
 *
 * The groups come from `utils/constants` rather than from JSX so the product
 * navigation and the labels the topbar and breadcrumbs use are one model, and the
 * workspace-scoped links follow whichever workspace is currently open.
 */
function AppSidebar({ collapsed, mobileOpen, onToggleCollapsed, onCloseMobile }) {
  const isDesktop = useMediaQuery('(min-width: 1024px)')
  const sidebarRef = useRef(null)
  const { t } = useTranslation()
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const { pathname } = useLocation()

  const isAdmin = user?.role === ROLES.ADMIN
  const inAdmin = isAdmin && (pathname === '/admin' || pathname.startsWith('/admin/'))
  const workspaceId = readActiveWorkspaceId(pathname)
  const groups = isAdmin ? ADMIN_SIDEBAR_GROUPS : getUserSidebarGroups(workspaceId)

  // Remember the workspace the person opened so the workspace-scoped product
  // links keep pointing at it after they step back out to the workspace list.
  useEffect(() => {
    const fromPath = readWorkspaceIdFromPath(pathname)
    if (fromPath) {
      persistActiveWorkspaceId(fromPath)
    }
  }, [pathname])

  // A decorative field this large should not keep compositing behind a
  // minimised tab. Pausing is pure CSS reacting to one attribute, so there is no
  // timer and no state update when the tab changes.
  useEffect(() => {
    const root = document.documentElement
    const sync = () => {
      root.dataset.sidebarMesh = document.hidden ? 'idle' : 'active'
    }
    sync()
    document.addEventListener('visibilitychange', sync)
    return () => {
      document.removeEventListener('visibilitychange', sync)
      delete root.dataset.sidebarMesh
    }
  }, [])

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

  const displayName = user?.name?.trim() || t('accountIdentity.defaultName')
  const roleLabel = isAdmin ? t('admin.roles.admin') : t('accountIdentity.accountRole')
  const profilePath = getRoleProfilePath(user?.role)
  const profileLabel = t('accountIdentity.profileFor', { name: displayName })

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

const renderItem = ({ key, labelKey, path, icon: Icon, end }) => {
    const label = t(labelKey)

    return (
      <NavLink
        key={key}
        to={path}
        end={end === true}
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
    )
  }

  return (
    <>
      <aside ref={sidebarRef} className={sidebarClassName} inert={!isDesktop && !mobileOpen}
        role={!isDesktop && mobileOpen ? 'dialog' : undefined}
        aria-modal={!isDesktop && mobileOpen ? true : undefined}
        aria-label={t('appShell.primaryNav')}>
        <SidebarAmbientMesh collapsed={collapsed} variant={isAdmin ? 'admin' : 'user'} />
        <div className="sidebar__top">
          <span className="sidebar__brand" title={APP_NAME}>
            <BrandLogo size={30} className="sidebar__brand-logo" />
            <span className="sidebar__brand-id">
              <span className="sidebar__brand-name">{APP_NAME}</span>
              <span className="sidebar__brand-role">
                {inAdmin ? t('admin.console') : t('common.tagline')}
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

        <nav className="sidebar__nav" aria-label={t('appShell.primaryNav')}>
          {groups.map((group) => (
            <div className="sidebar__group" key={group.key}>
              {group.action ? (
                <Link
                  to={group.action.path}
                  className="sidebar__action"
                  onClick={handleNavClick}
                >
                  <group.action.icon size={18} aria-hidden="true" />
                  <span className="sidebar__action-label">{t(group.action.labelKey)}</span>
                </Link>
              ) : null}
              <span className="sidebar__section-label">{t(group.labelKey)}</span>
              {group.items.map(renderItem)}
            </div>
          ))}
        </nav>

        {/* Identity and sign-out share a pinned footer: who you are, then the one
            action that ends the session. Both are account destinations, so the
            footer is the only place either of them lives — the topbar carries no
            second copy of the profile control. */}
        <div className="sidebar__footer">
          <NavLink
            to={profilePath}
            className={({ isActive }) =>
              isActive
                ? 'sidebar__identity sidebar__identity--active'
                : 'sidebar__identity'
            }
            title={profileLabel}
            aria-label={profileLabel}
            onClick={handleNavClick}
          >
            <span className="sidebar__avatar" aria-hidden="true">
              {getInitials(displayName)}
            </span>
            <span className="sidebar__identity-text">
              <span className="sidebar__identity-name">{displayName}</span>
              <span className="sidebar__identity-role">{roleLabel}</span>
            </span>
          </NavLink>
          <button
            type="button"
            className="sidebar__link sidebar__link--logout"
            onClick={handleLogout}
            title={t('accountIdentity.logout')}
          >
            <LogOut className="sidebar__icon" size={20} aria-hidden="true" />
            <span className="sidebar__label">{t('accountIdentity.logout')}</span>
          </button>
        </div>
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
