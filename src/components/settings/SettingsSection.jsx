import Card from '@/components/common/Card'

function SettingsSection({ title, description, icon, children, className }) {
  return (
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
}

export default SettingsSection