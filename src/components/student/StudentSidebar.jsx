import { Fragment } from 'react'
import { PanelLeftClose, PanelLeftOpen, X } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import BrandLogo from '@/components/common/BrandLogo'
import useMediaQuery from '@/hooks/useMediaQuery'
import {
  STUDENT_NAV_ITEMS,
  STUDENT_PORTAL_LABEL,
  STUDENT_PORTAL_TITLE,
} from '@/utils/studentConstants'

function StudentSidebar({ collapsed, mobileOpen, onToggleCollapsed, onCloseMobile }) {
  const isDesktop = useMediaQuery('(min-width: 1024px)')

  const sidebarClassName = [
    'app-sidebar',
    'student-sidebar',
    collapsed ? 'app-sidebar--collapsed' : '',
    mobileOpen ? 'app-sidebar--open' : '',
  ]
    .filter(Boolean)
    .join(' ')

  const handleNavClick = () => {
    onCloseMobile()
  }

  return (
    <>
      <aside className={sidebarClassName} aria-label="Student">
        <div className="sidebar__top">
          <span className="sidebar__brand" title={STUDENT_PORTAL_TITLE}>
            <BrandLogo size={30} className="sidebar__brand-logo student-brand-logo" />
            <span className="sidebar__brand-name">{STUDENT_PORTAL_LABEL}</span>
          </span>
          {isDesktop ? (
            <button
              type="button"
              className="sidebar__collapse"
              onClick={onToggleCollapsed}
              aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {collapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
            </button>
          ) : (
            <button
              type="button"
              className="sidebar__collapse"
              onClick={onCloseMobile}
              aria-label="Close menu"
            >
              <X size={18} />
            </button>
          )}
        </div>

        <nav className="sidebar__nav">
          {STUDENT_NAV_ITEMS.map((item, index) => {
            const Icon = item.icon
            const section = item.section
            const previousSection = index === 0 ? null : STUDENT_NAV_ITEMS[index - 1].section
            const showSectionLabel = section && section !== previousSection
            return (
              <Fragment key={item.path}>
                {showSectionLabel ? (
                  <span className="sidebar__section-label">{section}</span>
                ) : null}
                <NavLink
                  to={item.path}
                  title={item.label}
                  onClick={handleNavClick}
                  className={({ isActive }) =>
                    isActive
                      ? 'sidebar__link sidebar__link--active'
                      : 'sidebar__link'
                  }
                >
                  <Icon className="sidebar__icon" size={20} aria-hidden="true" />
                  <span className="sidebar__label">{item.label}</span>
                </NavLink>
              </Fragment>
            )
          })}
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

export default StudentSidebar