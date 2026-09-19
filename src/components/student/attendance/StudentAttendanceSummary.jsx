import { CalendarDays, CheckCircle2, ClipboardCheck, Clock3, Percent, XCircle } from 'lucide-react'
import StatCard from '@/components/common/StatCard'
import { ATTENDANCE_STATUS } from '@/models/attendance'

const computeAttendanceSummary = (records) => {
  const total = records.length
  const present = records.filter(
    (record) => record.status === ATTENDANCE_STATUS.PRESENT,
  ).length
  const absent = records.filter(
    (record) => record.status === ATTENDANCE_STATUS.ABSENT,
  ).length
  const late = records.filter(
    (record) => record.status === ATTENDANCE_STATUS.LATE,
  ).length
  const excused = records.filter(
    (record) => record.status === ATTENDANCE_STATUS.EXCUSED,
  ).length
  const percentage =
    total > 0 ? Math.round(((present + late) / total) * 100) : null
  return { total, present, absent, late, excused, percentage }
}

function StudentAttendanceSummary({ records }) {
  const summary = computeAttendanceSummary(records)

  return (
    <div className="stats-grid student-attendance-stats" aria-label="Attendance summary">
      <StatCard
        icon={CalendarDays}
        label="Total Classes"
        value={summary.total}
      />
      <StatCard
        icon={CheckCircle2}
        label="Present"
        value={summary.present}
        accent="success"
      />
      <StatCard
        icon={XCircle}
        label="Absent"
        value={summary.absent}
        accent="danger"
      />
      <StatCard
        icon={Clock3}
        label="Late"
        value={summary.late}
        accent="warning"
      />
      <StatCard
        icon={ClipboardCheck}
        label="Excused"
        value={summary.excused}
      />
      <StatCard
        icon={Percent}
        label="Attendance"
        value={summary.percentage === null ? '—' : `${summary.percentage}%`}
      />
    </div>
  )
}

export default StudentAttendanceSummary