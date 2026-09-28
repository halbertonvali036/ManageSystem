/**
 * Informational row for a settings block the backend does not serve yet.
 *
 * It states the setting, what it will cover and why it is unavailable, and
 * never renders a fake value, a fake control or a fake success. A real action
 * (for example a link to the page that owns the behaviour) can be passed in;
 * when there is nothing to run yet, no action is shown at all.
 */
function SettingsPlaceholder({
  title,
  text,
  status = 'Backend required',
  icon,
  action = null,
}) {
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
          <span className="settings-placeholder__badge">{status}</span>
        </div>
        <p className="settings-placeholder__text">{text}</p>
      </div>
      {action}
    </div>
  )
}

export default SettingsPlaceholder
