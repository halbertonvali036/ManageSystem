import Card from '@/components/common/Card'

function SettingsSection({ id, title, description, icon, children, className }) {
  const content = (
    <Card className={`settings-section${className ? ` ${className}` : ''}`}>
      <header className="settings-section__header">
        {icon ? (
          <span className="settings-section__icon" aria-hidden="true">
            {icon}
          </span>
        ) : null}
        <div className="settings-section__heading">
          <h2 className="card__title">{title}</h2>
          {description ? (
            <p className="settings-section__description">{description}</p>
          ) : null}
        </div>
      </header>
      {children}
    </Card>
  )

  return (
    <>
      {id ? <span id={id} className="settings-section-anchor" aria-hidden="true" /> : null}
      {content}
    </>
  )
}

export default SettingsSection
