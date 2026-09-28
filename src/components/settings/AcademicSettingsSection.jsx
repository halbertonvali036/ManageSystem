import {
  CalendarClock,
  CalendarDays,
  GraduationCap,
  Users,
} from 'lucide-react'
import SettingsPlaceholder from '@/components/settings/SettingsPlaceholder'

/**
 * Academic configuration the backend will own.
 *
 * Each block names the setting and the scope it will cover, and is marked
 * backend-required. No default grade, threshold, capacity or date is invented
 * here, and nothing is editable until the matching endpoint exists — the
 * editable equivalents already live elsewhere (academic years, classes,
 * attendance and assessments) and remain the real surfaces for those records.
 */
function AcademicSettingsSection() {
  return (
    <div className="settings-placeholder-stack">
      <SettingsPlaceholder
        title="Grading configuration"
        text="Grading scale, pass marks and rounding rules applied across every course. Read and saved by the backend; no default is assumed here."
        icon={<GraduationCap size={16} aria-hidden="true" />}
      />
      <SettingsPlaceholder
        title="Attendance configuration"
        text="Thresholds, grace and late rules, and how absences affect eligibility. Defined by the institution and served by the backend."
        icon={<CalendarClock size={16} aria-hidden="true" />}
      />
      <SettingsPlaceholder
        title="Class capacity defaults"
        text="Default capacity and enrolment limits applied when a class is created. Owned by the backend; individual classes keep their own capacity."
        icon={<Users size={16} aria-hidden="true" />}
      />
      <SettingsPlaceholder
        title="Academic calendar"
        text="Institution-wide term dates, add/drop deadlines and holiday entries. Dates already recorded per academic year stay managed on the Academic Years pages."
        icon={<CalendarDays size={16} aria-hidden="true" />}
      />
    </div>
  )
}

export default AcademicSettingsSection
