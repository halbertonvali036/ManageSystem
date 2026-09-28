import { useId } from 'react'

/**
 * Shared section shell for the Account & Security page.
 * Renders a labelled landmark region with an optional eyebrow, icon and
 * trailing action slot so every security block shares one visual hierarchy.
 */
function SecuritySection({
  id,
  eyebrow,
  title,
  description,
  icon,
  action,
  className,
  children,
}) {
  const headingId = useId()

  return (
    <section
      id={id}
      className={`account-security-section${className ? ` ${className}` : ''}`}
      aria-labelledby={headingId}
    >
      <header className="account-security-section__header">
        {icon ? (
          <span className="account-security-section__icon" aria-hidden="true">
            {icon}
          </span>
        ) : null}
        <div className="account-security-section__heading">
          {eyebrow ? (
            <p className="account-security-section__eyebrow">{eyebrow}</p>
          ) : null}
          <h2 id={headingId} className="account-security-section__title">
            {title}
          </h2>
          {description ? (
            <p className="account-security-section__description">{description}</p>
          ) : null}
        </div>
        {action ? (
          <div className="account-security-section__action">{action}</div>
        ) : null}
      </header>
      <div className="account-security-section__body">{children}</div>
    </section>
  )
}

export default SecuritySection
