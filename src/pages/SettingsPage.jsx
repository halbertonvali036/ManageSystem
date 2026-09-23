import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import {
  Building2,
  GraduationCap,
  ShieldCheck,
  SlidersHorizontal,
  UserCircle,
  WifiOff,
} from 'lucide-react'
import Card from '@/components/common/Card'
import AcademicSettingsSection from '@/components/settings/AcademicSettingsSection'
import GeneralSettingsSection from '@/components/settings/GeneralSettingsSection'
import PreferencesSettingsSection from '@/components/settings/PreferencesSettingsSection'
import ProfileSettingsSection from '@/components/settings/ProfileSettingsSection'
import SecuritySettingsSection from '@/components/settings/SecuritySettingsSection'
import SettingsActions from '@/components/settings/SettingsActions'
import SettingsSection from '@/components/settings/SettingsSection'
import useSettings from '@/hooks/useSettings'

function SettingsPage() {
  const { hash } = useLocation()
  const {
    values,
    isLoading,
    loadError,
    backendUnavailable,
    refetch,
    dirty,
    isSaving,
    saveError,
    saved,
    updateValue,
    save,
    reset,
  } = useSettings()

  useEffect(() => {
    if (!hash || isLoading) {
      return
    }
    document.getElementById(hash.slice(1))?.scrollIntoView({ block: 'start' })
  }, [hash, isLoading])

  if (isLoading) {
    return (
      <Card>
        <div className="page-status">
          <span className="spinner" aria-hidden="true" />
          Loading settings&hellip;
        </div>
      </Card>
    )
  }

  if (loadError) {
    return (
      <Card>
        <div className="table-state">
          <h3 className="table-state__title">Failed to load settings</h3>
          <p className="table-state__text">{loadError}</p>
          <button type="button" className="btn btn--primary" onClick={refetch}>
            Retry
          </button>
        </div>
      </Card>
    )
  }

  return (
    <div className="settings-page">
      <p className="page-description">
        Configure institution information, academic and system preferences.
      </p>

      {backendUnavailable ? (
        <div className="alert alert--error settings-banner" role="alert">
          <WifiOff size={18} aria-hidden="true" />
          <p>
            Backend API is not connected yet. Settings shown below are default
            placeholders and cannot be saved until the backend API is connected.
          </p>
        </div>
      ) : null}

      <SettingsSection
        title="General Settings"
        description="Institution identity, calendar and locale defaults."
        icon={<Building2 size={20} aria-hidden="true" />}
      >
        <GeneralSettingsSection values={values} onChange={updateValue} />
      </SettingsSection>

      <SettingsSection
        title="Academic Settings"
        description="Grading, attendance and calendar configuration."
        icon={<GraduationCap size={20} aria-hidden="true" />}
      >
        <AcademicSettingsSection />
      </SettingsSection>

      <SettingsSection
        id="admin-profile"
        title="Account / Admin Profile"
        description="Profile information for the signed-in administrator."
        icon={<UserCircle size={20} aria-hidden="true" />}
      >
        <ProfileSettingsSection values={values} onChange={updateValue} />
      </SettingsSection>

      <SettingsSection
        title="System Preferences"
        description="Display and interface preferences."
        icon={<SlidersHorizontal size={20} aria-hidden="true" />}
      >
        <PreferencesSettingsSection values={values} onChange={updateValue} />
      </SettingsSection>

      <SettingsSection
        title="Security Settings"
        description="Password, sessions and account security."
        icon={<ShieldCheck size={20} aria-hidden="true" />}
      >
        <SecuritySettingsSection />
      </SettingsSection>

      <Card>
        <SettingsActions
          dirty={dirty}
          isSaving={isSaving}
          saveError={saveError}
          saved={saved}
          onSave={save}
          onReset={reset}
        />
      </Card>
    </div>
  )
}

export default SettingsPage
