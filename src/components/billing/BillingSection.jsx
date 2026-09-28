import { useId } from 'react'

/**
 * Shared section shell for the Plan & Billing page.
 * Renders a labelled landmark region with an optional eyebrow, icon and
 * trailing action slot so every billing block shares one visual hierarchy.
 */
function BillingSection({
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
      className={`billing-section${className ? ` ${className}` : ''}`}
      aria-labelledby={headingId}
    >
      <header className="billing-section__header">
        {icon ? (
          <span className="billing-section__icon" aria-hidden="true">
            {icon}
          </span>
        ) : null}
        <div className="billing-section__heading">
          {eyebrow ? <p className="billing-section__eyebrow">{eyebrow}</p> : null}
          <h2 id={headingId} className="billing-section__title">
            {title}
          </h2>
          {description ? (
            <p className="billing-section__description">{description}</p>
          ) : null}
        </div>
        {action ? <div className="billing-section__action">{action}</div> : null}
      </header>
      <div className="billing-section__body">{children}</div>
    </section>
  )
}

export default BillingSection
