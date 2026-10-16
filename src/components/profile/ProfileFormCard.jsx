import { AlertCircle, Check, RotateCcw, Save } from 'lucide-react'
import Card from '@/components/common/Card'
import SecurityNotice from '@/components/security/SecurityNotice'
import useTranslation from '@/hooks/useTranslation'
import { PROFILE_DISPLAY_NAME_MAX_LENGTH } from '@/models/profile'

/**
 * Editable part of the profile.
 *
 * Only the fields this account actually models are shown: the display name, and
 * the bio/company pair when the session record already carries them. Everything
 * the backend owns stays out of this form.
 *
 * The buttons describe the real state: Save is offered while there is something
 * to save, turns into a spinner while the request runs, and — because the real
 * service is called and no backend answers — ends in the shared "unavailable"
 * notice instead of a success message. Cancel restores the last confirmed
 * values; neither button ever claims a change the backend did not accept.
 */
function ProfileFormCard({
  draft,
  optionalFields,
  displayNameErrorKey,
  dirty,
  canSave,
  isSaving,
  isSaved,
  saveError,
  isSaveUnavailable,
  persistenceAvailable,
  onChange,
  onSave,
  onReset,
}) {
  const { t } = useTranslation()

  return (
    <Card className="profile-editor">
      <header className="profile-editor__header">
        <div className="profile-editor__heading">
          <h2>{t('accountProfile.editableTitle')}</h2>
          <p className="profile-editor__description">
            {t('accountProfile.editableDescription')}
          </p>
        </div>
        {dirty ? (
          <span className="profile-editor__dirty">
            {t('accountProfile.unsavedChanges')}
          </span>
        ) : null}
      </header>

      {!persistenceAvailable ? (
        <SecurityNotice
          tone="pending"
          title={t('accountProfile.profilePersistenceTitle')}
        >
          {t('accountProfile.profilePersistenceNote')}
        </SecurityNotice>
      ) : null}

      <div className="profile-editor__fields">
        <div className="form__field">
          <label className="form__label" htmlFor="profile-display-name">
            {t('accountProfile.displayNameLabel')}
          </label>
          <input
            id="profile-display-name"
            className={`form__input${displayNameErrorKey ? ' form__input--error' : ''}`}
            type="text"
            value={draft.displayName}
            placeholder={t('accountProfile.displayNamePlaceholder')}
            onChange={(event) => onChange('displayName', event.target.value)}
            aria-invalid={Boolean(displayNameErrorKey)}
            aria-describedby={displayNameErrorKey ? 'profile-display-name-error' : undefined}
            disabled={isSaving}
            autoComplete="name"
          />
          {displayNameErrorKey ? (
            <p className="form__error" id="profile-display-name-error">
              {t(displayNameErrorKey, { max: PROFILE_DISPLAY_NAME_MAX_LENGTH })}
            </p>
          ) : null}
        </div>

        {optionalFields.map((field) => (
          <div className="form__field" key={field.key}>
            <label className="form__label" htmlFor={`profile-${field.key}`}>
              {t(field.labelKey)}
            </label>
            {field.multiline ? (
              <textarea
                id={`profile-${field.key}`}
                className="form__input"
                rows={3}
                maxLength={field.maxLength}
                value={draft[field.key] ?? ''}
                placeholder={t(field.placeholderKey)}
                onChange={(event) => onChange(field.key, event.target.value)}
                disabled={isSaving}
              />
            ) : (
              <input
                id={`profile-${field.key}`}
                className="form__input"
                type="text"
                maxLength={field.maxLength}
                value={draft[field.key] ?? ''}
                placeholder={t(field.placeholderKey)}
                onChange={(event) => onChange(field.key, event.target.value)}
                disabled={isSaving}
              />
            )}
          </div>
        ))}
      </div>

      {saveError ? (
        <div className="form__error-area" role="alert">
          <AlertCircle size={16} aria-hidden="true" />
          <span>
            {isSaveUnavailable
              ? t('accountProfile.profileSaveUnavailable')
              : t('accountProfile.profileSaveFailed')}
          </span>
        </div>
      ) : null}

      {isSaved && !saveError ? (
        <p className="profile-saved" role="status">
          <Check size={14} aria-hidden="true" />
          {t('accountProfile.profileSaved')}
        </p>
      ) : null}

      <div className="profile-editor__actions">
        <button
          type="button"
          className="btn btn--primary btn--icon-left"
          onClick={onSave}
          disabled={!canSave}
          aria-busy={isSaving}
        >
          {isSaving ? (
            <span className="spinner" aria-hidden="true" />
          ) : (
            <Save size={16} aria-hidden="true" />
          )}
          {isSaving ? t('common.saving') : t('accountProfile.saveChanges')}
        </button>
        <button
          type="button"
          className="btn btn--outline btn--icon-left"
          onClick={onReset}
          disabled={!dirty || isSaving}
        >
          <RotateCcw size={16} aria-hidden="true" />
          {t('common.cancel')}
        </button>
      </div>
    </Card>
  )
}

export default ProfileFormCard
