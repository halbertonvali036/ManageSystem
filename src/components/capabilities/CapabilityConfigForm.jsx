import { useId, useState } from 'react'
import { Save } from 'lucide-react'
import useTranslation from '@/hooks/useTranslation'
import {
  buildCapabilityConfigDraft,
  CAPABILITY_CONFIG_TYPE,
  hasCapabilityConfigChanges,
  toCapabilityConfigInputs,
} from '@/models/capability'

/**
 * Capability settings form — generated from the catalog's config fields.
 *
 * The field list is declared once in `models/capability.js`, so a new setting
 * appears here without a new control and the validation always matches the
 * payload the service sends. Values are *suggestions* until the backend confirms
 * them: an unset field is shown as "not set" rather than as a saved value.
 *
 * The form owns only the draft. Saving goes back to the page, and the page
 * re-reads the capability afterwards, so nothing here is treated as persisted.
 */
function CapabilityConfigForm({
  capability,
  isSaving = false,
  error = null,
  onSubmit,
  onCancel,
}) {
  const { t } = useTranslation()
  const formId = useId()

  const configFields = capability?.configFields ?? []
  const capabilityName = capability ? t(capability.nameKey) : ''

  const [inputs, setInputs] = useState(() => toCapabilityConfigInputs(capability))
  const [errors, setErrors] = useState({})

  const handleChange = (key, value) => {
    setInputs((previous) => ({ ...previous, [key]: value }))
    setErrors((previous) => {
      if (!previous[key]) return previous
      const next = { ...previous }
      delete next[key]
      return next
    })
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    if (isSaving) return

    const draft = buildCapabilityConfigDraft(inputs, configFields)

    if (!draft.isValid) {
      setErrors(draft.errors)
      return
    }

    setErrors({})
    // The raw inputs go up, not the draft: the service validates them against the
    // catalog before sending anything, so there is one authority on what is valid.
    onSubmit(inputs)
  }

  // A default the backend never stored still counts as a change, so Save stays
  // available; it only turns off when the form matches what was read.
  const hasChanges = hasCapabilityConfigChanges(inputs, capability)
  const isSaveDisabled = isSaving || !hasChanges

  const title = t('workspaceCapabilities.settings.formTitle', { name: capabilityName })

  const errorText = (key) => {
    const code = errors[key]
    if (!code) return null
    return t(
      code === 'option'
        ? 'workspaceCapabilities.settings.errors.option'
        : 'workspaceCapabilities.settings.errors.required'
    )
  }

  return (
    <form
      className="cap-config-form"
      onSubmit={handleSubmit}
      noValidate
      aria-label={title}
    >
      <div className="cap-config-form__head">
        <h2 className="workspace-section__title">{title}</h2>
        <p className="cap-config-form__hint">{t('workspaceCapabilities.settings.hint')}</p>
      </div>

      {configFields.length > 0 ? (
        <div className="cap-config-form__grid">
          {configFields.map((field) => (
            <ConfigFieldInput
              key={field.key}
              field={field}
              inputId={`${formId}-${field.key}`}
              value={inputs[field.key]}
              error={errorText(field.key)}
              isSaving={isSaving}
              onChange={(value) => handleChange(field.key, value)}
            />
          ))}
        </div>
      ) : (
        <p className="table-state__text">{t('workspaceCapabilities.settings.noFields')}</p>
      )}

      {error ? (
        <div className="form-notice form-notice--error" role="alert">
          {error}
        </div>
      ) : null}

      <div className="workspace-form__actions">
        <button type="submit" className="btn btn--primary" disabled={isSaveDisabled}>
          {isSaving ? null : <Save size={16} aria-hidden="true" />}
          {isSaving
            ? t('workspaceCapabilities.settings.saving')
            : t('workspaceCapabilities.settings.saveCta')}
        </button>
        <button
          type="button"
          className="btn btn--ghost"
          onClick={onCancel}
          disabled={isSaving}
        >
          {t('workspaceCapabilities.settings.cancel')}
        </button>
        {hasChanges ? null : (
          <p className="form__hint">{t('workspaceCapabilities.settings.noChanges')}</p>
        )}
      </div>
    </form>
  )
}

/**
 * One declared setting.
 *
 * A boolean is a real checkbox; a select only offers the options the catalog
 * declared, so a value the schema does not allow cannot be submitted.
 */
function ConfigFieldInput({ field, inputId, value, error, isSaving, onChange }) {
  const { t } = useTranslation()
  const errorId = `${inputId}-error`
  const describedBy = error ? errorId : undefined

  if (field.type === CAPABILITY_CONFIG_TYPE.BOOLEAN) {
    return (
      <div className="form__field cap-config-form__field">
        <label className="form__checkbox" htmlFor={inputId}>
          <input
            id={inputId}
            type="checkbox"
            checked={Boolean(value)}
            onChange={(event) => onChange(event.target.checked)}
            disabled={isSaving}
            aria-describedby={describedBy}
          />
          <span>{t(field.label)}</span>
        </label>
        <p className="form__hint">{t(field.description)}</p>
        {error ? (
          <p className="form__error" id={errorId} role="alert">
            {error}
          </p>
        ) : null}
      </div>
    )
  }

  if (field.type === CAPABILITY_CONFIG_TYPE.SELECT) {
    return (
      <div className="form__field cap-config-form__field">
        <label className="form__label" htmlFor={inputId}>
          {t(field.label)}
        </label>
        <select
          id={inputId}
          className={`form__select${error ? ' form__input--error' : ''}`}
          value={value ?? ''}
          onChange={(event) => onChange(event.target.value)}
          disabled={isSaving}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
        >
          {(field.options ?? []).map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <p className="form__hint">{t(field.description)}</p>
        {error ? (
          <p className="form__error" id={errorId} role="alert">
            {error}
          </p>
        ) : null}
      </div>
    )
  }

  return (
    <div className="form__field cap-config-form__field">
      <label className="form__label" htmlFor={inputId}>
        {t(field.label)}
      </label>
      <input
        id={inputId}
        type="text"
        className={`form__input${error ? ' form__input--error' : ''}`}
        value={value ?? ''}
        onChange={(event) => onChange(event.target.value)}
        disabled={isSaving}
        aria-invalid={Boolean(error)}
        aria-describedby={describedBy}
      />
      <p className="form__hint">{t(field.description)}</p>
      {error ? (
        <p className="form__error" id={errorId} role="alert">
          {error}
        </p>
      ) : null}
    </div>
  )
}

export default CapabilityConfigForm
