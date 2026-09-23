function SettingsPlaceholder({ title, text, actionLabel = 'Configure', icon }) {
  return (
    <div className="settings-placeholder">
      {icon ? (
        <span className="settings-placeholder__icon" aria-hidden="true">
          {icon}
        </span>
      ) : null}
      <div className="settings-placeholder__info">
        <div className="settings-placeholder__heading">
          <p className="settings-placeholder__title">{title}</p>
          <span className="settings-placeholder__badge">Unavailable</span>
        </div>
        <p className="settings-placeholder__text">{text}</p>
      </div>
      <button
        type="button"
        className="btn btn--primary"
        disabled
        title={text}
      >
        {actionLabel}
      </button>
    </div>
  )
}

export default SettingsPlaceholder