import {
  CalendarClock,
  CalendarDays,
  GraduationCap,
  Users,
} from 'lucide-react'
import SettingsPlaceholder from '@/components/settings/SettingsPlaceholder'

function AcademicSettingsSection() {
  return (
    <div className="settings-placeholder-stack">
      <SettingsPlaceholder
        title="Default grading configuration"
        text="Grading scales and rules will be configurable when the backend API is connected."
        actionLabel="Configure Grading"
        icon={<GraduationCap size={16} aria-hidden="true" />}
      />
      <SettingsPlaceholder
        title="Attendance settings"
        text="Attendance rules and thresholds will be configurable when the backend API is connected."
        actionLabel="Configure Attendance"
        icon={<CalendarClock size={16} aria-hidden="true" />}
      />
      <SettingsPlaceholder
        title="Class capacity defaults"
        text="Default class capacity will be configurable when the backend API is connected."
        actionLabel="Configure Classes"
        icon={<Users size={16} aria-hidden="true" />}
      />
      <SettingsPlaceholder
        title="Academic calendar"
        text="Term dates and calendar configuration will be available when the backend API is connected."
        actionLabel="Open Calendar"
        icon={<CalendarDays size={16} aria-hidden="true" />}
      />
    </div>
  )
}

export default AcademicSettingsSection