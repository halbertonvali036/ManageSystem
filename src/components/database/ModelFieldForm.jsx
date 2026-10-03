import { useState } from 'react'
import { Plus, Save } from 'lucide-react'
import useTranslation from '@/hooks/useTranslation'
import {
  DEFAULT_FIELD_TYPE,
  FIELD_TYPES,
  FIELD_TYPE_LABEL_KEYS,
  isSelectFieldType,
  isValidFieldKey,
  isValidFieldName,
  NO_RELATION,
  RELATION_TYPES,
  RELATION_TYPE_LABEL_KEYS,
  toKeySegment,
} from '@/models/database'
import { FIELD_KEY_MAX_LENGTH, FIELD_NAME_MAX_LENGTH } from '@/models/database'

/** HTML input type used for the default value, per field type. */
const DEFAULT_INPUT_TYPE = Object.freeze({
  text: 'text',
  number: 'number',
  date: 'date',
  email: 'email',
  url: 'url',
})

/**
 * Field settings editor — one field at a time.
 *
 * Owns only the draft. Saving, adding and removing all go back to the model
 * page through onSubmit, so the field is never written anywhere from here.
 *
 * The key is suggested from the name until the user edits it themselves: a
 * suggestion is a convenience, the validation is the authority.
 */
function ModelFieldForm({
  field = null,
  existingKeys = [],
  models = [],
  isSaving = false,
  error = null,
  onSubmit,
  onCancel,
}) {
  const { t } = useTranslation()

  const [name, setName] = useState(field?.name ?? '')
  const [key, setKey] = useState(field?.key ?? '')
  const [isKeyEdited, setIsKeyEdited] = useState(Boolean(field?.key))
  const [type, setType] = useState(field?.type ?? DEFAULT_FIELD_TYPE)
  const [required, setRequired] = useState(Boolean(field?.required))
  const [defaultValue, setDefaultValue] = useState(field?.defaultValue ?? '')
  const [options, setOptions] = useState((field?.options ?? []).join(', '))
  const [relationType, setRelationType] = useState(field?.relation?.type ?? NO_RELATION)
  const [relationTarget, setRelationTarget] = useState(field?.relation?.targetModelId ?? '')

  const [errors, setErrors] = useState({})

  const isEditing = Boolean(field)
  const showOptions = isSelectFieldType(type)
  const optionList = options
    .split(',')
    .map((option) => option.trim())
    .filter(Boolean)

  const handleNameChange = (value) => {
    setName(value)
    if (!isKeyEdited) {
      setKey(toKeySegment(value, FIELD_KEY_MAX_LENGTH))
    }
  }

  const handleKeyChange = (value) => {
    setIsKeyEdited(true)
    setKey(value.trim().toLowerCase().replace(/\s+/g, '_'))
  }

  const validate = () => {
    const next = {}

    if (!isValidFieldName(name)) {
      next.name = t('database.field.nameError')
    }

    if (!isValidFieldKey(key)) {
      next.key = t('database.field.keyError')
    } else if (existingKeys.includes(key)) {
      next.key = t('database.field.keyError')
    }

    if (showOptions && optionList.length === 0) {
      next.options = t('database.field.optionsError')
    }

    if (relationType !== NO_RELATION && !relationTarget) {
      next.relation = t('database.relation.targetError')
    }

    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    if (isSaving) return
    if (!validate()) return

    const target = models.find((model) => model.id === relationTarget)

    onSubmit({
      id: field?.id ?? null,
      name,
      key,
      type,
      required,
      defaultValue,
      options,
      relation:
        relationType === NO_RELATION
          ? null
          : { type: relationType, targetModelId: relationTarget, targetModelKey: target?.key ?? null },
    })
  }

  const title = isEditing ? t('database.field.editTitle') : t('database.field.addTitle')

  return (
    <form className="db-field-form" onSubmit={handleSubmit} noValidate aria-label={title}>
      <h3 className="workspace-section__title">{title}</h3>

      <div className="db-field-form__grid">
        <div className="form__field">
          <label className="form__label" htmlFor="db-field-name">
            {t('database.field.nameLabel')}
          </label>
          <input
            id="db-field-name"
            type="text"
            className={`form__input${errors.name ? ' form__input--error' : ''}`}
            value={name}
            onChange={(event) => handleNameChange(event.target.value)}
            placeholder={t('database.field.namePlaceholder')}
            maxLength={FIELD_NAME_MAX_LENGTH}
            disabled={isSaving}
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? 'db-field-name-error' : undefined}
          />
          {errors.name ? (
            <p className="form__error" id="db-field-name-error" role="alert">
              {errors.name}
            </p>
          ) : null}
        </div>

        <div className="form__field">
          <label className="form__label" htmlFor="db-field-key">
            {t('database.field.keyLabel')}
          </label>
          <input
            id="db-field-key"
            type="text"
            className={`form__input form-input--mono${errors.key ? ' form__input--error' : ''}`}
            value={key}
            onChange={(event) => handleKeyChange(event.target.value)}
            placeholder={t('database.field.keyPlaceholder')}
            maxLength={FIELD_KEY_MAX_LENGTH}
            disabled={isSaving}
            aria-invalid={Boolean(errors.key)}
            aria-describedby={errors.key ? 'db-field-key-error' : undefined}
          />
          {errors.key ? (
            <p className="form__error" id="db-field-key-error" role="alert">
              {errors.key}
            </p>
          ) : null}
        </div>

        <div className="form__field">
          <label className="form__label" htmlFor="db-field-type">
            {t('database.field.typeLabel')}
          </label>
          <select
            id="db-field-type"
            className="form__select"
            value={type}
            onChange={(event) => setType(event.target.value)}
            disabled={isSaving}
          >
            {FIELD_TYPES.map((fieldType) => (
              <option key={fieldType} value={fieldType}>
                {t(FIELD_TYPE_LABEL_KEYS[fieldType])}
              </option>
            ))}
          </select>
        </div>

        <div className="form__field">
          <label className="form__label" htmlFor="db-field-default">
            {t('database.field.defaultLabel')}
          </label>
          <DefaultValueInput
            id="db-field-default"
            type={type}
            value={defaultValue}
            options={optionList}
            onChange={setDefaultValue}
            disabled={isSaving}
          />
          <p className="form__hint">{t('database.field.defaultHint')}</p>
        </div>
      </div>

      {showOptions ? (
        <div className="form__field">
          <label className="form__label" htmlFor="db-field-options">
            {t('database.field.optionsLabel')}
          </label>
          <input
            id="db-field-options"
            type="text"
            className={`form__input${errors.options ? ' form__input--error' : ''}`}
            value={options}
            onChange={(event) => setOptions(event.target.value)}
            disabled={isSaving}
            aria-invalid={Boolean(errors.options)}
            aria-describedby={errors.options ? 'db-field-options-error' : undefined}
          />
          {errors.options ? (
            <p className="form__error" id="db-field-options-error" role="alert">
              {errors.options}
            </p>
          ) : (
            <p className="form__hint">{t('database.field.optionsHint')}</p>
          )}
        </div>
      ) : null}

      <fieldset className="db-field-form__relations">
        <legend className="form__label">{t('database.relation.title')}</legend>
        <p className="form__hint">{t('database.relation.hint')}</p>

        <div className="db-field-form__grid">
          <div className="form__field">
            <label className="form__label" htmlFor="db-field-relation-type">
              {t('database.relation.typeLabel')}
            </label>
            <select
              id="db-field-relation-type"
              className="form__select"
              value={relationType}
              onChange={(event) => setRelationType(event.target.value)}
              disabled={isSaving}
            >
              <option value={NO_RELATION}>{t('database.relation.none')}</option>
              {RELATION_TYPES.map((item) => (
                <option key={item} value={item}>
                  {t(RELATION_TYPE_LABEL_KEYS[item])}
                </option>
              ))}
            </select>
          </div>

          <div className="form__field">
            <label className="form__label" htmlFor="db-field-relation-target">
              {t('database.relation.targetLabel')}
            </label>
            <select
              id="db-field-relation-target"
              className="form__select"
              value={relationTarget}
              onChange={(event) => setRelationTarget(event.target.value)}
              disabled={isSaving || relationType === NO_RELATION}
              aria-invalid={Boolean(errors.relation)}
              aria-describedby={errors.relation ? 'db-field-relation-error' : undefined}
            >
              <option value="">{t('database.relation.notConfigured')}</option>
              {models.map((model) => (
                <option key={model.id} value={model.id}>
                  {model.name}
                </option>
              ))}
            </select>
            {errors.relation ? (
              <p className="form__error" id="db-field-relation-error" role="alert">
                {errors.relation}
              </p>
            ) : null}
          </div>
        </div>
      </fieldset>

      <label className="form__checkbox db-field-form__required">
        <input
          type="checkbox"
          checked={required}
          onChange={(event) => setRequired(event.target.checked)}
          disabled={isSaving}
        />
        <span>{t('database.field.requiredLabel')}</span>
      </label>

      {error ? (
        <div className="form-notice form-notice--error" role="alert">
          {error}
        </div>
      ) : null}

      <div className="workspace-form__actions">
        <button type="submit" className="btn btn--primary" disabled={isSaving}>
          {isSaving ? (
            t('database.form.saving')
          ) : isEditing ? (
            <Save size={16} aria-hidden="true" />
          ) : (
            <Plus size={16} aria-hidden="true" />
          )}
          {isEditing ? t('database.field.saveCta') : t('database.field.addCta')}
        </button>
        <button type="button" className="btn btn--ghost" onClick={onCancel} disabled={isSaving}>
          {t('database.field.cancel')}
        </button>
      </div>
    </form>
  )
}

/**
 * Default-value control.
 *
 * The input follows the field type so a date or a number is entered as one, and
 * Boolean becomes an explicit three-way choice instead of a text box.
 */
function DefaultValueInput({ id, type, value, options, onChange, disabled }) {
  const { t } = useTranslation()

  if (type === 'boolean') {
    return (
      <select
        id={id}
        className="form__select"
        value={value ?? ''}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
      >
        <option value="">{t('database.field.defaultNone')}</option>
        <option value="true">true</option>
        <option value="false">false</option>
      </select>
    )
  }

  if (type === 'select') {
    return (
      <select
        id={id}
        className="form__select"
        value={value ?? ''}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
      >
        <option value="">{t('database.field.defaultNone')}</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    )
  }

  return (
    <input
      id={id}
      type={DEFAULT_INPUT_TYPE[type] ?? 'text'}
      className="form__input"
      value={value ?? ''}
      onChange={(event) => onChange(event.target.value)}
      disabled={disabled}
    />
  )
}

export default ModelFieldForm
