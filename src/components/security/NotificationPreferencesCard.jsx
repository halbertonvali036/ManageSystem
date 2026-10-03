import useAccountCopy from '@/hooks/useAccountCopy'
import useTranslation from '@/hooks/useTranslation'
import { AlertCircle, BellRing, Check, Mail, RotateCcw, Save } from 'lucide-react'
import PreferenceSwitch from '@/components/settings/PreferenceSwitch'
import SecurityNotice from '@/components/security/SecurityNotice'
import SecuritySection from '@/components/security/SecuritySection'
import useNotificationPreferences from '@/hooks/useNotificationPreferences'
import { getRequestErrorMessage } from '@/services/httpClient'
import {
  NOTIFICATION_PREFERENCE_FIELDS,
  NOTIFICATION_PREFERENCE_CHANNEL,
} from '@/models/notificationPreferences'

/**
 * Notification preferences.
 *
 * The toggles describe what the signed-in user wants to hear about. They are
 * the frontend for a backend-owned record: while no notification service is
 * connected the switches are disabled, the values are shown as unknown, and
 * saving is impossible — nothing here claims a preference or an email
 * preference has been applied.
 */
function NotificationPreferencesCard() {
  const copy = useAccountCopy()
  const { t } = useTranslation()
  const {
    draft,
    isLoading,
    isAvailable,
    loadError,
    dirty,
    isSaving,
    isSaved,
    saveError,
    setPreference,
    save,
    reset,
    refetch,
  } = useNotificationPreferences()

  const emailField = NOTIFICATION_PREFERENCE_FIELDS.find(
    (field) => field.channel === NOTIFICATION_PREFERENCE_CHANNEL.EMAIL,
  )

  return (
    <SecuritySection
      id="notification-preferences"
      className="notification-preferences-section"
      eyebrow={t('accountPolish.notifications')}
      title={t('accountPolish.notificationPreferences')}
      description={t('accountPolish.chooseWhichUpdatesReachYouInsideThePortalEmail')}
      icon={<BellRing size={20} aria-hidden="true" />}
    >
      {isLoading ? (
        <div className="page-status" role="status">
          <span className="spinner" aria-hidden="true" />{t('accountPolish.loadingNotificationPreferencesHellip')}</div>
      ) : loadError ? (
        <div className="table-state table-state--error" role="alert">
          <h3 className="table-state__title">{t('accountPolish.preferencesCouldNotBeLoaded')}</h3>
          <p className="table-state__text">{getRequestErrorMessage(loadError)}</p>
          <button type="button" className="btn btn--primary" onClick={refetch}>{t('accountPolish.tryAgain')}</button>
        </div>
      ) : (
        <>
          {!isAvailable ? (
            <SecurityNotice tone="pending" title={t('accountPolish.notConnectedYet')}>{t('accountPolish.preferencesAreStoredByTheNotificationServiceUntilIt')}</SecurityNotice>
          ) : null}

          <div className="preference-list">
            {NOTIFICATION_PREFERENCE_FIELDS.map((field) => (
              <PreferenceSwitch
                key={field.key}
                label={copy(field.label)}
                description={copy(field.description)}
                checked={Boolean(draft[field.key])}
                unknown={!isAvailable}
                disabled={isSaving}
                isPending={isSaving}
                onChange={(value) => setPreference(field.key, value)}
              />
            ))}
          </div>

          {saveError ? (
            <div className="form__error-area" role="alert">
              <AlertCircle size={16} aria-hidden="true" />
              <span>{saveError}</span>
            </div>
          ) : null}

          {isSaved && !saveError ? (
            <p className="preference-saved" role="status">
              <Check size={14} aria-hidden="true" />{t('accountPolish.preferencesSaved')}</p>
          ) : null}

          <div className="preference-actions">
            <button
              type="button"
              className="btn btn--primary btn--icon-left"
              onClick={save}
              disabled={!isAvailable || !dirty || isSaving}
              aria-busy={isSaving}
            >
              {isSaving ? (
                <span className="spinner" aria-hidden="true" />
              ) : (
                <Save size={16} aria-hidden="true" />
              )}
              {isSaving ? copy('Saving…') : copy('Save preferences')}
            </button>

            <button
              type="button"
              className="btn btn--outline btn--icon-left"
              onClick={reset}
              disabled={!isAvailable || !dirty || isSaving}
            >
              <RotateCcw size={16} aria-hidden="true" />{t('accountPolish.discardChanges')}</button>
          </div>

          {emailField ? (
            <p className="preference-footnote">
              <Mail size={14} aria-hidden="true" />{t('accountPolish.emailNotificationsNeedABackendDeliveryServiceThisApp')}</p>
          ) : null}
        </>
      )}
    </SecuritySection>
  )
}

export default NotificationPreferencesCard
