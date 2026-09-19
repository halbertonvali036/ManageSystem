import StatusBadge from '@/components/common/StatusBadge'
import { ATTENDANCE_STATUS_LABELS } from '@/models/attendance'

function AttendanceStatusBadge({ status }) {
  return <StatusBadge status={status} labels={ATTENDANCE_STATUS_LABELS} />
}

export default AttendanceStatusBadge