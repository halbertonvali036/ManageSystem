import {
  ACADEMIC_YEAR_OPTIONS,
  SETTINGS_LANGUAGES,
  SETTINGS_SEMESTERS,
  SETTINGS_TIMEZONES,
} from '@/models/settings'
import {
  SettingsInput,
  SettingsSelect,
  SettingsTextArea,
} from '@/components/settings/SettingsInputs'

function GeneralSettingsSection({ values, onChange }) {
  return (
    <div className="settings-grid">
      <SettingsInput
        field="schoolName"
        label="School / Institution Name"
        value={values.schoolName}
        onChange={onChange}
        placeholder="e.g. Springfield High School"
      />
      <SettingsInput
        field="institutionEmail"
        label="Institution Email"
        type="email"
        value={values.institutionEmail}
        onChange={onChange}
        placeholder="admin@school.edu"
      />
      <SettingsInput
        field="phone"
        label="Phone"
        type="tel"
        value={values.phone}
        onChange={onChange}
        placeholder="+1 555 000 0000"
      />
      <SettingsTextArea
        field="address"
        label="Address"
        value={values.address}
        onChange={onChange}
      />
      <SettingsSelect
        field="academicYear"
        label="Academic Year"
        value={values.academicYear}
        onChange={onChange}
        options={ACADEMIC_YEAR_OPTIONS}
      />
      <SettingsSelect
        field="semester"
        label="Semester"
        value={values.semester}
        onChange={onChange}
        options={SETTINGS_SEMESTERS}
      />
      <SettingsSelect
        field="timezone"
        label="Timezone"
        value={values.timezone}
        onChange={onChange}
        options={SETTINGS_TIMEZONES}
      />
      <SettingsSelect
        field="defaultLanguage"
        label="Default Language"
        value={values.defaultLanguage}
        onChange={onChange}
        options={SETTINGS_LANGUAGES}
      />
    </div>
  )
}

export default GeneralSettingsSection