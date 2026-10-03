import { useState } from 'react'
import useTranslation from '@/hooks/useTranslation'
import {
  isValidModelKey,
  isValidModelName,
  MODEL_KEY_MAX_LENGTH,
  MODEL_NAME_MAX_LENGTH,
  toKeySegment,
  uniqueKey,
} from '@/models/database'

/**
 * Create / rename form for a schema model.
 *
 * `model` null means create, a model means rename. The key is suggested from the
 * name until the user edits it, and a duplicate never silently overwrites an
 * existing key: the suggestion walks past the keys already taken.
 */
function ModelForm({
  model = null,
  existingKeys = [],
  isSaving = false,
  error = null,
  onSubmit,
  onCancel,
}) {
  const { t } = useTranslation()

  const [name, setName] = useState(model?.name ?? '')
  const [key, setKey] = useState(model?.key ?? '')
  const [description, setDescription] = useState(model?.description ?? '')
  const [isKeyEdited, setIsKeyEdited] = useState(Boolean(model?.key))
  const [errors, setErrors] = useState({})

  const isEditing = Boolean(model)

  const handleNameChange = (value) => {
    setName(value)
    if (!isKeyEdited) {
      setKey(uniqueKey(toKeySegment(value, MODEL_KEY_MAX_LENGTH) || 'model', existingKeys))
    }
  }

  const handleKeyChange = (value) => {
    setIsKeyEdited(true)
    setKey(value.trim().toLowerCase().replace(/\s+/g, '_'))
  }

  const validate = () => {
    const next = {}

    if (!isValidModelName(name)) {
      next.name = t('database.form.nameError')
    }

    if (!isValidModelKey(key)) {
      next.key = t('database.form.keyError')
    } else if (existingKeys.includes(key)) {
      next.key = t('database.form.keyError')
    }

    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    if (isSaving) return
    if (!validate()) return
    onSubmit({ name, key, description })
  }

  const title = isEditing ? t('database.form.renameTitle') : t('database.form.createTitle')

  return (
    <form className="workspace-form db-model-form" onSubmit={handleSubmit} noValidate aria-label={title}>
      <h2 className="workspace-section__title">{title}</h2>

      <div className="form__field">
        <label className="form__label" htmlFor="db-model-name">
          {t('database.form.nameLabel')}
        </label>
        <input
          id="db-model-name"
          type="text"
          className={`form__input${errors.name ? ' form__input--error' : ''}`}
          value={name}
          onChange={(event) => handleNameChange(event.target.value)}
          placeholder={t('database.form.namePlaceholder')}
          maxLength={MODEL_NAME_MAX_LENGTH}
          disabled={isSaving}
          autoFocus
          aria-invalid={Boolean(errors.name)}
          aria-describedby={errors.name ? 'db-model-name-error' : undefined}
        />
        {errors.name ? (
          <p className="form__error" id="db-model-name-error" role="alert">
            {errors.name}
          </p>
        ) : null}
      </div>

      <div className="form__field">
        <label className="form__label" htmlFor="db-model-key">
          {t('database.form.keyLabel')}
        </label>
        <input
          id="db-model-key"
          type="text"
          className={`form__input form-input--mono${errors.key ? ' form__input--error' : ''}`}
          value={key}
          onChange={(event) => handleKeyChange(event.target.value)}
          placeholder={t('database.form.keyPlaceholder')}
          maxLength={MODEL_KEY_MAX_LENGTH}
          disabled={isSaving}
          aria-invalid={Boolean(errors.key)}
          aria-describedby={errors.key ? 'db-model-key-error' : 'db-model-key-hint'}
        />
        {errors.key ? (
          <p className="form__error" id="db-model-key-error" role="alert">
            {errors.key}
          </p>
        ) : (
          <p className="form__hint" id="db-model-key-hint">
            {t('database.form.keyHint')}
          </p>
        )}
      </div>

      <div className="form__field">
        <label className="form__label" htmlFor="db-model-description">
          {t('database.form.descriptionLabel')}
        </label>
        <textarea
          id="db-model-description"
          className="form__input"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder={t('database.form.descriptionPlaceholder')}
          disabled={isSaving}
        />
      </div>

      {error ? (
        <div className="form-notice form-notice--error" role="alert">
          {error}
        </div>
      ) : null}

      <div className="workspace-form__actions">
        <button type="submit" className="btn btn--primary" disabled={isSaving}>
          {isSaving
            ? t('database.form.saving')
            : isEditing
              ? t('database.form.renameSubmit')
              : t('database.form.createSubmit')}
        </button>
        <button type="button" className="btn btn--ghost" onClick={onCancel} disabled={isSaving}>
          {t('database.form.cancel')}
        </button>
      </div>
    </form>
  )
}

export default ModelForm
