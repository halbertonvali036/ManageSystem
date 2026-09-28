import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'

const getPartOfDay = () => {
  const hour = new Date().getHours()
  if (hour < 12) {
    return 'morning'
  }
  if (hour < 17) {
    return 'afternoon'
  }
  return 'evening'
}

function WorkspaceHero({
  user,
  greeting,
  eyebrow,
  subtitle,
  roleIcon: RoleIcon,
  roleLabel,
  chips = [],
  accountTo,
  accountLabel = 'View profile',
}) {
  const initials = (user?.name ?? 'U')
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  return (
    <div className="workspace-hero">
      <div className="workspace-hero__copy">
        <p className="workspace-hero__eyebrow">{eyebrow}</p>
        <h2 className="workspace-hero__greeting">
          {greeting ?? `Good ${getPartOfDay()}, ${user?.name ?? 'there'}`}
        </h2>
        <p className="workspace-hero__subtitle">{subtitle}</p>

        <div className="workspace-hero__context">
          <span className="dashboard-role">
            <RoleIcon size={14} aria-hidden="true" />
            {roleLabel}
          </span>
          {chips.map((chip, index) => (
            <span key={index}>{chip}</span>
          ))}
        </div>
      </div>

      <div className="workspace-hero__identity">
        <span className="workspace-hero__avatar" aria-hidden="true">
          {initials}
        </span>
        <span className="workspace-hero__identity-name">
          {user?.name ?? 'User'}
        </span>
        <span className="workspace-hero__identity-email">
          {user?.email ?? 'No email on file'}
        </span>
        {accountTo ? (
          <Link to={accountTo} className="workspace-hero__profile-link">
            {accountLabel}
            <ArrowRight size={14} aria-hidden="true" />
          </Link>
        ) : null}
      </div>
    </div>
  )
}

export default WorkspaceHero