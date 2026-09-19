import { useId } from 'react'

function SettingsInput({
  field,
  label,
  value,
  onChange,
  type = 'text',
  placeholder = '',
}) {
  const inputId = useId()

  return (
    <div className="form__field">
      <label className="form__label" htmlFor={inputId}>
        {label}
      </label>
      <input
        id={inputId}
        type={type}
        className="form__input"
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(field, event.target.value)}
      />
    </div>
  )
}

function SettingsSelect({ field, label, value, onChange, options, disabled, hint }) {
  const inputId = useId()

  return (
    <div className="form__field">
      <label className="form__label" htmlFor={inputId}>
        {label}
      </label>
      <select
        id={inputId}
        className="form__input form__select"
        value={value}
        onChange={(event) => onChange(field, event.target.value)}
        disabled={disabled}
      >
        <option value="">Select {label.toLowerCase()}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {hint ? <p className="form__hint">{hint}</p> : null}
    </div>
  )
}

function SettingsTextArea({ field, label, value, onChange, rows = 3 }) {
  const inputId = useId()

  return (
    <div className="form__field">
      <label className="form__label" htmlFor={inputId}>
        {label}
      </label>
      <textarea
        id={inputId}
        className="form__input"
        rows={rows}
        value={value}
        onChange={(event) => onChange(field, event.target.value)}
      />
    </div>
  )
}

export { SettingsInput, SettingsSelect, SettingsTextArea }