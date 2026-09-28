import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'

function AccountStatusPanel({
  title = 'Account',
  hint,
  statuses,
  links = [],
}) {
  return (
    <section className="workspace-account" aria-labelledby="workspace-account-title">
      <header className="workspace-account__head">
        <h2 id="workspace-account-title" className="workspace-account__title">
          {title}
        </h2>
        {hint ? <p className="workspace-account__hint">{hint}</p> : null}
      </header>

      <ul className="workspace-account__statuses">
        {statuses.map((item) => (
          <li key={item.label} className="workspace-account__status">
            <span className="workspace-account__status-label">{item.label}</span>
            <span
              className={`workspace-account__status-value workspace-account__status-value--${item.tone ?? 'muted'}`}
            >
              {item.value ?? '—'}
            </span>
            {item.helper ? (
              <span className="workspace-account__status-helper">
                {item.helper}
              </span>
            ) : null}
          </li>
        ))}
      </ul>

      {links.length ? (
        <ul className="workspace-account__links">
          {links.map((item) => {
            const Icon = item.icon
            return item.to ? (
              <li key={item.label}>
                <Link to={item.to} className="workspace-account__link">
                  <Icon size={16} aria-hidden="true" />
                  <span>{item.label}</span>
                  <ArrowRight
                    size={14}
                    className="workspace-account__link-arrow"
                    aria-hidden="true"
                  />
                </Link>
              </li>
            ) : (
              <li key={item.label}>
                <span className="workspace-account__link workspace-account__link--disabled">
                  <Icon size={16} aria-hidden="true" />
                  <span>{item.label}</span>
                  <span className="workspace-account__soon">
                    {item.badge ?? 'Coming soon'}
                  </span>
                </span>
              </li>
            )
          })}
        </ul>
      ) : null}
    </section>
  )
}

export default AccountStatusPanel