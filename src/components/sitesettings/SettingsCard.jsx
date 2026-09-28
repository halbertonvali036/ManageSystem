/**
 * A settings section: an icon, a heading, a sentence of orientation and a body.
 *
 * The description is not a subtitle for the sake of it. Each section on this page
 * contains at least one control that cannot do its job yet — an unconnected
 * domain, a visibility that nothing enforces — and the description is where the
 * page says so in the same place the user is looking.
 */
function SettingsCard({ id, title, description, icon: Icon, action, children, className = '' }) {
  return (
    <section
      id={id}
      className={`settings-card${className ? ` ${className}` : ''}`}
      aria-labelledby={`${id}-title`}
    >
      <header className="settings-card__header">
        {Icon ? (
          <span className="settings-card__icon" aria-hidden="true">
            <Icon size={17} />
          </span>
        ) : null}
        <div className="settings-card__heading">
          <h2 className="settings-card__title" id={`${id}-title`}>
            {title}
          </h2>
          {description ? <p className="settings-card__description">{description}</p> : null}
        </div>
        {action ? <div className="settings-card__action">{action}</div> : null}
      </header>
      <div className="settings-card__body">{children}</div>
    </section>
  )
}

export default SettingsCard
