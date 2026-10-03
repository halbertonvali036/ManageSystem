import { useId, useState } from 'react'
import { Eye, EyeOff, Save } from 'lucide-react'
import useTranslation from '@/hooks/useTranslation'
import {
  buildIntegrationConfigDraft,
  hasIntegrationConfigChanges,
  INTEGRATION_CONFIG_TYPE,
  INTEGRATION_SENSITIVE_CONFIG_TYPES,
  toIntegrationConfigInputs,
} from '@/models/integration'

/**
 * Integration config form — generated from the catalog's config schema.
 *
 * The field list is declared once in `models/integration.js`, so a new service
 * appears here without a new control and the validation always matches the payload
 * the service sends.
 *
 * Secret handling, in one place:
 *  - A write-only secret renders as a masked input that starts empty on every open
 *    and is cleared as soon as the form is submitted.
 *  - A stored secret is shown as a "set" marker and an empty replace field. The
 *    frontend never receives the value, so it can never display or re-send it.
 *  - Nothing here writes to localStorage or sessionStorage. A secret lives in
 *    component state for the length of one form interaction and is then gone.
 */
function IntegrationConfigForm({
  integration,
  isSaving = false,
  error = null,
  onSubmit,
  onCancel,
}) {
  const { t } = useTranslation()
  const formId = useId()

  const configFields = integration?.configFields ?? []
  const integrationName = integration ? t(integration.nameKey) : ''

  const [inputs, setInputs] = useState(() => toIntegrationConfigInputs(integration))
  const [errors, setErrors] = useState({})
  const [revealed, setRevealed] = useState({})

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

    const draft = buildIntegrationConfigDraft(inputs, configFields)

    if (!draft.isValid) {
      setErrors(draft.errors)
      return
    }

    setErrors({})
    // Drop every secret from local state before handing the values up. The parent
    // sends them in the request; the browser does not keep them.
    setInputs((previous) => {
      const cleared = { ...previous }
      for (const key of draft.secretKeys) cleared[key] = ''
      return cleared
    })
    setRevealed({})

    onSubmit(inputs)
  }

  // A default the backend never stored still counts as a change, so Save stays
  // available; it only turns off when the form matches what was read.
  const hasChanges = hasIntegrationConfigChanges(inputs, integration)
  const isSaveDisabled = isSaving || !hasChanges

  const title = t('workspaceIntegrations.settings.formTitle', { name: integrationName })

  const errorText = (key) => {
    const code = errors[key]
    if (!code) return null
    return t(
      code === 'option'
        ? 'workspaceIntegrations.settings.errors.option'
        : 'workspaceIntegrations.settings.errors.required'
    )
  }

  return (
    <form
      className="int-config-form"
      onSubmit={handleSubmit}
      noValidate
      aria-label={title}
    >
      <div className="int-config-form__head">
        <h2 className="workspace-section__title">{title}</h2>
        <p className="int-config-form__hint">
          {t('workspaceIntegrations.settings.hint')}
        </p>
      </div>

      <p className="int-config-form__security">
        {t('workspaceIntegrations.settings.securityNote')}
      </p>

      {configFields.length > 0 ? (
        <div className="int-config-form__grid">
          {configFields.map((field) => (
            <ConfigFieldInput
              key={field.key}
              field={field}
              integration={integration}
              inputId={`${formId}-${field.key}`}
              value={inputs[field.key]}
              error={errorText(field.key)}
              isSaving={isSaving}
              isRevealed={Boolean(revealed[field.key])}
              onToggleReveal={() =>
                setRevealed((previous) => ({
                  ...previous,
                  [field.key]: !previous[field.key],
                }))
              }
              onChange={(value) => handleChange(field.key, value)}
            />
          ))}
        </div>
      ) : (
        <p className="table-state__text">
          {t('workspaceIntegrations.settings.noFields')}
        </p>
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
            ? t('workspaceIntegrations.settings.saving')
            : t('workspaceIntegrations.settings.saveCta')}
        </button>
        <button
          type="button"
          className="btn btn--ghost"
          onClick={onCancel}
          disabled={isSaving}
        >
          {t('workspaceIntegrations.settings.cancel')}
        </button>
        {hasChanges ? null : (
          <p className="form__hint">{t('workspaceIntegrations.settings.noChanges')}</p>
        )}
      </div>
    </form>
  )
}

/**
 * One declared setting.
 *
 * A boolean is a real checkbox; a select only offers the options the catalog
 * declared; a secret gets a masked input with a reveal toggle. A stored secret
 * shows a "set" marker above its replace field, because the value is not here to
 * display.
 */
function ConfigFieldInput({
  field,
  integration,
  inputId,
  value,
  error,
  isSaving,
  isRevealed,
  onToggleReveal,
  onChange,
}) {
  const { t } = useTranslation()
  const errorId = `${inputId}-error`
  const describedBy = error ? errorId : undefined
  const isStoredSecret = field.type === INTEGRATION_CONFIG_TYPE.STORED_SECRET
  const isSecret =
    isStoredSecret ||
    INTEGRATION_SENSITIVE_CONFIG_TYPES.includes(field.type)
  const isSet = isStoredSecret && Boolean(integration?.configuration?.[field.key])

  if (field.type === INTEGRATION_CONFIG_TYPE.BOOLEAN) {
    return (
      <div className="form__field int-config-form__field">
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

  const inputType =
    isSecret && !isRevealed ? 'password' : field.type === INTEGRATION_CONFIG_TYPE.SELECT ? 'select' : 'text'

  return (
    <div className="form__field int-config-form__field">
      <div className="int-config-form__label-row">
        <label className="form__label" htmlFor={inputId}>
          {t(field.label)}
        </label>
        {isSet ? (
          <span className="int-config-form__set">
            {t('workspaceIntegrations.settings.alreadySet')}
          </span>
        ) : null}
      </div>

      {field.type === INTEGRATION_CONFIG_TYPE.SELECT ? (
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
      ) : (
        <div className="int-config-form__secret">
          <input
            id={inputId}
            type={inputType}
            className={`form__input${error ? ' form__input--error' : ''}`}
            value={value ?? ''}
            onChange={(event) => onChange(event.target.value)}
            disabled={isSaving}
            autoComplete="off"
            spellCheck="false"
            placeholder={
              isSecret
                ? t('workspaceIntegrations.settings.secretPlaceholder')
                : undefined
            }
            aria-invalid={Boolean(error)}
            aria-describedby={describedBy}
          />
          {isSecret ? (
            <button
              type="button"
              className="int-config-form__reveal"
              onClick={onToggleReveal}
              disabled={isSaving}
              aria-pressed={isRevealed}
              aria-label={t(
                isRevealed
                  ? 'workspaceIntegrations.settings.hideSecret'
                  : 'workspaceIntegrations.settings.showSecret'
              )}
            >
              {isRevealed ? (
                <EyeOff size={16} aria-hidden="true" />
              ) : (
                <Eye size={16} aria-hidden="true" />
              )}
            </button>
          ) : null}
        </div>
      )}

      <p className="form__hint">{t(field.description)}</p>
      {error ? (
        <p className="form__error" id={errorId} role="alert">
          {error}
        </p>
      ) : null}
    </div>
  )
}

export default IntegrationConfigForm
