import { useId, useState } from 'react'
import { Save } from 'lucide-react'
import useTranslation from '@/hooks/useTranslation'
import { FIELD_TYPE, normalizeFieldType, RELATION_TYPE_LABEL_KEYS } from '@/models/database'
import {
  buildRecordDraft,
  RECORD_ERROR,
  toRecordInputs,
} from '@/models/record'

/** HTML input type per field type, so the browser validates in the right mode. */
const INPUT_TYPE = Object.freeze({
  [FIELD_TYPE.TEXT]: 'text',
  [FIELD_TYPE.NUMBER]: 'number',
  [FIELD_TYPE.DATE]: 'date',
  [FIELD_TYPE.EMAIL]: 'email',
  [FIELD_TYPE.URL]: 'url',
})

const ERROR_KEY_BY_CODE = Object.freeze({
  [RECORD_ERROR.REQUIRED]: 'required',
  [RECORD_ERROR.NUMBER]: 'number',
  [RECORD_ERROR.DATE]: 'date',
  [RECORD_ERROR.EMAIL]: 'email',
  [RECORD_ERROR.URL]: 'url',
  [RECORD_ERROR.OPTION]: 'option',
})

const NO_FIELDS = Object.freeze([])

/**
 * Record form, generated entirely from the model's fields.
 *
 * There is no hand-written list of inputs anywhere: a new field type or a new
 * field on the model appears here on the next render, with the right control and
 * the right validation. The form owns only the draft; the page decides what to
 * do with the validated values.
 *
 * Relation fields are not editable here. Their values are passed through
 * untouched so an update can never clear a link, and the panel states plainly
 * that the relation is not connected yet.
 */
function RecordForm({
  model,
  record = null,
  isSaving = false,
  error = null,
  onSubmit,
  onCancel,
}) {
  const { t } = useTranslation()
  const formId = useId()

  const fields = model?.fields ?? NO_FIELDS
  const isEditing = Boolean(record)

  const editableFields = fields.filter((field) => !field.relation)
  const relationFields = fields.filter((field) => field.relation)

  const [inputs, setInputs] = useState(() => toRecordInputs(record, fields))
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

    const draft = buildRecordDraft(inputs, editableFields)

    if (!draft.isValid) {
      setErrors(draft.errors)
      return
    }

    setErrors({})

    // Values that belong to relation columns are not editable here, so they are
    // carried over from the loaded record instead of being dropped: an update can
    // never silently clear a link.
    const relationValues = {}
    for (const field of relationFields) {
      relationValues[field.key] = record?.values?.[field.key] ?? null
    }

    onSubmit({ ...relationValues, ...draft.values })
  }

  const title = isEditing
    ? t('database.records.form.editTitle')
    : t('database.records.form.createTitle')

  const errorText = (key) => {
    const name = ERROR_KEY_BY_CODE[errors[key]]
    return name ? t(`database.records.form.errors.${name}`) : null
  }

  return (
    <form
      className="record-form"
      onSubmit={handleSubmit}
      noValidate
      aria-label={title}
    >
      <div className="record-form__head">
        <h2 className="workspace-section__title">{title}</h2>
        <p className="record-form__hint">{t('database.records.form.requiredHint')}</p>
      </div>

      {editableFields.length > 0 ? (
        <div className="record-form__grid">
          {editableFields.map((field) => (
            <RecordFieldInput
              key={field.key}
              field={field}
              inputId={`${formId}-${field.key}`}
              value={inputs[field.key] ?? ''}
              error={errorText(field.key)}
              isSaving={isSaving}
              onChange={(value) => handleChange(field.key, value)}
            />
          ))}
        </div>
      ) : (
        <p className="table-state__text">{t('database.records.form.noFields')}</p>
      )}

      {relationFields.length > 0 ? (
        <fieldset className="record-form__relations">
          <legend className="form__label">
            {t('database.records.relation.title')}
          </legend>
          <p className="form__hint">{t('database.records.relation.hint')}</p>
          <ul className="record-form__relation-list">
            {relationFields.map((field) => (
              <li key={field.key} className="record-form__relation">
                <span className="record-form__relation-name">{field.name}</span>
                <span className="record-form__relation-type">
                  {t(
                    RELATION_TYPE_LABEL_KEYS[field.relation.type] ??
                      'database.relation.none'
                  )}
                </span>
                <span className="record-form__relation-target">
                  {t('database.records.relation.targetLabel')}:{' '}
                  {field.relation.targetModelKey ??
                    t('database.records.relation.notConfigured')}
                </span>
              </li>
            ))}
          </ul>
        </fieldset>
      ) : null}

      {error ? (
        <div className="form-notice form-notice--error" role="alert">
          {error}
        </div>
      ) : null}

      <div className="workspace-form__actions">
        <button type="submit" className="btn btn--primary" disabled={isSaving}>
          {isSaving ? null : <Save size={16} aria-hidden="true" />}
          {isSaving
            ? t('database.records.form.saving')
            : isEditing
              ? t('database.records.form.submitSave')
              : t('database.records.form.submitCreate')}
        </button>
        <button
          type="button"
          className="btn btn--ghost"
          onClick={onCancel}
          disabled={isSaving}
        >
          {t('database.records.form.cancel')}
        </button>
      </div>
    </form>
  )
}

/**
 * One schema-driven control.
 *
 * Boolean is an explicit three-way select (yes / no / not set) so "not set" stays
 * distinguishable from "false", which a checkbox could not express. Select uses
 * the field's own options, so an invented value cannot be submitted. The form
 * carries noValidate: `buildRecordDraft` is the authority on what is valid.
 */
function RecordFieldInput({ field, inputId, value, error, isSaving, onChange }) {
  const { t } = useTranslation()
  const type = normalizeFieldType(field.type)
  const errorId = `${inputId}-error`
  const invalidClass = error ? ' form__input--error' : ''

  const sharedProps = {
    id: inputId,
    value,
    disabled: isSaving,
    onChange: (event) => onChange(event.target.value),
    'aria-required': Boolean(field.required),
    'aria-invalid': Boolean(error),
    'aria-describedby': error ? errorId : undefined,
  }

  let control

  if (type === FIELD_TYPE.BOOLEAN) {
    control = (
      <select {...sharedProps} className={`form__select${invalidClass}`}>
        <option value="">{t('database.records.form.noneSelected')}</option>
        <option value="true">{t('database.records.form.yes')}</option>
        <option value="false">{t('database.records.form.no')}</option>
      </select>
    )
  } else if (type === FIELD_TYPE.SELECT) {
    control = (
      <select {...sharedProps} className={`form__select${invalidClass}`}>
        <option value="">{t('database.records.form.selectPlaceholder')}</option>
        {(field.options ?? []).map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    )
  } else {
    control = (
      <input
        {...sharedProps}
        type={INPUT_TYPE[type] ?? 'text'}
        className={`form__input${invalidClass}`}
        step={type === FIELD_TYPE.NUMBER ? 'any' : undefined}
      />
    )
  }

  return (
    <div className="form__field">
      <label className="form__label" htmlFor={inputId}>
        {field.name}
        {field.required ? (
          <span aria-hidden="true" className="record-form__required">
            {t('database.records.form.requiredMark')}
          </span>
        ) : null}
      </label>
      {control}
      {error ? (
        <p className="form__error" id={errorId} role="alert">
          {error}
        </p>
      ) : null}
    </div>
  )
}

export default RecordForm
